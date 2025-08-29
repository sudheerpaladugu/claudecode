const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Generate consistent user fingerprint based on IP and User-Agent
function generateUserFingerprint(req) {
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const combined = `${ip}-${userAgent}`;
  return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 16);
}

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      track_title TEXT NOT NULL,
      track_artist TEXT NOT NULL,
      user_fingerprint TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating IN (1, -1)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(track_title, track_artist, user_fingerprint)
    )`);
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Dynamic album art endpoint that changes based on current track
app.get('/conver.jpg', (req, res) => {
  db.get('SELECT * FROM tracks ORDER BY played_at DESC LIMIT 1', [], (err, row) => {
    if (err) {
      console.error('Error fetching current track for album art:', err);
      // Fallback to default album art
      return res.sendFile(path.join(__dirname, 'public', 'conver.jpg'));
    }
    
    // For now, serve different placeholder images based on track ID
    // In a real implementation, this would serve actual album art files
    let albumArtPath;
    if (row && row.id) {
      // Create different album art based on track ID
      const artOptions = ['RadioCalicoLogoTM.png', 'RadioCalicoLayout.png'];
      const selectedArt = artOptions[row.id % artOptions.length];
      albumArtPath = path.join(__dirname, selectedArt);
    } else {
      albumArtPath = path.join(__dirname, 'public', 'conver.jpg');
    }
    
    // Set headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.sendFile(albumArtPath, (err) => {
      if (err) {
        console.error('Error serving album art:', err);
        res.sendFile(path.join(__dirname, 'public', 'conver.jpg'));
      }
    });
  });
});

app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ users: rows });
  });
});

app.post('/users', (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, email });
  });
});

// Get current track
app.get('/api/current-track', (req, res) => {
  console.log('API: /api/current-track requested');
  db.get('SELECT * FROM tracks ORDER BY played_at DESC LIMIT 1', [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ track: row || { title: 'Radio Calico', artist: 'Live Stream' } });
  });
});

// Get recently played tracks (last 5)
app.get('/api/recent-tracks', (req, res) => {
  console.log('API: /api/recent-tracks requested');
  db.all('SELECT * FROM tracks ORDER BY played_at DESC LIMIT 5 OFFSET 1', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ tracks: rows });
  });
});

// Add a new track (for simulating track changes)
app.post('/api/track', (req, res) => {
  const { title, artist } = req.body;
  
  if (!title || !artist) {
    return res.status(400).json({ error: 'Title and artist are required' });
  }
  
  db.run('INSERT INTO tracks (title, artist) VALUES (?, ?)', [title, artist], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, title, artist });
  });
});

// Rate a song
app.post('/api/rate-song', (req, res) => {
  const { title, artist, rating } = req.body;
  const userFingerprint = generateUserFingerprint(req);
  
  if (!title || !artist || ![1, -1].includes(rating)) {
    return res.status(400).json({ error: 'Title, artist, and valid rating (1 or -1) are required' });
  }
  
  db.run('INSERT OR REPLACE INTO ratings (track_title, track_artist, user_fingerprint, rating) VALUES (?, ?, ?, ?)', 
    [title, artist, userFingerprint, rating], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, rating });
  });
});

// Get ratings for a song
app.get('/api/song-ratings', (req, res) => {
  const { title, artist } = req.query;
  
  if (!title || !artist) {
    return res.status(400).json({ error: 'Title and artist are required' });
  }
  
  db.all(`
    SELECT 
      SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as thumbs_up,
      SUM(CASE WHEN rating = -1 THEN 1 ELSE 0 END) as thumbs_down
    FROM ratings 
    WHERE track_title = ? AND track_artist = ?
  `, [title, artist], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const result = rows[0] || { thumbs_up: 0, thumbs_down: 0 };
    res.json({ 
      thumbs_up: result.thumbs_up || 0, 
      thumbs_down: result.thumbs_down || 0 
    });
  });
});

// Check if user has already rated a song
app.get('/api/user-rating', (req, res) => {
  const { title, artist } = req.query;
  const userFingerprint = generateUserFingerprint(req);
  
  if (!title || !artist) {
    return res.status(400).json({ error: 'Title and artist are required' });
  }
  
  db.get('SELECT rating FROM ratings WHERE track_title = ? AND track_artist = ? AND user_fingerprint = ?', 
    [title, artist, userFingerprint], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ rating: row ? row.rating : null });
  });
});

// Dynamic album art endpoint based on current track
app.get('/api/album-art', (req, res) => {
  // Get current track from database
  db.get('SELECT * FROM tracks ORDER BY played_at DESC LIMIT 1', [], (err, row) => {
    if (err) {
      console.error('Error fetching current track:', err);
      return res.sendFile(path.join(__dirname, 'public', 'cover.jpg'));
    }
    
    const fs = require('fs');
    
    // Try to find track-specific album art
    if (row && row.title && row.artist) {
      // Create filename from title and artist (same logic as existing file)
      const filename = `${row.title}_${row.artist}`.replace(/[^a-zA-Z0-9_]/g, '_') + '.jpg';
      const trackArtPath = path.join(__dirname, 'public', 'covers', filename);
      
      console.log(`Looking for album art: ${filename}`);
      
      if (fs.existsSync(trackArtPath)) {
        console.log(`Found specific album art for ${row.title} by ${row.artist}`);
        return res.sendFile(trackArtPath);
      }
    }
    
    // Fallback to generic album art based on track ID to create variety
    const defaultCovers = ['cover.jpg', 'conver.jpg', 'logo.png'];
    const coverIndex = row ? (row.id % defaultCovers.length) : 0;
    const fallbackCover = defaultCovers[coverIndex];
    
    console.log(`Using fallback album art: ${fallbackCover} for track ${row ? row.title : 'unknown'}`);
    const fallbackPath = path.join(__dirname, 'public', fallbackCover);
    res.sendFile(fallbackPath);
  });
});

// Create covers directory if it doesn't exist
const fs = require('fs');
const coversDir = path.join(__dirname, 'public', 'covers');
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});