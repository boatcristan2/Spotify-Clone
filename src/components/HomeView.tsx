import React from 'react';
import { Play } from 'lucide-react';
import { Track, TrackRow } from './TrackRow';
import { useSpotify } from '../hooks/useSpotify';

interface HomeViewProps {
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
  loading?: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({ tracks, onPlayTrack, loading = false }) => {
  const { isAuthenticated, user } = useSpotify();
  
  // Don't show quick picks if no tracks are loaded
  if (tracks.length === 0 && !loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          Good afternoon{user ? `, ${user.display_name}` : ''}
        </h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/70">Loading your music library...</p>
          </div>
        </div>
      </div>
    );
  }
  
  const quickPicks = [
    { name: "Today's Top Hits", emoji: '♪', track: tracks.find(t => t.name === 'Anti-Hero') || tracks[0] },
    { name: "Taylor Swift Hits", emoji: '✨', track: tracks.find(t => t.name === 'Shake It Off') || tracks[1] },
    { name: "Pop Favorites", emoji: '🎵', track: tracks.find(t => t.name === 'Love Story') || tracks[2] }
  ].filter(pick => pick.track); // Only show picks that have valid tracks

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Good afternoon</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/70">Loading your Taylor Swift music...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Good afternoon{user ? `, ${user.display_name}` : ''}
      </h1>
      
      {/* Success message for authenticated users */}
      {isAuthenticated && (
        <div className="bg-green-600/20 border border-green-500 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-green-400 text-xl">✅</span>
            <span className="text-green-300 font-semibold">Connected to Spotify</span>
          </div>
          <p className="text-green-200 text-sm mt-1">
            {tracks.length > 0 ? `Showing ${tracks.length} Taylor Swift tracks from Spotify` : 'Loading your Taylor Swift music...'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {quickPicks.map((pick, index) => (
          <div 
            key={index}
            className="bg-white/10 backdrop-blur-sm rounded-md flex items-center gap-4 hover:bg-white/20 transition-all cursor-pointer group"
            onClick={() => onPlayTrack(pick.track)}
          >
            <div className="w-16 h-16 rounded-l-md bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-2xl">
              {pick.emoji}
            </div>
            <span className="text-white font-semibold truncate flex-1">{pick.name}</span>
            <button className="mr-4 bg-green-500 text-black rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
              <Play size={16} fill="currentColor" />
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Recently played</h2>
      
      <div className="space-y-1">
        {tracks.map((track, index) => (
          <TrackRow key={track.id} track={track} index={index} onPlay={onPlayTrack} />
        ))}
      </div>
    </div>
  );
};