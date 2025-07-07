# Spotify Clone with Real API Integration

A modern Spotify clone built with React, TypeScript, and Tailwind CSS that integrates with the real Spotify Web API. 

This Project involved using Bolt to create a Spotify clone beginning with the words 'I want to build a webapp that is able to play a playlist from Spotify' typed into Bolt's conversational interface. Thereafter Bolt began generating the web app project and files initially required.

Another stage was added with the development of an App using Spotify Dashboard for Developers. The App was called Taylor Swift Spotify Clone as the intention was to play a few of Tailor Swifts tracks for a demo

The remainder of the project involved selecting the correct protocols used by Spotify at this time to connect (OAuth and PKCE) the client Clone to Spotify via the Taylor Swift Spotify Clone app developed in the Spotify Dashboard.


## 🚀 Quick Start for Local Development

### 1. Use an ngrok tunnel - with static domain (see N.B. below)

To avoid having to use local addresses in the Dashboard e.g. localhost:5173 or 192.168.0.15:5173  an ngrok tunnel was set up to redirect http://localhost:5173 to https://swu.ngrok.dev. 
The reason for doing this was that Spotify and OAuth were found to have some issues dealing with localhost and local ip addresses and Bolt's webcontainer URL's were far too long for Spotify to deal with. The use of iFrames was also found to be problematic.

Due to these restrictions found during development, development proceeded using a local project folder where Bolt's project files generated at each iteration were copied to. 

An ngrok tunnel was established using 'ngrok http 5153  --domain=swu.ngrok.dev' command
which connected to the Vite development server executed with 'npm install, npm run dev commands' so that 
the Vite server was running on the following ports (standard ports)
     Local:   http://localhost:5173/
  ➜  Network: http://10.5.0.2:5173/
  ➜  Network: http://192.168.0.15:5173/

So the ngrok tunnel end point exposed at swu.ngrok.dev redirected traffic to the local network addresses. The ngrok tunnel also used a static (unchanging) domain.



### 2. Update Your Environment Variables

Edit your `.env` file with YOUR actual network IP:
```env
VITE_SPOTIFY_CLIENT_ID='...obtained from Spotify Developer Dashboard'
VITE_SPOTIFY_REDIRECT_URI=https://swu.ngrok.dev[or your ngrok domain]
```

### 3. Update Your Spotify App Settings

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Find your app: "My Spotify Clone"
3. Click "Edit Settings"
4. In **Redirect URIs**, add:
   ```
   https://swu.ngrok.dev [or other ngrok domain]
   ```  
5. **Remove** any WebContainer URLs
6. Click "Save"

### 4. Start Local Development Server

```bash
npm run dev
```

The server will start on:
- **Local:** http://localhost:5173
- **Network:** http://192.168.1.100:5173 *(your actual IP)*

### 5. Test Authentication

1. Open **https://swu.ngrok.dev** in your browser 
2. Click "Connect with Spotify"
3. Complete OAuth flow
4. You should be redirected back successfully

## 🔧 Why This Setup Works

- **ngrok uri**: Allows OAuth redirects to work properly
- **HTTP**: Spotify allows HTTP for localhost/local IPs
- **Port 5173**: Standard Vite development port
- **PKCE Flow**: Modern, secure authentication (no client secret needed)
- **No iframes**: Direct browser redirect for OAuth

## 🐛 Troubleshooting

### "Invalid redirect URI" Error
- Double-check your tunnel url 
- Ensure the IP in `.env` matches your Spotify app settings exactly
- No trailing slashes in the redirect URI
- Use HTTP (not HTTPS) for local development

### "This site can't be reached"
- Make sure you're using your **tunnel url**
- Verify the dev server is running: `npm run dev`
- Check firewall settings aren't blocking port 5173

### OAuth Issues
- Clear browser cache and localStorage
- Restart the dev server after changing `.env`
- Verify your Client ID is correct (32 characters)
- Make sure you're accessing via the tunnel [swu.ngrok.dev or other domain]


## 🚀 Production Deployment

For production (Netlify, Vercel, etc.):
1. Update redirect URI to your production domain
2. Update `VITE_SPOTIFY_REDIRECT_URI` environment variable
3. Use HTTPS for production

## ⚠️ Important Notes

- **Always use your ngrok tunnel domain for Spotify OAuth with a static domain. this has to 
- **be purchased for a small fee (see https://ngrok.com) but makes things simpler as using 
- **an ngrok free domain caused problems due to continual reassignment 
- **HTTP is fine** for local development with network IPs
- **Spotify Premium required** for music playback
- **PKCE authentication** - secure and modern
- **Production Deployment e.g. using Netlify requires a corporate email account (not
- **hotmail)

## Features

- 🎵 Real Spotify authentication with PKCE flow
- 🎨 Authentic Spotify UI/UX design
- 🔍 Search tracks, artists, albums, and playlists
- 📱 Fully responsive design
- 🎧 Music playback controls (Premium required)
- 📋 Access to your real playlists and library
- 🔐 Secure OAuth 2.0 with PKCE (no client secret needed)
- 🚫 No iframes - direct browser redirect for security

Christopher Harry - 7th July, 2025