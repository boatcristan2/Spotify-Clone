import { useState, useEffect, useCallback } from 'react';
import { spotifyService, SpotifyTrack, SpotifyUser, SpotifyPlaylist } from '../services/spotify';

export const useSpotify = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 USESPOTIFY - Starting auth check...');
        
        // Check for OAuth callback first
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        console.log('🔍 USESPOTIFY - URL params:', { code: !!code, error });
        
        if (error) {
          console.error('❌ USESPOTIFY - OAuth error:', error);
          setError(`Spotify authentication error: ${error}`);
          setLoading(false);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
        
        if (code) {
          console.log('🔄 USESPOTIFY - Processing OAuth callback with code...');
          
          try {
            const success = await spotifyService.handleCallback(code);
            console.log('🔄 USESPOTIFY - Callback result:', success);
            
            if (success) {
              console.log('✅ USESPOTIFY - Authentication successful, getting user data...');
              const userData = await spotifyService.getCurrentUser();
              console.log('✅ USESPOTIFY - User data received:', userData.display_name);
              
              setIsAuthenticated(true);
              setUser(userData);
              setError(null);
              
              // Clean up URL after successful auth
              window.history.replaceState({}, document.title, window.location.pathname);
              console.log('✅ USESPOTIFY - Auth complete, URL cleaned');
            } else {
              console.error('❌ USESPOTIFY - Callback failed');
              setError('Failed to authenticate with Spotify');
            }
          } catch (callbackError) {
            console.error('❌ USESPOTIFY - Callback error:', callbackError);
            setError('Authentication failed. Please try again.');
          }
          
          setLoading(false);
          return;
        }
        
        // Check existing authentication
        console.log('🔍 USESPOTIFY - Checking existing auth...');
        if (spotifyService.isAuthenticated()) {
          console.log('✅ USESPOTIFY - Already authenticated, getting user data...');
          try {
            const userData = await spotifyService.getCurrentUser();
            console.log('✅ USESPOTIFY - Existing user data:', userData.display_name);
            setIsAuthenticated(true);
            setUser(userData);
            setError(null);
          } catch (userError) {
            console.error('❌ USESPOTIFY - Failed to get user data:', userError);
            // Clear invalid tokens
            spotifyService.logout();
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          console.log('ℹ️ USESPOTIFY - Not authenticated');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('❌ USESPOTIFY - Auth check failed:', err);
        setError('Authentication check failed');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
        console.log('🏁 USESPOTIFY - Auth check complete');
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async () => {
    console.log('🚀 USESPOTIFY - Starting login...');
    setError(null);
    setLoading(true);
    
    try {
      await spotifyService.login();
      // Note: login() redirects, so we won't reach here
    } catch (err) {
      console.error('❌ USESPOTIFY - Login failed:', err);
      setError(`Failed to start login: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    console.log('🚪 USESPOTIFY - Logging out...');
    spotifyService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
    setLoading(false);
  }, []);

  const searchTracks = useCallback(async (query: string): Promise<SpotifyTrack[]> => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    return spotifyService.searchTracks(query);
  }, [isAuthenticated]);

  const getUserPlaylists = useCallback(async (): Promise<SpotifyPlaylist[]> => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    return spotifyService.getUserPlaylists();
  }, [isAuthenticated]);

  const getTopTracks = useCallback(async (): Promise<SpotifyTrack[]> => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    return spotifyService.getTopTracks();
  }, [isAuthenticated]);

  const getTaylorSwiftTracks = useCallback(async (): Promise<SpotifyTrack[]> => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    console.log('🎵 Getting Taylor Swift tracks...');
    const tracks = await spotifyService.searchTracks('artist:"Taylor Swift"', 50);
    console.log('🎵 Retrieved', tracks.length, 'Taylor Swift tracks');
    return tracks;
  }, [isAuthenticated]);

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
    searchTracks,
    getUserPlaylists,
    getTopTracks,
    getTaylorSwiftTracks,
  };
};