// Spotify Web API Service
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-top-read'
].join(' ');

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  preview_url: string | null;
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
  };
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string }>;
}

class SpotifyService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    // Load stored tokens
    this.accessToken = localStorage.getItem('spotify_access_token');
    this.refreshToken = localStorage.getItem('spotify_refresh_token');
    const expiry = localStorage.getItem('spotify_token_expiry');
    this.tokenExpiry = expiry ? parseInt(expiry) : null;
  }

  // Generate PKCE challenge
  private async generateCodeChallenge(): Promise<{ codeVerifier: string; codeChallenge: string }> {
    const codeVerifier = this.generateRandomString(128);
    
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    const codeChallenge = btoa(String.fromCharCode(...hashArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return { codeVerifier, codeChallenge };
  }

  private generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
  }

  // Start OAuth flow
  public async login(): Promise<void> {
    console.log('🚀 Starting Spotify login...');
    
    if (!CLIENT_ID || !REDIRECT_URI) {
      throw new Error('Missing Spotify configuration');
    }
    
    this.logout(); // Clear any existing tokens
    
    try {
      const { codeVerifier, codeChallenge } = await this.generateCodeChallenge();
      
      localStorage.setItem('spotify_code_verifier', codeVerifier);
      
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: SCOPES,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        show_dialog: 'false'
      });

      const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
      console.log('🔗 Redirecting to Spotify...');
      
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to start login:', error);
      localStorage.removeItem('spotify_code_verifier');
      throw new Error('Failed to start authentication');
    }
  }

  // Handle OAuth callback
  public async handleCallback(code: string): Promise<boolean> {
    console.log('🔄 SPOTIFY SERVICE - Handling OAuth callback with code:', code.substring(0, 10) + '...');
    
    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    
    if (!codeVerifier) {
      console.error('❌ SPOTIFY SERVICE - Code verifier not found in localStorage');
      throw new Error('Code verifier not found');
    }

    console.log('🔑 SPOTIFY SERVICE - Code verifier found, exchanging for tokens...');

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier,
        }),
      });

      if (!response.ok) {
        console.error('❌ SPOTIFY SERVICE - Token exchange failed:', response.status);
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      console.log('✅ SPOTIFY SERVICE - Tokens received, storing...');

      // Store tokens
      localStorage.setItem('spotify_access_token', this.accessToken);
      if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', this.refreshToken);
      }
      localStorage.setItem('spotify_token_expiry', this.tokenExpiry.toString());
      
      // Clean up
      localStorage.removeItem('spotify_code_verifier');
      
      console.log('✅ SPOTIFY SERVICE - Token exchange and storage complete');
      return true;
    } catch (error) {
      console.error('❌ SPOTIFY SERVICE - Token exchange failed:', error);
      localStorage.removeItem('spotify_code_verifier');
      throw error;
    }
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    console.log('🔍 SPOTIFY SERVICE - Checking authentication...');
    
    const now = Date.now();
    
    const hasValidToken = !!(
      this.accessToken && 
      this.accessToken.length > 50 && 
      this.tokenExpiry && 
      now < this.tokenExpiry
    );
    
    console.log('🔍 SPOTIFY SERVICE - Auth check result:', hasValidToken);
    
    if (!hasValidToken && (this.accessToken || this.refreshToken)) {
      console.log('⚠️ SPOTIFY SERVICE - Invalid tokens found, clearing...');
      this.logout();
    }

    return hasValidToken;
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      localStorage.setItem('spotify_access_token', this.accessToken);
      localStorage.setItem('spotify_token_expiry', this.tokenExpiry.toString());
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Make authenticated API request
  private async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.isAuthenticated()) {
      if (!(await this.refreshAccessToken())) {
        throw new Error('Not authenticated');
      }
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (await this.refreshAccessToken()) {
          return this.apiRequest(endpoint, options);
        }
        throw new Error('Authentication failed');
      }
      
      // Handle empty response for 204 status
      if (response.status === 204) {
        return null;
      }
      
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    // Handle empty response
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  // Get current user profile
  public async getCurrentUser(): Promise<SpotifyUser> {
    return this.apiRequest('/me');
  }

  // Search for tracks
  public async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    console.log('🔍 Searching Spotify for:', query, 'limit:', limit);
    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit.toString(),
    });

    const data = await this.apiRequest(`/search?${params.toString()}`);
    console.log('🔍 Search results:', data.tracks.items.length, 'tracks');
    return data.tracks.items;
  }

  // Get user's playlists
  public async getUserPlaylists(): Promise<SpotifyPlaylist[]> {
    const data = await this.apiRequest('/me/playlists?limit=50');
    return data.items;
  }

  // Get user's top tracks
  public async getTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyTrack[]> {
    const data = await this.apiRequest(`/me/top/tracks?time_range=${timeRange}&limit=50`);
    return data.items;
  }

  // Transfer playback to a device
  public async transferPlayback(deviceId: string): Promise<void> {
    console.log('📱 Transferring playback to device:', deviceId);
    await this.apiRequest('/me/player', {
      method: 'PUT',
      body: JSON.stringify({
        device_ids: [deviceId],
        play: false,
      }),
    });
    console.log('✅ Playback transferred');
  }

  // Play a track on a specific device
  public async playTrack(trackUri: string, deviceId: string): Promise<void> {
    console.log('▶️ Playing track:', trackUri, 'on device:', deviceId);
    await this.apiRequest(`/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({
        uris: [trackUri],
      }),
    });
    console.log('✅ Track started playing');
  }

  // Get current playback state
  public async getCurrentPlayback(): Promise<any> {
    try {
      return await this.apiRequest('/me/player');
    } catch (error) {
      console.log('ℹ️ No active playback device');
      return null;
    }
  }

  // Logout
  public logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    
    const keysToRemove = [
      'spotify_access_token',
      'spotify_refresh_token', 
      'spotify_token_expiry',
      'spotify_code_verifier'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

export const spotifyService = new SpotifyService();