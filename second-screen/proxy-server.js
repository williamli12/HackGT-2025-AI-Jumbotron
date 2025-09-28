/**
 * Simple Express proxy server to bypass CORS restrictions
 * for Sportradar NFL API calls from the React Native web app
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:19006', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'NFL API Proxy Server is running',
    timestamp: new Date().toISOString()
  });
});

// Proxy endpoint for NFL game statistics
app.get('/api/nfl/games/:gameId/statistics', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { api_key } = req.query;
    
    if (!api_key) {
      return res.status(400).json({ 
        error: 'Missing API key',
        message: 'api_key parameter is required'
      });
    }

    // Build the Sportradar API URL
    const sportradarUrl = `https://api.sportradar.com/nfl/official/trial/v7/en/games/${gameId}/statistics.json?api_key=${api_key}`;
    
    console.log(`🏈 Proxying request for game: ${gameId}`);
    console.log(`📡 Fetching from: ${sportradarUrl.replace(api_key, 'API_KEY_HIDDEN')}`);
    
    // Make the request to Sportradar API
    const response = await fetch(sportradarUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NFL-Jumbotron-App/1.0'
      }
    });

    console.log(`📊 Sportradar API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Sportradar API Error: ${errorText}`);
      
      return res.status(response.status).json({
        error: `Sportradar API Error: ${response.status} ${response.statusText}`,
        message: errorText.slice(0, 200),
        gameId: gameId
      });
    }

    // Parse and forward the JSON response
    const data = await response.json();
    console.log(`✅ Successfully proxied game data for: ${gameId}`);
    
    // Add some metadata to help with debugging
    const responseWithMeta = {
      ...data,
      _proxy: {
        timestamp: new Date().toISOString(),
        gameId: gameId,
        source: 'sportradar-api-proxy'
      }
    };

    res.json(responseWithMeta);

  } catch (error) {
    console.error('🚨 Proxy Server Error:', error);
    
    res.status(500).json({
      error: 'Proxy Server Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /health',
      'GET /api/nfl/games/:gameId/statistics'
    ]
  });
});

// Start the server
app.listen(PORT, () => {
  console.log('🚀 NFL API Proxy Server Started');
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🏈 Game stats endpoint: http://localhost:${PORT}/api/nfl/games/{gameId}/statistics?api_key={your_key}`);
  console.log('');
  console.log('🌐 CORS enabled for:');
  console.log('  - http://localhost:8081 (Expo web)');
  console.log('  - http://localhost:19006 (Expo web alt)');
  console.log('  - http://localhost:3000 (React dev server)');
  console.log('');
  console.log('💡 Ready to proxy NFL API requests and bypass CORS! 🏆');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down NFL API Proxy Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down NFL API Proxy Server...');
  process.exit(0);
});
