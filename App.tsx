import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as jsmediatags from 'jsmediatags';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { PlayerBar } from './components/PlayerBar';
import type { Track } from './types';
import { generatePlaylist } from './services/geminiService';

// Helper to generate a unique, consistent SVG placeholder
const generatePlaceholderArt = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }

  const h = (hash & 0xFFFFFF).toString(16).toUpperCase();
  const color1 = '#' + '00000'.substring(0, 6 - h.length) + h;
  
  const h2 = ((hash >> 8) & 0xFFFFFF).toString(16).toUpperCase();
  const color2 = '#' + '00000'.substring(0, 6 - h2.length) + h2;

  const svg = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#grad)" />
       <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="90" fill="#FFFFFF" opacity="0.6">
        ${seed.charAt(0).toUpperCase()}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const readAudioMetadata = (file: File): Promise<Track> => {
    return new Promise((resolve) => {
        const fileUrl = URL.createObjectURL(file);
        const defaultTitle = file.name.replace(/\.[^/.]+$/, "");

        new jsmediatags.Reader(file)
            .read({
                onSuccess: (tag) => {
                    const tags = tag.tags;
                    let albumArt = generatePlaceholderArt(tags.title || defaultTitle);

                    if (tags.picture) {
                        const { data, format } = tags.picture;
                        const base64String = data.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
                        albumArt = `data:${format};base64,${btoa(base64String)}`;
                    }

                    resolve({
                        title: tags.title || defaultTitle,
                        artist: tags.artist || "Uploaded",
                        albumArt: albumArt,
                        duration: "0:00",
                        fileUrl: fileUrl,
                    });
                },
                onError: () => {
                    // Fallback if metadata reading fails
                    resolve({
                        title: defaultTitle,
                        artist: "Uploaded",
                        albumArt: generatePlaceholderArt(defaultTitle),
                        duration: "0:00",
                        fileUrl: fileUrl,
                    });
                }
            });
    });
};


export default function App() {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && audio.paused) {
      audio.play().catch(e => console.error("Error playing audio:", e));
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack?.fileUrl) {
      audio.src = currentTrack.fileUrl;
      if (isPlaying) {
        audio.play().catch(e => console.error("Error playing audio:", e));
      }
    }
  }, [currentTrack]);


  const handleGeneratePlaylist = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newPlaylist = await generatePlaylist(prompt);
      // Prepend new AI tracks to the existing playlist
      setPlaylist(prev => [...newPlaylist, ...prev]);
    } catch (err) {
      setError('Failed to generate playlist. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFileUpload = async (files: FileList) => {
    const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));
    const newTracks = await Promise.all(audioFiles.map(readAudioMetadata));
    
    setPlaylist(prev => [...prev, ...newTracks]);
    if (!currentTrack && newTracks.length > 0) {
        setCurrentTrack(newTracks[0]);
    }
  };

  const togglePlayPause = () => {
    if (currentTrack?.fileUrl) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSelectTrack = (track: Track) => {
    if (currentTrack?.fileUrl === track.fileUrl) {
      togglePlayPause();
    } else {
      setCurrentTrack(track);
      setCurrentTime(0);
      setDuration(0);
      if (track.fileUrl) {
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    }
  };

  const handleNextTrack = useCallback(() => {
    if (playlist.length === 0) return;
    const currentIndex = currentTrack ? playlist.findIndex(t => t.title === currentTrack.title && t.artist === currentTrack.artist) : -1;
    let nextIndex = (currentIndex + 1) % playlist.length;
    
    // Skip unplayable tracks
    const originalIndex = nextIndex;
    while (!playlist[nextIndex].fileUrl) {
        nextIndex = (nextIndex + 1) % playlist.length;
        if (nextIndex === originalIndex) return; // No playable tracks
    }

    setCurrentTrack(playlist[nextIndex]);
    setIsPlaying(true);
  }, [currentTrack, playlist]);

  const handlePrevTrack = () => {
    if (playlist.length === 0) return;
    const currentIndex = currentTrack ? playlist.findIndex(t => t.title === currentTrack.title && t.artist === currentTrack.artist) : 0;
    let prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;

    // Skip unplayable tracks
    const originalIndex = prevIndex;
     while (!playlist[prevIndex].fileUrl) {
        prevIndex = (prevIndex - 1 + playlist.length) % playlist.length;
        if (prevIndex === originalIndex) return; // No playable tracks
    }

    setCurrentTrack(playlist[prevIndex]);
    setIsPlaying(true);
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleMetadataLoaded = () => {
      if (audioRef.current) {
          const newDuration = audioRef.current.duration;
          setDuration(newDuration);
          
          // Update the duration in the main playlist state
          if (currentTrack) {
            setPlaylist(prevPlaylist => 
              prevPlaylist.map(track => 
                track.fileUrl === currentTrack.fileUrl 
                  ? { ...track, duration: formatTime(newDuration) } 
                  : track
              )
            );
          }
      }
  };
  
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!audioRef.current || !duration) return;
      const progressBar = e.currentTarget;
      const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
      const progressBarWidth = progressBar.offsetWidth;
      const seekTime = (clickPosition / progressBarWidth) * duration;
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
  };


  return (
    <div className="h-screen w-screen text-text-primary font-sans flex flex-col p-2 gap-2">
      <audio 
        ref={audioRef} 
        onEnded={handleNextTrack}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleMetadataLoaded}
       />
      <div className="flex-grow flex gap-2 overflow-hidden">
        <Sidebar onFileUpload={handleFileUpload} />
        <MainContent 
          playlist={playlist}
          isLoading={isLoading}
          error={error}
          onGeneratePlaylist={handleGeneratePlaylist}
          onSelectTrack={handleSelectTrack}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
        />
      </div>
      <PlayerBar 
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={togglePlayPause}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
      />
    </div>
  );
}