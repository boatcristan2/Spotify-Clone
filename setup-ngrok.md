# 🚀 Spotify OAuth Setup with ngrok (2025 Solution)

Since Spotify has discontinued localhost support and requires HTTPS, we'll use **ngrok** to create a secure tunnel to your local development server.

## Step 1: Install ngrok

### Option A: Download from ngrok.com (Recommended)
1. Go to [ngrok.com](https://ngrok.com)
2. Sign up for a free account
3. Download ngrok for your operating system
4. Follow their installation instructions

### Option B: Using Package Managers

**Windows (Chocolatey):**
```bash
choco install ngrok
```

**Mac (Homebrew):**
```bash
brew install ngrok/ngrok/ngrok
```

**Linux (Snap):**
```bash
sudo snap install ngrok
```

## Step 2: Authenticate ngrok

After installing, authenticate with your ngrok account:
```bash
ngrok config add-authtoken YOUR_NGROK_TOKEN
```

Get your token from: https://dashboard.ngrok.com/get-started/your-authtoken

## Step 3: Get a Static Domain (Free)

1. Go to [ngrok Dashboard](https://dashboard.ngrok.com/cloud-edge/domains)
2. Click "Create Domain" or "New Domain"
3. You'll get a free static domain like: `your-name-123.ngrok-free.app`
4. Copy this domain name

## Step 4: Update Your Configuration

### Update .env file:
```env
VITE_SPOTIFY_CLIENT_ID=fe1a8f024ec84aa7971fb462cf3c4fb0
VITE_SPOTIFY_REDIRECT_URI=https://your-name-123.ngrok-free.app
```

### Update package.json tunnel script:
```json
{
  "scripts": {
    "tunnel": "ngrok http 5173 --domain=your-name-123.ngrok-free.app"
  }
}
```

## Step 5: Update Spotify App Settings

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Find your app and click "Edit Settings"
3. In **Redirect URIs**, add:
   ```
   https://your-name-123.ngrok-free.app
   ```
4. **Remove** all other redirect URIs
5. Click "Save"

## Step 6: Start Development

### Terminal 1 - Start Vite:
```bash
npm run dev
```

### Terminal 2 - Start ngrok tunnel:
```bash
npm run tunnel
```

Or use the combined command:
```bash
npm run dev:tunnel
```

## Step 7: Access Your App

1. Open your ngrok URL: `https://your-name-123.ngrok-free.app`
2. You may see an ngrok warning page - click "Visit Site"
3. Your Spotify app will load with working OAuth!

## 🎯 Why This Works

- ✅ **HTTPS**: ngrok provides secure HTTPS tunnels
- ✅ **Static Domain**: Free static domains work with OAuth
- ✅ **No Certificates**: ngrok handles all SSL/TLS
- ✅ **Real URLs**: Spotify accepts ngrok domains
- ✅ **Free**: ngrok free tier is sufficient for development

## 🔧 Troubleshooting

### "Visit Site" Warning
- This is normal for free ngrok domains
- Click "Visit Site" to continue
- Users will see this warning but can proceed

### Tunnel Disconnected
- Free ngrok tunnels disconnect after 2 hours
- Just restart: `npm run tunnel`
- Static domain stays the same

### OAuth Still Failing
1. Double-check your ngrok domain in Spotify settings
2. Ensure .env file has the correct domain
3. Restart both dev server and tunnel
4. Clear browser cache

## 🚀 Alternative: Paid ngrok

For a better experience:
- $8/month removes the warning page
- Longer tunnel sessions
- Custom domains
- Better performance

## 📱 Mobile Testing

Since ngrok creates real HTTPS URLs:
1. Open `https://your-name-123.ngrok-free.app` on any device
2. OAuth works perfectly on mobile
3. No network configuration needed

This is the most reliable solution for Spotify OAuth in 2025! 🎉