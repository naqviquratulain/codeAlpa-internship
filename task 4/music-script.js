// --- Song Data (Using reliable SoundHelix MP3s for testing) ---
const songs = [
    { title: "Song One", artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { title: "Song Two", artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { title: "Song Three", artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

// --- State ---
let songIndex = 0;
let isPlaying = false;

// --- DOM Elements ---
const audio = new Audio(); // Create audio element in JS
const coverImg = document.getElementById('cover-img');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volume-slider');
const autoplayCheckbox = document.getElementById('autoplay');
const playlistEl = document.getElementById('playlist');

// --- Initialization ---
function init() {
    loadSong(songs[songIndex]);
    renderPlaylist();
    audio.volume = volumeSlider.value;
}

// --- Core Functions ---
function loadSong(song) {
    titleEl.innerText = song.title;
    artistEl.innerText = song.artist;
    audio.src = song.src;
    updatePlaylistUI();
}

function playSong() {
    isPlaying = true;
    playBtn.innerHTML = "&#10074;&#10074;"; // Pause icon
    coverImg.classList.add('playing');
    audio.play();
}

function pauseSong() {
    isPlaying = false;
    playBtn.innerHTML = "&#9654;"; // Play icon
    coverImg.classList.remove('playing');
    audio.pause();
}

function prevSong() {
    songIndex--;
    if (songIndex < 0) songIndex = songs.length - 1;
    loadSong(songs[songIndex]);
    if (isPlaying) playSong();
}

function nextSong() {
    songIndex++;
    if (songIndex > songs.length - 1) songIndex = 0;
    loadSong(songs[songIndex]);
    if (isPlaying) playSong();
}

function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    
    // Update progress bar width
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        // Calculate display time
        const durationMinutes = Math.floor(duration / 60);
        let durationSeconds = Math.floor(duration % 60);
        if (durationSeconds < 10) durationSeconds = `0${durationSeconds}`;
        durationEl.innerText = `${durationMinutes}:${durationSeconds}`;
    }
    
    // Update current time display
    const currentMinutes = Math.floor(currentTime / 60);
    let currentSeconds = Math.floor(currentTime % 60);
    if (currentSeconds < 10) currentSeconds = `0${currentSeconds}`;
    currentTimeEl.innerText = `${currentMinutes}:${currentSeconds}`;
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
}

// --- Playlist UI ---
function renderPlaylist() {
    playlistEl.innerHTML = '';
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${song.title}</span> <span>${song.artist}</span>`;
        li.addEventListener('click', () => {
            songIndex = index;
            loadSong(songs[songIndex]);
            playSong();
        });
        playlistEl.appendChild(li);
    });
}

function updatePlaylistUI() {
    const items = playlistEl.querySelectorAll('li');
    items.forEach((item, index) => {
        if (index === songIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// --- Event Listeners ---
playBtn.addEventListener('click', () => isPlaying ? pauseSong() : playSong());
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
audio.addEventListener('timeupdate', updateProgress);
progressContainer.addEventListener('click', setProgress);

// Autoplay next song when current ends
audio.addEventListener('ended', () => {
    if (autoplayCheckbox.checked) {
        nextSong();
    } else {
        pauseSong();
        progressBar.style.width = '0%';
        currentTimeEl.innerText = '0:00';
    }
});

// Volume Control
volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// Keyboard support (Spacebar to Play/Pause)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        isPlaying ? pauseSong() : playSong();
    }
});

// Start App
init();