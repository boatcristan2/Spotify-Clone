import React, { useState, useEffect, useCallback } from 'react';
import { SpotifyAuth } from './components/SpotifyAuth';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { HomeView } from './components/HomeView';
import { SearchView } from './components/SearchView';
import { LibraryView } from './components/LibraryView';
import { Player } from './components/Player';
import { Notification } from './components/Notification';
import { Track } from './components/TrackRow';
import { taylorSwiftTracks } from './data/tracks';
import { useNotification } from './hooks/useNotification';
import { useSpotify } from './hooks/useSpotify';
import { useNavigationHistory, NavigationState } from './hooks/useNavigationHistory';
import { SpotifyTrack } from './services/spotify';

// Convert Spotify track to our Track interface
const convertSpotifyTrack = (spotifyTrack: SpotifyTrack): Track => ({
  id: spotifyTrack.id,
  name: spotifyTrack.name,
  artist: spotifyTrack.artists[0]?.name || 'Unknown Artist',
  album: spotifyTrack.album.name,
  duration: `${Math.floor(spotifyTrack.duration_ms / 60000)}:${Math.floor((spotifyTrack.duration_ms % 60000) / 1000).toString().padStart(2, '0')}`,
  emoji: '🎵',
  uri: spotifyTrack.uri
});

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'library'>('home');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [spotifyTracks, setSpotifyTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [tracksLoaded, setTracksLoaded] = useState(false);
  const { notification, isVisible, showNotification } = useNotification();
  const { isAuthenticated, user, loading: authLoading, error: authError, searchTracks, getTaylorSwiftTracks } = useSpotify();
  const { 
    canGoBack, 
    canGoForward, 
    pushState, 
    goBack, 
    goForward 
  } = useNavigationHistory();

  // Load Taylor Swift tracks when authenticated
  useEffect(() => {
    if (isAuthenticated && !tracksLoaded) {
      const loadTracks = async () => {
        try {
          console.log('🎵 Loading Taylor Swift tracks from Spotify...');
          setLoading(true);
          const tracks = await getTaylorSwiftTracks();
          console.log('🎵 Received tracks from Spotify:', tracks.length);
          const convertedTracks = tracks.map(convertSpotifyTrack);
          console.log('🎵 Converted tracks:', convertedTracks.length);
          setSpotifyTracks(convertedTracks);
          setTracksLoaded(true);
          
          if (convertedTracks.length > 0) {
            setCurrentTrack(convertedTracks[0]);
            console.log('🎵 Set initial track:', convertedTracks[0].name);
          }
          
          showNotification(`🎵 Loaded ${convertedTracks.length} Taylor Swift tracks!`);
        } catch (error) {
          console.error('Failed to load tracks:', error);
          // Fallback to demo data
          const demoTracks = taylorSwiftTracks;
          setSpotifyTracks(demoTracks);
          setTracksLoaded(true);
          if (demoTracks.length > 0) {
            setCurrentTrack(demoTracks[0]);
          }
          showNotification('❌ Failed to load Spotify tracks - using demo data');
        } finally {
          setLoading(false);
        }
      };

      loadTracks();
    }
  }, [isAuthenticated, getTaylorSwiftTracks, showNotification, tracksLoaded]);

  const handleCategoryClick = useCallback(async (category: string) => {
    console.log('🎵 Category clicked:', category);
    
    setCurrentView('search');
    
    if (isAuthenticated) {
      try {
        setLoading(true);
        let searchQuery = '';
        
        switch (category) {
          case 'Taylor Swift':
          case 'Swiftie Favorites':
            searchQuery = 'artist:Taylor Swift';
            break;
          case 'Pop':
            searchQuery = 'artist:Taylor Swift album:1989 OR album:Lover OR album:Midnights';
            break;
          case 'Country':
            searchQuery = 'artist:Taylor Swift album:Fearless OR album:Red';
            break;
          case 'Indie Folk':
            searchQuery = 'artist:Taylor Swift album:folklore OR album:evermore';
            break;
          case 'Alternative':
            searchQuery = 'artist:Taylor Swift alternative';
            break;
          case 'Singer-Songwriter':
            searchQuery = 'artist:Taylor Swift acoustic';
            break;
          case 'Romance':
            searchQuery = 'artist:Taylor Swift love';
            break;
          case 'Breakup Songs':
            searchQuery = 'artist:Taylor Swift sad';
            break;
          case 'Empowerment':
            searchQuery = 'artist:Taylor Swift confident';
            break;
          default:
            searchQuery = `artist:Taylor Swift ${category}`;
        }
        
        console.log('🔍 Searching for:', searchQuery);
        const tracks = await searchTracks(searchQuery);
        const convertedTracks = tracks.map(convertSpotifyTrack);
        console.log('✅ Found', convertedTracks.length, 'tracks for', category);
        showNotification(`🎵 Found ${convertedTracks.length} ${category} tracks`);
      } catch (error) {
        console.error('Category search failed:', error);
        showNotification('🔍 Showing demo results');
      } finally {
        setLoading(false);
      }
    } else {
      showNotification('🔍 Showing demo results - Connect Spotify for real search');
    }
  }, [isAuthenticated, searchTracks, pushState, showNotification]);

  const handleViewChange = (view: 'home' | 'search' | 'library') => {
    setCurrentView(view);
  };

  const handleGoBack = () => {
    const previousState = goBack();
    if (previousState) {
      setCurrentView(previousState.view);
      showNotification('⬅️ Navigated back');
    }
  };

  const handleGoForward = () => {
    const nextState = goForward();
    if (nextState) {
      setCurrentView(nextState.view);
      showNotification('➡️ Navigated forward');
    }
  };

  const playTrack = (track: Track) => {
    console.log('🎵 Playing track:', track.name);
    console.log('🎵 Track URI:', track.uri);
    
    // Only update if it's actually a different track
    if (!currentTrack || currentTrack.id !== track.id) {
      setCurrentTrack(track);
    }
    
    setIsPlaying(true);
    showNotification(`🎵 Now playing: ${track.name}`);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    showNotification(isPlaying ? '⏸ Paused' : '▶ Playing');
  };

  const handleTrackChange = (track: Track) => {
    // Only update if it's actually a different track
    if (!currentTrack || currentTrack.id !== track.id) {
      setCurrentTrack(track);
    }
  };

  // Always use loaded tracks (either Spotify or demo fallback)
  const tracksToShow = spotifyTracks.length > 0 ? spotifyTracks : [];

  // Show loading screen during authentication
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Connecting to Spotify...</p>
          <p className="text-sm text-gray-400 mt-2">Processing authentication...</p>
        </div>
      </div>
    );
  }

  // Show auth error screen
  if (authError) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
          <p className="text-gray-300 mb-6">{authError}</p>
          <div className="space-y-3">
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-green-500 text-black px-6 py-3 rounded-full font-semibold hover:bg-green-400 transition-colors block w-full"
            >
              Clear Data & Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView tracks={tracksToShow} onPlayTrack={playTrack} loading={loading} />;
      case 'search':
        return (
          <SearchView
            key="search-view"
            onCategoryClick={handleCategoryClick}
            onPlayTrack={playTrack}
          />
        );
      case 'library':
        return <LibraryView onCategoryClick={handleCategoryClick} />;
      default:
        return <HomeView tracks={tracksToShow} onPlayTrack={playTrack} loading={loading} />;
    }
  };

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <SpotifyAuth />;
  }

  return (
    <div className="h-screen flex bg-black text-white overflow-hidden">
      {/* Status bar */}
      <div className="fixed top-0 left-0 right-0 bg-green-600 text-black text-xs p-2 z-50">
        ✅ Connected: {user?.display_name || 'Loading...'} | 
        Tracks: {tracksToShow.length} | 
        {loading && 'Loading...'}
      </div>
      
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="flex-1 bg-gradient-to-b from-zinc-900 via-zinc-800 to-black overflow-y-auto pb-24 pt-8">
        <TopBar 
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onGoBack={handleGoBack}
          onGoForward={handleGoForward}
        />
        {renderCurrentView()}
      </div>

      <Player 
        currentTrack={currentTrack || (tracksToShow.length > 0 ? tracksToShow[0] : taylorSwiftTracks[0])} 
        isPlaying={isPlaying} 
        onTogglePlay={togglePlay}
        onTrackChange={handleTrackChange}
      />

      <Notification message={notification} isVisible={isVisible} />
    </div>
  );
}

export default App;