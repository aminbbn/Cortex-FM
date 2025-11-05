import React from 'react';
import type { Track } from '../types';
import { PlayIcon, PauseIcon, NextIcon, PrevIcon } from './Icons';

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const PlayerBar: React.FC<PlayerBarProps> = ({ 
  currentTrack, 
  isPlaying, 
  onTogglePlay, 
  onNext, 
  onPrev,
  currentTime,
  duration,
  onSeek
}) => {
  const isPlayable = !!currentTrack?.fileUrl;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="h-24 bg-surface rounded-xl flex-shrink-0 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 w-1/4">
        {currentTrack ? (
          <>
            <img src={currentTrack.albumArt} alt={currentTrack.title} className="w-14 h-14 rounded-md" />
            <div>
              <p className="font-bold text-text-primary">{currentTrack.title}</p>
              <p className="text-sm text-text-secondary">{currentTrack.artist}</p>
            </div>
          </>
        ) : (
             <div className="w-14 h-14 rounded-md bg-surface-light flex items-center justify-center text-text-secondary">
                <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
             </div>
        )}
      </div>
      
      <div className="flex flex-col items-center gap-2 w-1/2">
        <div className="flex items-center gap-6">
          <button onClick={onPrev} className="text-accent hover:text-accent-hover transition-colors disabled:opacity-50" disabled={!isPlayable}>
            <PrevIcon />
          </button>
          <button 
            onClick={onTogglePlay} 
            className="w-10 h-10 bg-text-primary text-background rounded-full flex items-center justify-center hover:bg-accent-hover transition-colors disabled:bg-gray-600 disabled:text-gray-400"
            disabled={!isPlayable}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button onClick={onNext} className="text-accent hover:text-accent-hover transition-colors disabled:opacity-50" disabled={!isPlayable}>
            <NextIcon />
          </button>
        </div>
        <div className="flex items-center gap-2 w-full max-w-lg text-xs text-text-secondary">
          <span>{formatTime(currentTime)}</span>
          <div 
            className="w-full h-1 bg-surface-light rounded-full overflow-hidden cursor-pointer group"
            onClick={isPlayable ? onSeek : undefined}
          >
             <div 
                className="h-full bg-accent group-hover:bg-brand transition-colors" 
                style={{width: `${progress}%`}}>
             </div>
          </div>
          <span>{isPlayable && duration > 0 ? formatTime(duration) : currentTrack?.duration || '0:00'}</span>
        </div>
      </div>

      <div className="w-1/4 flex justify-end">
        {/* Volume controls could go here */}
      </div>
    </footer>
  );
};