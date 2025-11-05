import React, { useState } from 'react';
import type { Track } from '../types';
import { TrackCard } from './TrackCard';
import { SearchIcon, LoaderIcon } from './Icons';

interface MainContentProps {
  playlist: Track[];
  isLoading: boolean;
  error: string | null;
  currentTrack: Track | null;
  isPlaying: boolean;
  onGeneratePlaylist: (prompt: string) => void;
  onSelectTrack: (track: Track) => void;
}

export const MainContent: React.FC<MainContentProps> = ({ 
  playlist, 
  isLoading, 
  error,
  currentTrack,
  isPlaying,
  onGeneratePlaylist,
  onSelectTrack
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGeneratePlaylist(prompt);
      setPrompt('');
    }
  };

  return (
    <main className="flex-grow bg-surface rounded-xl p-6 overflow-y-auto">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What's your mood? e.g., 'futuristic synthwave for coding'"
            className="w-full bg-surface-light rounded-full pl-12 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit" 
          className="bg-brand text-white font-bold px-6 py-3 rounded-full hover:bg-indigo-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? <LoaderIcon className="animate-spin" /> : 'Generate'}
        </button>
      </form>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {playlist.length === 0 && !isLoading && (
        <div className="text-center text-text-secondary py-20">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome to Cortex FM</h2>
          <p>Describe a vibe, or upload your own music to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {playlist.map((track) => {
          const isThisTrackPlaying = isPlaying && currentTrack?.fileUrl === track.fileUrl;
          return (
            <TrackCard 
              key={`${track.title}-${track.artist}-${track.fileUrl || ''}`}
              track={track} 
              onClick={() => onSelectTrack(track)}
              isPlaying={isThisTrackPlaying}
            />
          );
        })}
      </div>
    </main>
  );
};
