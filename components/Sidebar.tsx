import React from 'react';
import { HomeIcon, SearchIcon, LibraryIcon, PlusIcon, CortexFMLogo } from './Icons';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active }) => (
  <a href="#" className={`flex items-center gap-4 px-4 py-2 rounded-md transition-colors ${active ? 'text-text-primary bg-surface-light' : 'text-text-secondary hover:text-text-primary'}`}>
    {icon}
    <span className="font-bold">{label}</span>
  </a>
);

interface SidebarProps {
  onFileUpload: (files: FileList) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onFileUpload }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFileUpload(event.target.files);
      // Reset input value to allow uploading the same file again
      event.target.value = '';
    }
  };

  return (
    <aside className="w-64 lg:w-72 flex-shrink-0 flex flex-col gap-2">
      <div className="bg-surface rounded-xl p-2">
        <div className="flex items-center gap-2 p-4 text-xl font-bold">
            <CortexFMLogo className="h-6 w-6"/>
            <span>Cortex FM</span>
        </div>
        <nav className="flex flex-col gap-1">
          <NavItem icon={<HomeIcon />} label="Home" active />
          <NavItem icon={<SearchIcon />} label="Search" />
        </nav>
      </div>
      <div className="bg-surface rounded-xl p-2 flex-grow">
        <div className="flex items-center justify-between text-text-secondary px-4 py-2">
            <div className="flex items-center gap-4">
              <LibraryIcon />
              <span className="font-bold">Your Library</span>
            </div>
            <label htmlFor="music-upload" className="hover:text-text-primary transition-colors cursor-pointer">
              <PlusIcon />
            </label>
            <input 
              type="file" 
              id="music-upload" 
              className="hidden" 
              accept="audio/*"
              multiple
              onChange={handleFileChange}
            />
        </div>
        <div className="mt-4 px-2 space-y-1 text-sm text-text-secondary">
            <p className="px-2 py-2 rounded-md hover:bg-surface-light cursor-pointer">Chill Vibes</p>
            <p className="px-2 py-2 rounded-md hover:bg-surface-light cursor-pointer">Late Night Coding</p>
            <p className="px-2 py-2 rounded-md hover:bg-surface-light cursor-pointer">Workout Hits</p>
        </div>
      </div>
    </aside>
  );
};
