const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Whitelist of allowed origins
const allowedOrigins = [
  'https://multilanguage-1.onrender.com',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server) with no origin
    if (!origin) return callback(null, true);

    const isExplicitlyAllowed = allowedOrigins.includes(origin);
    const isOnRenderOrigin = /^https:\/\/multilanguage-[\w-]+\.onrender\.com$/.test(origin);
    const isLocalhostOrLan = /^http:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/.test(origin);

    if (isExplicitlyAllowed || isOnRenderOrigin || isLocalhostOrLan) {
      return callback(null, true);
    }

    return callback(new Error(`CORS error: Origin ${origin} not allowed by Access-Control-Allow-Origin policy.`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition', 'Content-Length', 'Content-Type', 'X-Speech-Voice', 'X-Speech-Locale'],
  credentials: true,
  maxAge: 86400,
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Root greeting / sanity check
app.get('/', (req, res) => {
  res.json({
    name: 'Speech Studio Backend API',
    status: 'running',
    endpoints: {
      health: '/api/health',
      voices: '/api/voices?locale={locale}',
      speech: 'POST /api/speech'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An internal server error occurred.'
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 Speech Studio Backend running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎤 Azure Region: ${process.env.AZURE_SPEECH_REGION || 'Not set'}`);
  console.log(`🔑 Azure Key:    ${process.env.AZURE_SPEECH_KEY || process.env.FOUNDRY_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`=========================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  PORT CONFLICT: Port ${PORT} is already in use by another process.`);
    console.error(`👉 To free port ${PORT} on Windows (PowerShell), run:`);
    console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
