# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Radio Calico is a live streaming radio web application that plays lossless HLS streams with track information, user ratings, and album artwork. The application serves a single-page web interface with real-time track updates and user interaction features.

## Architecture

- **Frontend**: Single-page HTML application with separated CSS and JavaScript files
- **Backend**: Express.js server with SQLite database
- **Streaming**: HLS (HTTP Live Streaming) using hls.js library
- **Database**: SQLite with three main tables: users, tracks, ratings
- **Code Organization**: Clean separation of concerns - HTML structure, CSS styling, and JavaScript behavior in separate files

## Development Commands

- `npm start &` - Start the Express.js development server (runs on port 3000)
- `npm run dev` - Alternative start command (same as npm start)
- **Important**: Server should run in background - avoid blocking the terminal
- No build, lint, or test commands are configured in package.json

## Key Components

### Server (server.js)
- Express.js server handling both API endpoints and static file serving
- SQLite database with automatic table creation on startup
- User fingerprinting system for ratings (IP + User-Agent based)
- Dynamic album art serving based on current track
- CORS enabled for development

### Database Schema
- **users**: id, name, email, created_at
- **tracks**: id, title, artist, played_at  
- **ratings**: id, track_title, track_artist, user_fingerprint, rating, created_at

### Key API Endpoints
- `GET /api/current-track` - Current playing track info
- `GET /api/recent-tracks` - Last 5 played tracks
- `POST /api/track` - Add new track (for simulation)
- `POST /api/rate-song` - Rate a track (+1 or -1)
- `GET /api/song-ratings` - Get thumbs up/down counts
- `GET /api/user-rating` - Check if user already rated
- `GET /api/album-art` - Dynamic album art serving
- `GET /conver.jpg` - Alternative album art endpoint

### Frontend Features
- HLS streaming with fallback support
- Real-time track updates every 30 seconds
- User rating system (thumbs up/down)
- Dynamic album art display
- Recently played tracks widget
- Volume controls and play/pause functionality

## Streaming Configuration

- **Stream URL**: https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8
- **Format**: HLS (HTTP Live Streaming)
- **Quality**: 48kHz FLAC / HLS Lossless
- **Library**: hls.js for browser compatibility

## Brand & Styling

The application follows the Radio Calico brand guidelines defined in `RadioCalico_Style_Guide.txt`:

- **Colors**: Mint (#D8F2D5), Forest Green (#1F4E23), Teal (#38A29D), Calico Orange (#EFA63C)
- **Typography**: Montserrat for headings, Open Sans for body text
- **Logo**: Available as RadioCalicoLogoTM.png
- **Layout Reference**: RadioCalicoLayout.png shows the intended design

## Style Guide
- A text version of the styling guide for the webpage is at /Users/sudheerpaladugu/radiocalico/RadioCalico_Style_Guide.txt
- The Radio Calico logo is at /Users/sudheerpaladugu/radiocalico/RadioCalicoLogoTM.png

## File Structure

- `server.js` - Main Express server and API endpoints
- `public/index.html` - Main application HTML structure (clean, no inline styles/scripts)
- `public/styles.css` - All CSS styling rules and responsive design
- `public/script.js` - All JavaScript functionality (HLS player, API calls, UI updates)
- `public/covers/` - Track-specific album artwork
- `public/` - Other static assets (images, logos)
- `database.db` - SQLite database file
- `RadioCalico_Style_Guide.txt` - Brand guidelines
- `stream_URL.txt` - HLS stream endpoint

## Development Notes

- Album art system supports both generic fallbacks and track-specific artwork
- User identification uses browser fingerprinting (IP + User-Agent)
- Track updates happen automatically every 30 seconds
- Rating system prevents duplicate votes per user/track combination
- No authentication required - uses persistent browser fingerprints

## Testing Track Updates

To simulate track changes for development/testing:
```bash
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Song","artist":"Test Artist"}'
```

## Common Development Patterns

- **Adding new tracks**: Use the POST /api/track endpoint to simulate new songs
- **Album art**: Place track-specific artwork in `public/covers/` with format `Title_Artist.jpg`
- **Styling changes**: Edit `public/styles.css` following brand colors and typography defined in style guide
- **JavaScript changes**: Edit `public/script.js` for functionality updates (player controls, API calls, UI updates)
- **HTML structure changes**: Edit `public/index.html` for layout modifications (avoid adding inline styles/scripts)
- **Database changes**: SQLite tables auto-create on server startup - no migrations needed

## Code Organization Best Practices

- **Separation of concerns**: HTML (structure), CSS (styling), and JavaScript (behavior) are in separate files
- **No inline styles or scripts**: Keep HTML clean and maintainable
- **External dependencies**: hls.js library loaded via CDN in HTML head
- **Asset organization**: Static files served from `public/` directory by Express