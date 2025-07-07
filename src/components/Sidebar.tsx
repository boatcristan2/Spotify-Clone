import React from 'react';
import { Home, Search, Library, Heart } from 'lucide-react';

interface SidebarProps {
  currentView: 'home' | 'search' | 'library';
  onViewChange: (view: 'home' | 'search' | 'library') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const NavButton = ({ 
    icon: Icon, 
    label, 
    view, 
    isActive 
  }: { 
    icon: any; 
    label: string; 
    view: 'home' | 'search' | 'library'; 
    isActive: boolean;
  }) => (
    <button
      onClick={() => onViewChange(view)}
      className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg text-left transition-all ${
        isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
      }`}
    >
      <Icon size={24} />
      <span className="font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="w-64 bg-black h-full flex flex-col border-r border-zinc-800">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">♪</span>
          </div>
          <h1 className="text-white text-xl font-bold">Spotify</h1>
        </div>
      </div>

      <nav className="px-3 space-y-2">
        <NavButton icon={Home} label="Home" view="home" isActive={currentView === 'home'} />
        <NavButton icon={Search} label="Search" view="search" isActive={currentView === 'search'} />
        <NavButton icon={Library} label="Your Library" view="library" isActive={currentView === 'library'} />
      </nav>

      <div className="px-3 mt-6">
        <button className="w-full flex items-center gap-4 px-3 py-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-700 to-blue-300 rounded-sm flex items-center justify-center">
            <Heart size={14} fill="white" className="text-white" />
          </div>
          <span className="font-medium">Liked Songs</span>
        </button>
      </div>
    </div>
  );
};