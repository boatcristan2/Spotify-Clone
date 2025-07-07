import React from 'react';
import { useSpotify } from '../hooks/useSpotify';

export const DebugPanel: React.FC = () => {
  const { isAuthenticated, user, loading, error } = useSpotify();

  const debugInfo = {
    isAuthenticated,
    user: user ? {
      id: user.id,
      name: user.display_name,
      email: user.email
    } : null,
    loading,
    error,
    localStorage: {
      accessToken: localStorage.getItem('spotify_access_token') ? 'Present' : 'Missing',
      refreshToken: localStorage.getItem('spotify_refresh_token') ? 'Present' : 'Missing',
      tokenExpiry: localStorage.getItem('spotify_token_expiry'),
      authState: localStorage.getItem('spotify_auth_state'),
    },
    environment: {
      clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID ? 'Present' : 'MISSING',
      redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
      currentUrl: window.location.href,
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md z-50 border border-gray-600">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-green-400">🐛 Debug Panel</h3>
        <button 
          onClick={() => {
            const panel = document.querySelector('.debug-panel');
            if (panel) panel.remove();
          }}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
            Auth Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
          </strong>
        </div>
        
        <div>
          <strong>Loading:</strong> {loading ? '⏳ Yes' : '✅ No'}
        </div>
        
        {error && (
          <div>
            <strong className="text-red-400">Error:</strong> {error}
          </div>
        )}
        
        <div>
          <strong>User:</strong> {user ? `${user.display_name} (${user.id})` : 'None'}
        </div>
        
        <div>
          <strong>Tokens:</strong>
          <div className="ml-2">
            Access: {debugInfo.localStorage.accessToken}<br/>
            Refresh: {debugInfo.localStorage.refreshToken}<br/>
            Expiry: {debugInfo.localStorage.tokenExpiry ? new Date(parseInt(debugInfo.localStorage.tokenExpiry)).toLocaleString() : 'None'}<br/>
            State: {debugInfo.localStorage.authState || 'None'}
          </div>
        </div>
        
        <div>
          <strong>Environment:</strong>
          <div className="ml-2">
            Client ID: {debugInfo.environment.clientId}<br/>
            Redirect: {debugInfo.environment.redirectUri}<br/>
            Current URL: {debugInfo.environment.currentUrl.substring(0, 50)}...
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-600">
          <button 
            onClick={() => {
              console.log('🐛 Full Debug Info:', debugInfo);
              console.log('🐛 Full localStorage:', { ...localStorage });
            }}
            className="bg-blue-600 text-white px-2 py-1 rounded text-xs mr-2"
          >
            Log Full State
          </button>
          
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="bg-red-600 text-white px-2 py-1 rounded text-xs"
          >
            Clear & Reload
          </button>
        </div>
      </div>
    </div>
  );
};