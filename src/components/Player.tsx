import React, { useEffect, useRef } from 'react';
import { Heart, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Volume2 } from 'lucide-react';
import { Track } from './TrackRow';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';
import { useNotification } from '../hooks/useNotification';
import { useSpotify } from '../hooks/useSpotify';

interface PlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onTrackChange?: (track: Track) => void;
}

export const Player: React.FC<PlayerProps> = ({ 
  currentTrack, 
  isPlaying, 
  onTogglePlay,
  onTrackChange 
}) => {
  const { 
    playerState, 
    error, 
    transferPlayback, 
    playTrack, 
    togglePlay, 
    nextTrack, 
    previousTrack, 
    seek, 
    setVolume 
  } = useSpotifyPlayer();
  
  const { showNotification } = useNotification();
  const { isAuthenticated } = useSpotify();

  // Refs to prevent oscillation
  const lastPlayedTrackRef = useRef<string | null>(null);
  const isPlayingTrackRef = useRef<boolean>(false);
  const rateLimitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-transfer playback when player is ready
  useEffect(() => {
    if (playerState.isReady && !playerState.isActive) {
      const timer = setTimeout(() => {
        transferPlayback().then((success) => {
          if (success) {
            showNotification('🎵 Spotify Premium connected! Ready to play music!');
          }
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [playerState.isReady, playerState.isActive, transferPlayback, showNotification]);

  // Show errors with helpful messages
  useEffect(() => {
    if (error) {
      if (error.includes('Premium')) {
        showNotification('⚠️ Spotify Premium required for music playback');
      } else if (error.includes('authentication')) {
        showNotification('🔄 Reconnecting to Spotify...');
      } else if (error.includes('429')) {
        showNotification('⏸ Rate limited - please wait a moment');
      } else {
        showNotification(`❌ ${error}`);
      }
    }
  }, [error, showNotification]);

  // Update current track when Spotify player changes (but prevent oscillation)
  useEffect(() => {
    if (playerState.currentTrack && onTrackChange) {
      const spotifyTrackUri = playerState.currentTrack.uri;
      
      // Only update if it's actually a different track and not oscillating
      if (spotifyTrackUri !== lastPlayedTrackRef.current) {
        const spotifyTrack: Track = {
          id: playerState.currentTrack.id,
          name: playerState.currentTrack.name,
          artist: playerState.currentTrack.artists[0]?.name || 'Unknown Artist',
          album: playerState.currentTrack.album.name,
          duration: formatDuration(playerState.currentTrack.duration_ms),
          emoji: '🎵',
          uri: playerState.currentTrack.uri
        };
        
        console.log('🔄 Player state track changed to:', spotifyTrack.name);
        onTrackChange(spotifyTrack);
        lastPlayedTrackRef.current = spotifyTrackUri;
      }
    }
  }, [playerState.currentTrack?.uri, onTrackChange]);

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayClick = async () => {
    console.log('🎮 Play button clicked');
    console.log('🎮 Player state:', {
      isReady: playerState.isReady,
      isActive: playerState.isActive,
      isAuthenticated
    });
    
    if (playerState.isReady && playerState.isActive) {
      // If we have a current track URI and it's different from what's playing, play the new track
      if (currentTrack.uri && (!playerState.currentTrack || playerState.currentTrack.uri !== currentTrack.uri)) {
        console.log('🎵 Playing new track:', currentTrack.name, currentTrack.uri);
        
        // Prevent rapid successive calls
        if (isPlayingTrackRef.current) {
          console.log('⚠️ Already playing a track, skipping');
          return;
        }
        
        isPlayingTrackRef.current = true;
        const playSuccess = await playTrack(currentTrack.uri);
        isPlayingTrackRef.current = false;
        
        if (playSuccess) {
          showNotification(`🎵 Now playing: ${currentTrack.name}`);
          lastPlayedTrackRef.current = currentTrack.uri;
        }
      } else {
        // Same track, just toggle play/pause
        await togglePlay();
        showNotification(playerState.isPlaying ? '⏸ Paused' : '▶ Playing');
      }
    } else if (playerState.isReady && !playerState.isActive) {
      // Try to transfer playback first, then play
      const success = await transferPlayback();
      if (success) {
        // Wait a moment for transfer to complete
        setTimeout(async () => {
          if (currentTrack.uri) {
            isPlayingTrackRef.current = true;
            const playSuccess = await playTrack(currentTrack.uri);
            isPlayingTrackRef.current = false;
            
            if (playSuccess) {
              showNotification(`🎵 Now playing: ${currentTrack.name}`);
              lastPlayedTrackRef.current = currentTrack.uri;
            }
          }
        }, 500);
      } else {
        showNotification('⚠️ Unable to connect to Spotify. Please try refreshing.');
      }
    } else {
      // Player not ready yet or not authenticated
      if (isAuthenticated) {
        showNotification('⏳ Connecting to Spotify Premium...');
      } else {
        onTogglePlay(); // Fallback to demo mode
      }
    }
  };

  // Auto-play when currentTrack changes (with debouncing and oscillation prevention)
  useEffect(() => {
    // Clear any existing timeout
    if (rateLimitTimeoutRef.current) {
      clearTimeout(rateLimitTimeoutRef.current);
    }

    // Only auto-play if conditions are met and we're not already playing this track
    if (
      playerState.isReady && 
      playerState.isActive && 
      currentTrack.uri &&
      currentTrack.uri !== lastPlayedTrackRef.current &&
      !isPlayingTrackRef.current
    ) {
      console.log('🎵 Auto-play conditions met for:', currentTrack.name);
      
      // Debounce the auto-play to prevent rapid successive calls
      rateLimitTimeoutRef.current = setTimeout(async () => {
        // Double-check conditions haven't changed
        if (
          currentTrack.uri !== lastPlayedTrackRef.current &&
          !isPlayingTrackRef.current &&
          playerState.isReady &&
          playerState.isActive
        ) {
          console.log('🎵 Auto-playing track:', currentTrack.name);
          isPlayingTrackRef.current = true;
          
          try {
            const success = await playTrack(currentTrack.uri);
            if (success) {
              showNotification(`🎵 Now playing: ${currentTrack.name}`);
              lastPlayedTrackRef.current = currentTrack.uri;
            }
          } catch (error) {
            console.error('Auto-play failed:', error);
          } finally {
            isPlayingTrackRef.current = false;
          }
        }
      }, 300); // 300ms debounce
    }

    return () => {
      if (rateLimitTimeoutRef.current) {
        clearTimeout(rateLimitTimeoutRef.current);
      }
    };
  }, [currentTrack.uri, playerState.isReady, playerState.isActive, playTrack, showNotification]);

  const handleTrackClick = async (trackUri?: string) => {
    if (playerState.isReady && playerState.isActive && trackUri) {
      const success = await playTrack(trackUri);
      if (success) {
        showNotification(`🎵 Playing: ${currentTrack.name}`);
        lastPlayedTrackRef.current = trackUri;
      }
    } else if (playerState.isReady && !playerState.isActive) {
      // Transfer playback first
      const transferSuccess = await transferPlayback();
      if (transferSuccess && trackUri) {
        setTimeout(async () => {
          await playTrack(trackUri);
          lastPlayedTrackRef.current = trackUri;
        }, 500);
      }
    }
  };

  const handleSeek = async (event: React.MouseEvent<HTMLDivElement>) => {
    const progress = event.currentTarget;
    const rect = progress.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    
    if (playerState.isReady && playerState.isActive && playerState.duration > 0) {
      const position = Math.floor(percent * playerState.duration);
      await seek(position);
      showNotification('⏩ Seeking...');
    } else {
      showNotification('⚠️ Connect to Spotify Premium for seek controls');
    }
  };

  const handleVolumeChange = async (event: React.MouseEvent<HTMLDivElement>) => {
    const volumeBar = event.currentTarget;
    const rect = volumeBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    
    if (playerState.isReady) {
      await setVolume(percent);
      showNotification(`🔊 Volume: ${Math.round(percent * 100)}%`);
    } else {
      showNotification('⚠️ Connect to Spotify Premium for volume controls');
    }
  };

  const handleNextTrack = async () => {
    if (playerState.isReady && playerState.isActive) {
      await nextTrack();
      showNotification('⏭️ Next track');
    } else {
      showNotification('⚠️ Connect to Spotify Premium for track controls');
    }
  };

  const handlePreviousTrack = async () => {
    if (playerState.isReady && playerState.isActive) {
      await previousTrack();
      showNotification('⏮️ Previous track');
    } else {
      showNotification('⚠️ Connect to Spotify Premium for track controls');
    }
  };

  // Use Spotify player state if available, otherwise use props
  const displayTrack = playerState.currentTrack ? {
    name: playerState.currentTrack.name,
    artist: playerState.currentTrack.artists[0]?.name || 'Unknown Artist',
    emoji: '🎵'
  } : currentTrack;

  const displayIsPlaying = playerState.isActive ? playerState.isPlaying : isPlaying;
  const currentPosition = playerState.position;
  const totalDuration = playerState.duration;

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-3 fixed bottom-0 left-0 right-0">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Now Playing */}
        <div className="flex items-center gap-4 w-80">
          <div className="w-14 h-14 rounded bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-xl">
            {displayTrack.emoji}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{displayTrack.name}</p>
            <p className="text-zinc-400 text-xs">{displayTrack.artist}</p>
          </div>
          <Heart size={16} className="text-zinc-400 hover:text-white cursor-pointer transition-colors" />
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
          <div className="flex items-center gap-4">
            <button 
              className="text-zinc-400 hover:text-white transition-colors"
              onClick={() => showNotification('🔀 Shuffle - Available with Premium')}
            >
              <Shuffle size={20} />
            </button>
            
            <button 
              onClick={handlePreviousTrack}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <SkipBack size={20} />
            </button>
            
            <button 
              onClick={handlePlayClick}
              className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
            >
              {displayIsPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            
            <button 
              onClick={handleNextTrack}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <SkipForward size={20} />
            </button>

            <button 
              className="text-zinc-400 hover:text-white transition-colors"
              onClick={() => showNotification('🔁 Repeat - Available with Premium')}
            >
              <Repeat size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-xs text-zinc-400">
              {formatDuration(currentPosition)}
            </span>
            <div className="flex-1 h-1 bg-zinc-600 rounded-full cursor-pointer" onClick={handleSeek}>
              <div 
                className="progress-fill h-1 bg-white rounded-full hover:bg-green-500 transition-colors"
                style={{ 
                  width: totalDuration > 0 ? `${(currentPosition / totalDuration) * 100}%` : '0%' 
                }}
              ></div>
            </div>
            <span className="text-xs text-zinc-400">
              {totalDuration > 0 ? formatDuration(totalDuration) : currentTrack.duration}
            </span>
          </div>

          {/* Player Status */}
          <div className="text-xs">
            {!isAuthenticated ? (
              <span className="text-yellow-400">⚠️ Demo Mode - Connect Spotify for real playback</span>
            ) : playerState.isReady ? (
              playerState.isActive ? (
                <span className="text-green-400">🎵 Spotify Premium Connected & Ready</span>
              ) : (
                <span className="text-yellow-400">⏸ Spotify Premium Ready - Click play to activate</span>
              )
            ) : (
              <span className="text-blue-400">🔄 Connecting to Spotify Premium...</span>
            )}
          </div>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-3 w-80 justify-end">
          <Volume2 size={16} className="text-zinc-400" />
          <div className="w-24 h-1 bg-zinc-600 rounded-full cursor-pointer" onClick={handleVolumeChange}>
            <div 
              className="volume-fill h-1 bg-white rounded-full hover:bg-green-500 transition-colors"
              style={{ width: `${playerState.volume * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};