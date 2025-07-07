import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSpotify } from '../hooks/useSpotify';

interface TopBarProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  canGoBack, 
  canGoForward, 
  onGoBack, 
  onGoForward 
}) => {
  const { user } = useSpotify();

  return (
    <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <button 
          onClick={onGoBack}
          disabled={!canGoBack}
          className={`w-8 h-8 bg-black/40 rounded-full flex items-center justify-center transition-colors ${
            canGoBack 
              ? 'text-white hover:bg-black/60 cursor-pointer' 
              : 'text-white/30 cursor-not-allowed'
          }`}
          title="Go back"
        >
          <ChevronLeft size={16} />
        </button>
        <button 
          onClick={onGoForward}
          disabled={!canGoForward}
          className={`w-8 h-8 bg-black/40 rounded-full flex items-center justify-center transition-colors ${
            canGoForward 
              ? 'text-white hover:bg-black/60 cursor-pointer' 
              : 'text-white/30 cursor-not-allowed'
          }`}
          title="Go forward"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-semibold hover:scale-105 transition-transform">
          Explore Premium
        </button>
        <div className="flex items-center gap-2">
          {user?.images?.[0] && (
            <img 
              src={user.images[0].url} 
              alt={user.display_name} 
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-white text-sm font-medium">{user?.display_name || 'User'}</span>
        </div>
      </div>
    </div>
  );
};