import React from 'react';
import { useSpotify } from '../hooks/useSpotify';

export const SpotifyAuth: React.FC = () => {
  const { loading, error, login } = useSpotify();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Connecting to Spotify...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Connection Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
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
            <button 
              onClick={() => {
                localStorage.clear();
                login();
              }}
              className="bg-gray-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-600 transition-colors block w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-green-900">
      <div className="text-center max-w-lg px-8">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-black font-bold text-2xl">♪</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">🎵 Taylor Swift Spotify</h1>
          <p className="text-gray-300 text-lg mb-8">
            Connect your Spotify Premium account to access real Taylor Swift music, playlists, and personalized recommendations.
          </p>
        </div>
        
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400 text-xl">⚠️</span>
            <span className="text-yellow-400 font-semibold">Spotify Premium Required</span>
          </div>
          <p className="text-yellow-200 text-sm">
            Music playback requires Spotify Premium. Free accounts can browse and see tracks but cannot stream audio.
          </p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-green-400">
            <span className="text-xl">✓</span>
            <span>Access your real Taylor Swift playlists</span>
          </div>
          <div className="flex items-center gap-3 text-green-400">
            <span className="text-xl">✓</span>
            <span>Browse your Spotify library</span>
          </div>
          <div className="flex items-center gap-3 text-green-400">
            <span className="text-xl">✓</span>
            <span>Discover new Taylor Swift tracks</span>
          </div>
          <div className="flex items-center gap-3 text-yellow-400">
            <span className="text-xl">🎵</span>
            <span>Stream music (Premium only)</span>
          </div>
        </div>

        <button 
          onClick={login}
          className="bg-green-500 text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-green-400 transition-all hover:scale-105 shadow-lg"
        >
          Connect with Spotify
        </button>
        
        <p className="text-gray-400 text-sm mt-6">
          Secure OAuth 2.0 with PKCE • No passwords stored
        </p>
      </div>
    </div>
  );
};