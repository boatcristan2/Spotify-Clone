import React, { useState, useCallback, useRef, useEffect, memo, startTransition } from 'react';
import { Search } from 'lucide-react';
import { Track, TrackRow } from './TrackRow';
import { useSpotify } from '../hooks/useSpotify';
import { useNotification } from '../hooks/useNotification';
import { taylorSwiftTracks } from '../data/tracks';

interface Category {
  name: string;
  color: string;
}

interface SearchViewProps {
  onCategoryClick: (category: string) => void;
  onPlayTrack: (track: Track) => void;
}

const browseCategories: Category[] = [
  { name: 'Taylor Swift', color: 'bg-gradient-to-br from-purple-600 to-purple-800' },
  { name: 'Pop', color: 'bg-gradient-to-br from-pink-500 to-rose-600' },
  { name: 'Country', color: 'bg-gradient-to-br from-amber-600 to-orange-700' },
  { name: 'Indie Folk', color: 'bg-gradient-to-br from-green-600 to-emerald-700' },
  { name: 'Alternative', color: 'bg-gradient-to-br from-blue-600 to-indigo-700' },
  { name: 'Singer-Songwriter', color: 'bg-gradient-to-br from-teal-600 to-cyan-700' },
  { name: 'Romance', color: 'bg-gradient-to-br from-red-500 to-pink-600' },
  { name: 'Breakup Songs', color: 'bg-gradient-to-br from-gray-600 to-slate-700' },
  { name: 'Empowerment', color: 'bg-gradient-to-br from-yellow-500 to-amber-600' },
  { name: 'Swiftie Favorites', color: 'bg-gradient-to-br from-purple-700 to-violet-800' },
];

// Convert Spotify track to our Track interface
const convertSpotifyTrack = (spotifyTrack: any): Track => ({
  id: spotifyTrack.id,
  name: spotifyTrack.name,
  artist: spotifyTrack.artists[0]?.name || 'Unknown Artist',
  album: spotifyTrack.album.name,
  duration: `${Math.floor(spotifyTrack.duration_ms / 60000)}:${Math.floor((spotifyTrack.duration_ms % 60000) / 1000).toString().padStart(2, '0')}`,
  emoji: '🎵',
  uri: spotifyTrack.uri
});

const SearchViewComponent: React.FC<SearchViewProps> = ({ 
  onCategoryClick, 
  onPlayTrack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { isAuthenticated, searchTracks } = useSpotify();
  const { showNotification } = useNotification();

  const handleSearch = useCallback(async (query: string) => {
    // Clear results if query is empty
    if (!query.trim()) {
      startTransition(() => {
        setSearchResults([]);
      });
      return;
    }

    if (isAuthenticated) {
      try {
        startTransition(() => {
          setLoading(true);
        });
        const tracks = await searchTracks(query);
        const convertedTracks = tracks.map(convertSpotifyTrack);
        startTransition(() => {
          setSearchResults(convertedTracks);
          setLoading(false);
        });
        showNotification(`🔍 Found ${convertedTracks.length} tracks`);
      } catch (error) {
        console.error('Search failed:', error);
        const results = taylorSwiftTracks.filter(track => 
          track.name.toLowerCase().includes(query.toLowerCase()) ||
          track.artist.toLowerCase().includes(query.toLowerCase()) ||
          track.album.toLowerCase().includes(query.toLowerCase())
        );
        startTransition(() => {
          setSearchResults(results);
          setLoading(false);
        });
        showNotification('🔍 Showing demo results');
      }
    } else {
      const results = taylorSwiftTracks.filter(track => 
        track.name.toLowerCase().includes(query.toLowerCase()) ||
        track.artist.toLowerCase().includes(query.toLowerCase()) ||
        track.album.toLowerCase().includes(query.toLowerCase())
      );
      startTransition(() => {
        setSearchResults(results);
      });
    }
  }, [isAuthenticated, searchTracks, showNotification]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce the search
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  }, [handleSearch]);

  const handleCategoryClick = useCallback((categoryName: string) => {
    console.log('🎵 Category clicked:', categoryName);
    onCategoryClick(categoryName);
  }, [onCategoryClick]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="p-8">
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="What do you want to listen to?"
          value={searchQuery}
          onChange={handleInputChange}
          autoFocus
          className="w-full max-w-md bg-white text-black rounded-full py-3 pl-12 pr-4 text-sm font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={loading}
          autoComplete="off"
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {searchResults.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Search Results</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/70">Searching Spotify...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {searchResults.map((track, index) => (
                <TrackRow key={track.id} track={track} index={index} onPlay={onPlayTrack} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Browse all</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {browseCategories.map((category) => (
              <div
                key={category.name}
                className={`${category.color} rounded-lg p-4 h-32 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-lg ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => !loading && handleCategoryClick(category.name)}
              >
                <h3 className="text-white font-bold text-lg">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const SearchView = memo(SearchViewComponent);