const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS CONFIGURATION - Restricted to specific client URL
const allowedOrigins = [
  'https://student-bill-desk.rtcodex.dev',
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log(`🔍 CORS Check - Origin: ${origin || 'No Origin'}`);
    
    // Allow requests with no origin only in development (Postman, mobile apps, etc.)
    if (!origin && process.env.NODE_ENV === 'development') {
      console.log('✅ CORS allowed - No origin (development mode)');
      return callback(null, true);
    }
    
    // Strict origin checking - only allow specific domains
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS BLOCKED for origin: ${origin}`);
      console.log(`🛡️  Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
};

// MIDDLEWARE SETUP
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Request logging for development and debugging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.get('Origin') || 'No Origin';
  
  console.log(`[${timestamp}] ${req.method} ${req.path} - Origin: ${origin}`);
  next();
});

// DATABASE CONNECTION
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,  // Increased to 30 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,          // Added connection timeout
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📍 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Connection State: ${mongoose.connection.readyState}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('💡 Tip: Check your MONGODB_URI in .env file');
    console.error('🔧 Connection String:', process.env.MONGODB_URI ? 'Found' : 'Missing');
    process.exit(1);
  }
};

// Initialize database connection
connectDB();

// API ROUTES CONFIGURATION
const studentRoutes = require('./routes/studentRoutes');
const feeRoutes = require('./routes/feeRoutes');
app.use('/api/students', studentRoutes);

app.use('/api', feeRoutes);

// =============================================================================
// HEALTH CHECK & STATUS ENDPOINTS
// =============================================================================

/**
 * Main health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Student Bill Desk API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      requestOrigin: req.get('Origin') || 'No Origin',
      allowedOrigins: allowedOrigins
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      name: mongoose.connection.name || 'Unknown'
    }
  });
});

/**
 * API documentation endpoint
 */
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Student Bill Desk API Documentation',
    version: '1.0.0',
    description: 'Comprehensive fee management system API',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      'Health Check': {
        'GET /health': 'System health and status information'
      },
      'Student Management': {
        'GET /students': 'List all students with optional filters',
        'POST /students': 'Create a new student',
        'GET /students/:id': 'Get specific student details',
        'PUT /students/:id': 'Update student information',
        'DELETE /students/:id': 'Delete student and related assignments'
      },
      'Fee Type Management': {
        'GET /types': 'List all fee types',
        'POST /types': 'Create new fee type',
        'PUT /types/:id': 'Update fee type',
        'DELETE /types/:id': 'Delete fee type'
      },
      'Fee Generation & Assignment': {
        'POST /generate?month=YYYY-MM': 'Generate monthly fee assignments',
        'GET /assignments': 'List assignments with filters',
        'PUT /assignments/:id/status': 'Update payment status'
      }
    }
  });
});

// ERROR HANDLING MIDDLEWARE

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.message);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: err.message
    });
  }
  
  // Generic error response
  res.status(err.status || 500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

/**
 * 404 handler for undefined routes
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route Not Found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    suggestion: 'Visit /api/docs for available endpoints'
  });
});

// SERVER STARTUP
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Student Bill Desk API Server Started');
  console.log('='.repeat(60));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`✅ CORS enabled for: ${allowedOrigins.filter(Boolean).join(', ')}`);
  console.log('='.repeat(60));
  console.log('🏢 Built & Developed by RTcodeX');
  console.log('🌐 https://www.rtcodex.dev/');
  console.log('='.repeat(60));
});
