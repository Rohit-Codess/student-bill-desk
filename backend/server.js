const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================================================
// CORS CONFIGURATION
// =============================================================================
const allowedOrigins = [
  process.env.CLIENT_URL,                    // Production URL from .env
  'http://localhost:3000',                   // Local development
  'http://localhost:5173',                   // Vite dev server alternative port
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list OR is a Vercel preview deployment
    if (allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
      console.log('✅ CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// =============================================================================
// MIDDLEWARE SETUP
// =============================================================================
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging for debugging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.get('Origin') || 'No Origin';
  console.log(`[${timestamp}] ${req.method} ${req.path} - Origin: ${origin}`);
  next();
});

// =============================================================================
// DATABASE CONNECTION
// =============================================================================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📍 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Initialize database connection
connectDB();

// =============================================================================
// ROUTES SETUP
// =============================================================================
const studentRoutes = require('./routes/studentRoutes');
const feeRoutes = require('./routes/feeRoutes');

// API Routes
app.use('/api/students', studentRoutes);
app.use('/api', feeRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Student Bill Desk API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      origin: req.get('Origin') || 'No Origin',
      allowedOrigins: allowedOrigins
    },
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================
// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 Handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /api/health',
      'GET /api/students',
      'POST /api/students',
      'GET /api/types',
      'POST /api/generate',
      'GET /api/assignments'
    ]
  });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================
app.listen(PORT, () => {
  console.log('🚀 Student Bill Desk API Server Started');
  console.log(`� Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log('='.repeat(60));
});
