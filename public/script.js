const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const volumeSlider = document.getElementById('volumeSlider');
const timeDisplay = document.getElementById('timeDisplay');

const streamUrl = 'https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8';
let isPlaying = false;
let hls;

// Initialize HLS.js
function initializePlayer() {
    if (Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        
        hls.loadSource(streamUrl);
        hls.attachMedia(audio);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS manifest loaded, ready to play');
            timeDisplay.textContent = '0:00 / Live';
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        timeDisplay.textContent = 'Network error - Retrying...';
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        timeDisplay.textContent = 'Media error - Recovering...';
                        hls.recoverMediaError();
                        break;
                    default:
                        timeDisplay.textContent = 'Fatal error - Please refresh';
                        hls.destroy();
                        break;
                }
            }
        });
        
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        audio.src = streamUrl;
        timeDisplay.textContent = '0:00 / Live';
    } else {
        timeDisplay.textContent = 'HLS not supported';
    }
}

// Play/Pause functionality
playBtn.addEventListener('click', () => {
    if (!isPlaying) {
        audio.play().then(() => {
            isPlaying = true;
            playBtn.textContent = '⏸';
            timeDisplay.textContent = '0:35 / Live';
        }).catch(error => {
            console.error('Playback failed:', error);
            timeDisplay.textContent = 'Playback failed';
        });
    } else {
        audio.pause();
        isPlaying = false;
        playBtn.textContent = '▶';
        timeDisplay.textContent = 'Paused';
    }
});

// Volume control
volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value / 100;
});

// Set initial volume
audio.volume = 0.5;

// Audio event listeners
audio.addEventListener('waiting', () => {
    timeDisplay.textContent = 'Buffering...';
});

audio.addEventListener('playing', () => {
    timeDisplay.textContent = '0:35 / Live';
});

audio.addEventListener('ended', () => {
    isPlaying = false;
    playBtn.textContent = '▶';
    timeDisplay.textContent = 'Stream ended';
});

// Track data functions
async function fetchCurrentTrack() {
    try {
        console.log('Fetching current track...');
        const response = await fetch('/api/current-track');
        const data = await response.json();
        console.log('Current track data:', data);
        updateCurrentTrack(data.track);
    } catch (error) {
        console.error('Error fetching current track:', error);
    }
}

async function fetchRecentTracks() {
    try {
        console.log('Fetching recent tracks...');
        const response = await fetch('/api/recent-tracks');
        const data = await response.json();
        console.log('Recent tracks data:', data);
        updateRecentTracks(data.tracks);
    } catch (error) {
        console.error('Error fetching recent tracks:', error);
    }
}

function updateCurrentTrack(track) {
    console.log('Updating current track with:', track);
    const currentTrackElement = document.getElementById('currentTrack');
    const currentArtistElement = document.getElementById('currentArtist');
    const currentArtistLastElement = document.getElementById('currentArtistLast');
    const albumArtElement = document.getElementById('albumArt');
    const albumInfoElement = document.getElementById('albumInfo');
    const yearBadgeElement = document.getElementById('yearBadge');
    const artistBannerElement = document.getElementById('artistBanner');
    
    // Parse artist name 
    const artist = track.artist || 'Unknown Artist';
    const artistWords = artist.split(' ');
    
    if (artistWords.length > 1) {
        currentArtistElement.textContent = artistWords[0];
        currentArtistLastElement.textContent = artistWords.slice(1).join(' ');
        currentArtistLastElement.style.display = 'block';
        // Update banner with first name in uppercase
        artistBannerElement.textContent = artistWords[0].toUpperCase();
    } else {
        currentArtistElement.textContent = artist;
        currentArtistLastElement.style.display = 'none';
        // Update banner with full name in uppercase
        artistBannerElement.textContent = artist.toUpperCase();
    }
    
    // Update track title 
    currentTrackElement.textContent = track.title || 'Unknown Track';
    
    // Update album info
    albumInfoElement.textContent = track.album || 'Unknown Album';
    
    // Extract year from track title or use default
    const yearMatch = track.title?.match(/\((\d{4})\)/);
    if (yearBadgeElement) {
        yearBadgeElement.textContent = yearMatch ? yearMatch[1] : '1983';
    }
    
    // Force refresh album art by adding timestamp to prevent caching
    const newSrc = `/api/album-art?t=${Date.now()}`;
    console.log('Loading album art:', newSrc);
    
    albumArtElement.onload = () => {
        console.log('Album art loaded successfully');
    };
    
    albumArtElement.onerror = () => {
        console.error('Album art failed to load:', newSrc);
        // Don't hide the image, just log the error
    };
    
    albumArtElement.src = newSrc;
    
    if (track.title && track.artist && track.title !== '--') {
        loadTrackRatings(track.title, track.artist);
    }
}

