import React from 'react';
import { Play } from 'lucide-react';

export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: string;
  emoji: string;
  uri?: string; // Spotify URI for playback
}

interface TrackRowProps {
  track: Track;
  index: number;
  onPlay: (track: Track) => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, index, onPlay }) => {
  const handleClick = () => {
    console.warn('🎵 TRACK ROW CLICKED:', track.name);
    try {
      onPlay(track);
      console.warn('✅ onPlay called successfully');
    } catch (error) {
      console.error('❌ ERROR in TrackRow:', error);
    }
  };

  return (
    <div 
      className="grid grid-cols-[16px_1fr_1fr_60px] gap-4 px-4 py-3 group hover:bg-white/10 rounded-md cursor-pointer transition-all duration-200"
      onClick={handleClick}
    >
      <div className="flex items-center justify-center">
        <span className="text-sm text-white/50 group-hover:hidden">{index + 1}</span>
        <Play className="hidden group-hover:block text-white fill-white" size={16} />
      </div>
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-lg">
          {track.emoji}
        </div>
        <div>
          <p className="text-white font-medium">{track.name}</p>
          <p className="text-white/70 text-sm">{track.artist}</p>
        </div>
      </div>
      
      <div className="flex items-center">
        <p className="text-white/70 text-sm">{track.album}</p>
      </div>
      
      <div className="flex items-center justify-end">
        <span className="text-white/70 text-sm">{track.duration}</span>
      </div>
    </div>
  );
};