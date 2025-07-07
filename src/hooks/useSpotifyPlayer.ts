import { useState, useEffect, useCallback, useRef } from 'react';
import { spotifyService } from '../services/spotify';

interface PlayerState {
  isReady: boolean;
  isActive: boolean;
  isPlaying: boolean;
  currentTrack: any | null;
  position: number;
  duration: number;
  volume: number;
  deviceId: string | null;
}

export const useSpotifyPlayer = () => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    isReady: false,
    isActive: false,
    isPlaying: false,
    currentTrack: null,
    position: 0,
    duration: 0,
    volume: 0.5,
    deviceId: null,
  });

  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializationAttempted = useRef(false);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (!spotifyService.isAuthenticated() || initializationAttempted.current) return;

    const initializePlayer = () => {
      console.log('🎵 Initializing Spotify Web Player...');
      
      if (!window.Spotify) {
        console.error('❌ Spotify Web Playback SDK not loaded');
        setError('Spotify Web Playback SDK not available. Please refresh the page.');
        return;
      }

      if (initializationAttempted.current) {
        console.log('⚠️ Player initialization already attempted');
        return;
      }

      initializationAttempted.current = true;

      try {
        const player = new window.Spotify.Player({
          name: 'Taylor Swift Spotify Clone',
          getOAuthToken: (cb) => {
            const token = localStorage.getItem('spotify_access_token');
            console.log('🔑 Providing OAuth token to player:', !!token);
            if (token) {
              cb(token);
            } else {
              console.error('❌ No access token available for player');
              setError('No access token available');
            }
          },
          volume: 0.5,
        });

        // Error handling
        player.addListener('initialization_error', ({ message }) => {
          console.error('❌ Player Initialization Error:', message);
          setError(`Player Initialization Error: ${message}`);
        });

        player.addListener('authentication_error', ({ message }) => {
          console.error('❌ Player Authentication Error:', message);
          setError(`Authentication Error: ${message}. Please refresh and log in again.`);
        });

        player.addListener('account_error', ({ message }) => {
          console.error('❌ Player Account Error:', message);
          setError(`Account Error: ${message}. Spotify Premium required for Web Playback.`);
        });

        player.addListener('playback_error', ({ message }) => {
          console.error('❌ Player Playback Error:', message);
          setError(`Playback Error: ${message}`);
        });

        // Playback status updates
        player.addListener('player_state_changed', (state) => {
          if (!state) {
            console.log('ℹ️ Player state is null');
            return;
          }

          console.log('🎵 Player state changed:', {
            paused: state.paused,
            position: state.position,
            track: state.track_window.current_track?.name
          });

          setPlayerState(prev => ({
            ...prev,
            isPlaying: !state.paused,
            currentTrack: state.track_window.current_track,
            position: state.position,
            duration: state.track_window.current_track?.duration_ms || 0,
          }));

          // Start position tracking when playing
          if (!state.paused && !intervalRef.current) {
            intervalRef.current = setInterval(() => {
              setPlayerState(prev => ({
                ...prev,
                position: Math.min(prev.position + 1000, prev.duration),
              }));
            }, 1000);
          } else if (state.paused && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        });

        // Ready
        player.addListener('ready', ({ device_id }) => {
          console.log('✅ Player ready with Device ID:', device_id);
          setPlayerState(prev => ({
            ...prev,
            isReady: true,
            deviceId: device_id,
          }));
          setError(null);
        });

        // Not Ready
        player.addListener('not_ready', ({ device_id }) => {
          console.log('❌ Player device has gone offline:', device_id);
          setPlayerState(prev => ({
            ...prev,
            isReady: false,
            deviceId: null,
          }));
        });

        // Connect to the player
        player.connect().then((success) => {
          if (success) {
            console.log('✅ Successfully connected to Spotify Web Playback SDK');
          } else {
            console.error('❌ Failed to connect to Spotify Web Playback SDK');
            setError('Failed to connect to Spotify Web Playback SDK');
          }
        });

        playerRef.current = player;
      } catch (error) {
        console.error('❌ Error creating Spotify player:', error);
        setError('Failed to create Spotify player. Please refresh the page.');
      }
    };

    // Listen for SDK ready event
    const handleSDKReady = () => {
      console.log('🎵 SDK ready event received');
      initializePlayer();
    };

    // Check if SDK is already loaded
    if (window.Spotify) {
      console.log('🎵 Spotify SDK already loaded');
      initializePlayer();
    } else {
      console.log('⏳ Waiting for Spotify Web Playback SDK...');
      window.addEventListener('spotifySDKReady', handleSDKReady);
    }

    return () => {
      window.removeEventListener('spotifySDKReady', handleSDKReady);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playerRef.current) {
        console.log('🔌 Disconnecting Spotify player...');
        playerRef.current.disconnect();
      }
    };
  }, []);

  // Transfer playback to this device
  const transferPlayback = useCallback(async () => {
    if (!playerState.deviceId) {
      console.error('❌ No device ID available for transfer');
      return false;
    }

    try {
      console.log('📱 Transferring playback to device:', playerState.deviceId);
      await spotifyService.transferPlayback(playerState.deviceId);
      setPlayerState(prev => ({ ...prev, isActive: true }));
      console.log('✅ Playback transferred successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to transfer playback:', error);
      setError('Failed to transfer playback to this device. Premium account required.');
      return false;
    }
  }, [playerState.deviceId]);

  // Play a specific track
  const playTrack = useCallback(async (trackUri: string) => {
    if (!playerState.deviceId) {
      console.error('❌ Player not ready - no device ID');
      setError('Player not ready');
      return false;
    }

    try {
      console.log('▶️ Playing track:', trackUri);
      await spotifyService.playTrack(trackUri, playerState.deviceId);
      console.log('✅ Track play command sent');
      return true;
    } catch (error) {
      console.error('❌ Failed to play track:', error);
      setError('Failed to play track. Spotify Premium required for music playback.');
      return false;
    }
  }, [playerState.deviceId]);

  // Control functions
  const togglePlay = useCallback(async () => {
    if (!playerRef.current) {
      console.error('❌ Player not available');
      return;
    }
    try {
      console.log('⏯️ Toggling play/pause');
      await playerRef.current.togglePlay();
    } catch (error) {
      console.error('❌ Failed to toggle play:', error);
      setError('Playback control failed. Premium account required.');
    }
  }, []);

  const nextTrack = useCallback(async () => {
    if (!playerRef.current) return;
    try {
      console.log('⏭️ Skipping to next track');
      await playerRef.current.nextTrack();
    } catch (error) {
      console.error('❌ Failed to skip to next track:', error);
      setError('Track control failed. Premium account required.');
    }
  }, []);

  const previousTrack = useCallback(async () => {
    if (!playerRef.current) return;
    try {
      console.log('⏮️ Skipping to previous track');
      await playerRef.current.previousTrack();
    } catch (error) {
      console.error('❌ Failed to skip to previous track:', error);
      setError('Track control failed. Premium account required.');
    }
  }, []);

  const seek = useCallback(async (position: number) => {
    if (!playerRef.current) return;
    try {
      console.log('⏩ Seeking to position:', position);
      await playerRef.current.seek(position);
      setPlayerState(prev => ({ ...prev, position }));
    } catch (error) {
      console.error('❌ Failed to seek:', error);
      setError('Seek control failed. Premium account required.');
    }
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    if (!playerRef.current) return;
    try {
      console.log('🔊 Setting volume to:', Math.round(volume * 100) + '%');
      await playerRef.current.setVolume(volume);
      setPlayerState(prev => ({ ...prev, volume }));
    } catch (error) {
      console.error('❌ Failed to set volume:', error);
      setError('Volume control failed. Premium account required.');
    }
  }, []);

  return {
    playerState,
    error,
    transferPlayback,
    playTrack,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
  };
};