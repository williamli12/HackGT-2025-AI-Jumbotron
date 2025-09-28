# 🏈 Sportradar NFL API Setup

This document explains how to set up the Sportradar NFL API integration for the GameSummary screen.

## 📋 Prerequisites

1. **Sportradar Account**: Sign up at [developer.sportradar.com](https://developer.sportradar.com)
2. **NFL API Access**: Subscribe to the NFL API (trial version available)
3. **API Key**: Obtain your API key from the Sportradar dashboard

## 🔧 Setup Instructions

### 1. Create Environment File

Create a `.env` file in the `second-screen` directory (same level as package.json):

```bash
# In second-screen/.env
NFL_API_KEY=your_actual_sportradar_api_key_here
```

**Important**: Replace `your_actual_sportradar_api_key_here` with your real API key from Sportradar.

### 2. Install Dependencies (Already Done)

The project is already configured with:
- `react-native-dotenv` for environment variable handling
- Babel configuration for @env imports
- TypeScript declarations for environment variables

### 3. API Configuration

The GameSummary screen is pre-configured for:
- **Game**: Cowboys vs Eagles
- **Date**: September 4th, 2025 (Week 1)
- **Game ID**: `56779053-89da-4939-bc22-9669ae1fe05a`
- **Access Level**: Trial (change to "production" if you have a paid plan)

### 4. Start the Proxy Server (Required for Web)

Due to CORS restrictions, you need to run a proxy server when testing in a web browser:

**Option 1: Start proxy server separately**
```bash
cd second-screen
npm run proxy
```

**Option 2: Start both servers at once**
```bash
cd second-screen
npm run dev
```

The proxy server will run on `http://localhost:3001` and handle API requests.

### 5. Testing the Integration

1. **Start the proxy server**: `npm run proxy` (in a separate terminal)
2. **Start the app**: `npx expo start --web` 
3. **Navigate to Game Summary**: Click the "🏈 Game Summary" button on the main screen
4. **Verify proxy connection**: You should see a blue info card saying "Using Proxy Server Mode"
5. **Fetch Data**: The screen will automatically attempt to fetch data if the API key is configured
6. **Manual Refresh**: Use the "Refresh Game Data" button to fetch updated statistics

## 📊 Available Data

The GameSummary screen displays:

- **Live Score**: Current game score and status
- **Game Information**: Quarter, clock, attendance, duration
- **Team Statistics**: Passing, rushing, receiving stats for both teams
- **Quarter-by-Quarter Scoring**: Breakdown by quarter
- **Weather Conditions**: Temperature, humidity, conditions
- **Broadcast Information**: TV, radio, streaming details
- **Team Status**: Timeouts and challenges remaining

## 🔍 API Endpoint

The integration uses the Sportradar NFL Game Statistics endpoint:

```
https://api.sportradar.com/nfl/official/trial/v7/en/games/{game_id}/statistics.json?api_key={your_key}
```

## 🚨 Rate Limits

**Trial Account Limits**:
- 1 API call per second
- 1,000 calls per month

Monitor your usage to avoid exceeding these limits.

## 🛠️ Troubleshooting

### Common Issues:

1. **"Set NFL_API_KEY" Warning**
   - Ensure `.env` file exists in `second-screen/` directory
   - Verify API key is correct and not the placeholder text

2. **HTTP 401 Unauthorized**
   - Check that your API key is valid
   - Ensure you have access to the NFL API

3. **HTTP 429 Rate Limited**
   - You've exceeded the rate limit
   - Wait before making another request

4. **HTTP 404 Not Found**
   - The game ID might be incorrect
   - Check if the game exists in the current season

5. **CORS Error (Access blocked by CORS policy)**
   - This happens when testing in a web browser
   - **Solution**: Start the proxy server with `npm run proxy`
   - Make sure proxy server is running on localhost:3001
   - The GameSummary screen should show "Using Proxy Server Mode"

6. **Proxy Server Connection Failed**
   - Error: "Cannot connect to local proxy server at localhost:3001"
   - **Solution**: Start the proxy server in a separate terminal
   - Run: `npm run proxy` or `node proxy-server.js`
   - Check that port 3001 is not being used by another application

### Debug Steps:

1. **Check Console**: Look for error messages in the browser console
2. **Verify API Key**: Test your key directly with curl:
   ```bash
   curl "https://api.sportradar.com/nfl/official/trial/v7/en/games/56779053-89da-4939-bc22-9669ae1fe05a/statistics.json?api_key=YOUR_KEY"
   ```
3. **Check Network Tab**: Inspect network requests in browser dev tools

## 📚 Documentation

- [Sportradar NFL API Documentation](https://developer.sportradar.com/football/reference/nfl-game-statistics)
- [Game Statistics Endpoint Reference](https://developer.sportradar.com/football/reference/nfl-game-statistics)

## 🔄 Updating Game Data

To fetch data for a different game:

1. **Find Game ID**: Use the Sportradar schedule endpoints to find game IDs
2. **Update GameSummary.tsx**: Change the `GAME_ID` constant
3. **Update Display**: Modify the title and date information as needed

---

**Ready to fetch live NFL game statistics!** 🏈📊
