import React from 'react';
import { Library, Music, Heart, Clock } from 'lucide-react';
import { useSpotify } from '../hooks/useSpotify';
import { useNotification } from '../hooks/useNotification';

interface LibraryViewProps {
  onCategoryClick?: (category: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onCategoryClick }) => {
  const { user, isAuthenticated } = useSpotify();
  const { showNotification } = useNotification();

  const handleCategoryClick = (category: string) => {
    if (onCategoryClick) {
      console.log('📚 Library category clicked:', category);
      onCategoryClick(category);
      showNotification(`🎵 Searching ${category}...`);
    } else {
      showNotification('🔍 Search functionality coming soon!');
    }
  };

  const libraryItems = [
    {
      icon: Heart,
      title: "Liked Songs",
      subtitle: "Your favorite Taylor Swift tracks",
      color: "bg-gradient-to-br from-purple-600 to-blue-600",
      searchQuery: "artist:\"Taylor Swift\" saved"
    },
    {
      icon: Clock,
      title: "Recently Played",
      subtitle: "Your recent listening history",
      color: "bg-gradient-to-br from-green-600 to-teal-600",
      searchQuery: "artist:\"Taylor Swift\" recent"
    },
    {
      icon: Music,
      title: "Made For You",
      subtitle: "Personalized Taylor Swift playlists",
      color: "bg-gradient-to-br from-pink-600 to-rose-600",
      searchQuery: "artist:\"Taylor Swift\" popular"
    }
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Your Library</h1>
        <div className="flex items-center gap-2">
          <Library size={20} className="text-white/70" />
          <span className="text-white/70 text-sm">
            {isAuthenticated ? `Connected as ${user?.display_name}` : 'Not connected'}
          </span>
        </div>
      </div>

      {isAuthenticated ? (
        <div className="space-y-6">
          {/* Quick Access */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {libraryItems.map((item, index) => (
              <div
                key={index}
                className="bg-zinc-800/50 rounded-lg p-6 hover:bg-zinc-800 transition-all cursor-pointer group hover:scale-105"
                onClick={() => handleCategoryClick(item.searchQuery)}
              >
                <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <item.icon size={24} className="text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                <p className="text-white/70 text-sm">{item.subtitle}</p>
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-green-400 text-xs font-medium">Click to explore →</span>
                </div>
              </div>
            ))}
          </div>

          {/* Library Stats */}
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xl">♪</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Spotify Premium Connected</h3>
                <p className="text-green-200">Access to full Taylor Swift catalog and personalized recommendations</p>
              </div>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="bg-zinc-800/30 rounded-lg p-6 border border-zinc-700">
            <h3 className="text-white font-semibold text-lg mb-3">Coming Soon</h3>
            <div className="space-y-2 text-white/70">
              <p>• Your personal playlists</p>
              <p>• Followed artists</p>
              <p>• Downloaded music</p>
              <p>• Listening statistics</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Library size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connect Your Spotify Account</h2>
            <p className="text-white/70 text-lg mb-6">Sign in to access your personal library and playlists</p>
          </div>
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-yellow-300 font-semibold">⚠️ Authentication Required</p>
            <p className="text-yellow-200 text-sm mt-1">Please connect your Spotify account to view your library</p>
          </div>
        </div>
      )}
    </div>
  );
};