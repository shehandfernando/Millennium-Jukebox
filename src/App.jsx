import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [theme, setTheme] = useState('metal'); 
  const [isDialing, setIsDialing] = useState(false);
  
  // NEW: State for time tracking
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);

  const currentTrack = playlist[currentTrackIndex];

  // --- TIME FORMATTING HELPER ---
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || !timeInSeconds) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // --- AUDIO & VISUALIZER SETUP ---
  const setupAudioContext = () => {
    if (!audioContextRef.current && audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      analyserRef.current.fftSize = 64; 
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyserRef.current.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;
      ctx.fillStyle = theme === 'cyber' ? '#ff00ff' : '#00ff00';
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
    
    animationRef.current = requestAnimationFrame(drawVisualizer);
  };

  useEffect(() => {
    if (isPlaying) {
      drawVisualizer();
    } else {
      cancelAnimationFrame(animationRef.current);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, theme]);

  // --- API INTERNET RADIO FETCH ---
  const streamFromInternet = async (e) => {
    const genre = e.target.value;
    if (!genre) return;
    
    setIsDialing(true);
    if (isPlaying) togglePlayPause();

    try {
      const hostResp = await fetch('https://api.audius.co');
      const hosts = await hostResp.json();
      const activeHost = hosts.data[0];

      const tracksResp = await fetch(`${activeHost}/v1/tracks/trending?genre=${genre}&app_name=millennium_jukebox`);
      const tracksData = await tracksResp.json();

      const newTracks = tracksData.data.map((track) => ({
        id: track.id,
        title: `${track.user.name} - ${track.title}`,
        url: `${activeHost}/v1/tracks/${track.id}/stream?app_name=millennium_jukebox`
      }));

      setPlaylist(newTracks);
      setCurrentTrackIndex(0);
      setIsPlaying(true);
      setupAudioContext();
    } catch (error) {
      console.error("Radio stream failed:", error);
      alert("Lost connection to the mainframe. Try another genre.");
    }
    setIsDialing(false);
    e.target.value = ""; 
  };

  // --- CONTROLS LOGIC ---
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const newTracks = files.map((file, index) => ({
      id: Date.now() + index,
      title: file.name.replace('.mp3', ''),
      url: URL.createObjectURL(file)
    }));

    setPlaylist(prev => [...prev, ...newTracks]);
    if (playlist.length === 0) {
      setCurrentTrackIndex(0);
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (!currentTrack && playlist.length === 0) return;
    setupAudioContext();

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    setCurrentTrackIndex((currentTrackIndex + 1) % playlist.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (playlist.length === 0) return;
    setCurrentTrackIndex((currentTrackIndex - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const selectTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  // UPDATED: Sync exact time and duration to state
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      
      setCurrentTime(current);
      setDuration(dur);
      
      if (dur) setProgress((current / dur) * 100);
    }
  };

  const handleScrub = (e) => {
    if (audioRef.current) {
      const scrubTime = (e.target.value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = scrubTime;
      setProgress(e.target.value);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  const toggleTheme = () => setTheme(theme === 'metal' ? 'cyber' : 'metal');

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying && currentTrack) {
        setupAudioContext();
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIndex, isPlaying, currentTrack]);

  return (
    <div className={`jukebox-container ${theme === 'cyber' ? 'theme-cyber' : ''}`}>
      <div className="header-row">
        <div className="branding">Millennium Jukebox v3.0</div>
        <div className="header-controls">
          <button className="btn btn-theme" onClick={toggleTheme}>
            SKIN: {theme.toUpperCase()}
          </button>
          
          <select className="btn btn-genre" onChange={streamFromInternet} defaultValue="">
            <option value="" disabled>NET RADIO</option>
            <option value="Electronic">Electronic</option>
            <option value="Rock">Rock</option>
            <option value="Hip-Hop">Hip-Hop</option>
            <option value="Pop">Pop</option>
            <option value="Jazz">Jazz</option>
          </select>

          <input 
            type="file" accept="audio/mp3, audio/wav" multiple ref={fileInputRef}
            style={{ display: 'none' }} onChange={handleFileUpload}
          />
          <button className="btn btn-load" onClick={() => fileInputRef.current.click()}>
            ⏏ LOAD
          </button>
        </div>
      </div>
      
      {currentTrack && (
        <audio 
          ref={audioRef} src={currentTrack.url} onEnded={nextTrack}
          onTimeUpdate={handleTimeUpdate} crossOrigin="anonymous"
        />
      )}

      {/* The Digital Screen + Visualizer */}
      <div className="lcd-screen">
        <canvas ref={canvasRef} className="visualizer" width="80" height="40"></canvas>
        <div className="lcd-info">
          <p className="lcd-text">
            {isDialing ? '*** DIALING SERVER... ***' 
              : currentTrack ? `*** ${currentTrack.title} ***` 
              : '*** NO DISK INSERTED ***'}
          </p>
          {/* UPDATED: Time Display added to the LCD Status bar */}
          <div className="lcd-status" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{isDialing ? '⧖ BUFFERING' : isPlaying ? '▶ PLAYING' : '■ STOPPED'}</span>
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div className="scrubber-container">
        <input 
          type="range" min="0" max="100" value={isNaN(progress) ? 0 : progress} 
          onChange={handleScrub} className="vol-slider scrubber"
        />
      </div>

      <div className="controls">
        <button className="btn" onClick={prevTrack}>|&lt;&lt;</button>
        <button className="btn" onClick={togglePlayPause}>{isPlaying ? 'PAUSE' : 'PLAY'}</button>
        <button className="btn" onClick={nextTrack}>&gt;&gt;|</button>
      </div>

      <div className="volume-container">
        <span className="vol-label">VOL</span>
        <input 
          type="range" min="0" max="1" step="0.01" value={volume} 
          onChange={handleVolumeChange} className="vol-slider"
        />
      </div>

      <div className="playlist">
        {playlist.length === 0 ? (
          <div className="track-item" style={{color: 'inherit', textAlign: 'center', marginTop: '30px'}}>
            Awaiting input...
          </div>
        ) : (
          playlist.map((track, index) => (
            <div 
              key={track.id} className={`track-item ${index === currentTrackIndex ? 'active' : ''}`}
              onClick={() => selectTrack(index)}
            >
              {String(index + 1).padStart(2, '0')} - {track.title}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;