function updateRecentTracks(tracks) {
    const recentTracksElement = document.getElementById('recentTracks');
    
    if (!tracks || tracks.length === 0) {
        recentTracksElement.innerHTML = `
            <div class="recent-track">
                <div class="recent-track-artist">TLC:</div>
                <div class="recent-track-title">Ain't 2 Proud 2 Beg</div>
            </div>
            <div class="recent-track">
                <div class="recent-track-artist">The Raconteurs:</div>
                <div class="recent-track-title">Steady, As She Goes</div>
            </div>
            <div class="recent-track">
                <div class="recent-track-artist">Mick Jagger:</div>
                <div class="recent-track-title">Just Another Night</div>
            </div>
            <div class="recent-track">
                <div class="recent-track-artist">Beyoncé:</div>
                <div class="recent-track-title">Irreplaceable (Album Version)</div>
            </div>
            <div class="recent-track">
                <div class="recent-track-artist">Etta James:</div>
                <div class="recent-track-title">I'd Rather Go Blind</div>
            </div>
        `;
        return;
    }

    recentTracksElement.innerHTML = tracks.map(track => `
        <div class="recent-track">
            <div class="recent-track-artist">${track.artist}:</div>
            <div class="recent-track-title">${track.title}</div>
        </div>
    `).join('');
}

// Update track info every 30 seconds
function startTrackUpdates() {
    fetchCurrentTrack();
    fetchRecentTracks();
    
    setInterval(() => {
        fetchCurrentTrack();
        fetchRecentTracks();
    }, 30000);
}

// Rating functions
let currentTrackData = null;

async function loadTrackRatings(title, artist) {
    try {
        const [ratingsResponse, userRatingResponse] = await Promise.all([
            fetch(`/api/song-ratings?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`),
            fetch(`/api/user-rating?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`)
        ]);
        
        const ratingsData = await ratingsResponse.json();
        const userRatingData = await userRatingResponse.json();
        
        document.getElementById('thumbsUpCount').textContent = ratingsData.thumbs_up;
        document.getElementById('thumbsDownCount').textContent = ratingsData.thumbs_down;
        
        const thumbsUpBtn = document.getElementById('thumbsUpBtn');
        const thumbsDownBtn = document.getElementById('thumbsDownBtn');
        
        thumbsUpBtn.classList.remove('active');
        thumbsDownBtn.classList.remove('active');
        
        if (userRatingData.rating === 1) {
            thumbsUpBtn.classList.add('active');
        } else if (userRatingData.rating === -1) {
            thumbsDownBtn.classList.add('active');
        }
        
        currentTrackData = { title, artist };
    } catch (error) {
        console.error('Error loading track ratings:', error);
    }
}

async function rateSong(rating) {
    if (!currentTrackData) return;
    
    try {
        const response = await fetch('/api/rate-song', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: currentTrackData.title,
                artist: currentTrackData.artist,
                rating: rating
            })
        });
        
        if (response.ok) {
            loadTrackRatings(currentTrackData.title, currentTrackData.artist);
        }
    } catch (error) {
        console.error('Error rating song:', error);
    }
}

// Immediate execution when script loads
console.log('Script is running...');

// Test if we can access DOM elements
console.log('Testing DOM access...');
const testElement = document.getElementById('currentTrack');
if (testElement) {
    testElement.textContent = 'TESTING - DOM access works!';
    console.log('Successfully updated currentTrack element');
} else {
    console.error('Could not find currentTrack element');
}

// Force immediate API calls
console.log('Making immediate API calls...');
fetch('/api/current-track')
    .then(response => response.json())
    .then(data => {
        console.log('Direct API call result:', data);
        if (data.track) {
            document.getElementById('currentTrack').textContent = data.track.title;
            document.getElementById('currentArtist').textContent = data.track.artist;
            document.getElementById('albumInfo').textContent = data.track.album || 'No album info';
        }
    })
    .catch(error => console.error('Direct API call failed:', error));

// Initialize the player when page loads
window.addEventListener('load', () => {
    console.log('Page loaded, initializing...');
    initializePlayer();
    startTrackUpdates();
    console.log('Initialization complete');
});