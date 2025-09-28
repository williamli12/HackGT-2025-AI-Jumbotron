# 🔧 CORS Solution - Proxy Server Setup

## 🚨 Problem
When testing the GameSummary screen in a web browser, you get this error:
```
Access to fetch at 'https://api.sportradar.com/...' from origin 'http://localhost:8081' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present 
on the requested resource.
```

## ✅ Solution
We've created a local proxy server that bypasses CORS restrictions by making the API calls server-side.

## 🚀 Quick Setup

### 1. Start the Proxy Server
```bash
cd second-screen
npm run proxy
```

You should see:
```
🚀 NFL API Proxy Server Started
📍 Server running at: http://localhost:3001
🏥 Health check: http://localhost:3001/health
💡 Ready to proxy NFL API requests and bypass CORS! 🏆
```

### 2. Start the React Native App
In a **separate terminal**:
```bash
cd second-screen
npx expo start --web
```

### 3. Test the Integration
1. Open the app in your browser (usually `http://localhost:8081`)
2. Click "🏈 Game Summary" button
3. You should see a blue info card: "🔄 Using Proxy Server Mode"
4. The app will automatically fetch data through the proxy

## 🔍 How It Works

```
React Native App (localhost:8081)
         ↓
Proxy Server (localhost:3001)
         ↓
Sportradar API (api.sportradar.com)
```

1. **Your app** makes requests to `http://localhost:3001/api/nfl/games/{gameId}/statistics`
2. **Proxy server** forwards the request to Sportradar API
3. **Sportradar** responds to the proxy server
4. **Proxy server** sends the response back to your app (with CORS headers)

## 🛠️ Available Scripts

- `npm run proxy` - Start proxy server only
- `npm run web` - Start React Native web only  
- `npm run dev` - Start both proxy and web servers simultaneously

## 🔍 Testing the Proxy

Test the proxy server directly:
```bash
# Health check
curl http://localhost:3001/health

# Game statistics (replace YOUR_API_KEY)
curl "http://localhost:3001/api/nfl/games/56779053-89da-4939-bc22-9669ae1fe05a/statistics?api_key=YOUR_API_KEY"
```

## 🚨 Troubleshooting

### Proxy Server Won't Start
- **Error**: `EADDRINUSE: address already in use :::3001`
- **Solution**: Kill any process using port 3001:
  ```bash
  # Windows
  netstat -ano | findstr :3001
  taskkill /PID <PID_NUMBER> /F
  
  # Mac/Linux
  lsof -ti:3001 | xargs kill -9
  ```

### "Cannot connect to proxy server"
- Make sure proxy server is running: `npm run proxy`
- Check that you see the startup messages
- Test health endpoint: `curl http://localhost:3001/health`

### Still Getting CORS Errors
- Verify the GameSummary screen shows "🔄 Using Proxy Server Mode"
- Check browser console for the actual request URL (should be localhost:3001)
- Restart both servers with cache clear: `npx expo start --web --clear`

## 📱 Mobile Testing

**Good news**: CORS restrictions only apply to web browsers! 

If you test on a mobile device or emulator:
- No proxy server needed
- Direct API calls work fine
- Set `USE_PROXY = false` in GameSummary.tsx for mobile testing

## 🎯 Production Deployment

For production deployment:
- Deploy the proxy server to a cloud service (Heroku, Vercel, etc.)
- Update the proxy URL in GameSummary.tsx
- Or implement server-side API calls in your backend

---

**Your CORS issues are now solved!** 🎉
