import React from 'react';
import type { Track } from '../types';
import { PlayIcon, PauseIcon } from './Icons';

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  onClick: () => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, isPlaying, onClick }) => {
  return (
    <div 
      className="bg-surface-light p-4 rounded-lg group relative cursor-pointer transition-colors hover:bg-gray-700/50"
      onClick={onClick}
    >
      <div className="relative">
        <img src={track.albumArt} alt={track.title} className="w-full h-auto aspect-square rounded-md shadow-lg" />
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {track.duration}
        </div>
        <div className={`absolute bottom-2 right-2 w-12 h-12 bg-brand text-white rounded-full flex items-center justify-center shadow-xl transition-all duration-300
                         ${isPlaying ? 'opacity-100' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}`}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </div>
      </div>
      <h3 className="font-bold text-text-primary mt-3 truncate">{track.title}</h3>
      <p className="text-sm text-text-secondary truncate">{track.artist}</p>
    </div>
  );
};