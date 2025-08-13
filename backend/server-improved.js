/**
 * ============================================================================
 * STUDENT BILL DESK - BACKEND API SERVER
 * ============================================================================
 * A comprehensive student fee management system backend
 * Built with Express.js, MongoDB, and modern best practices
 * 
 * @author RTcodeX - Professional Web Development
 * @website https://www.rtcodex.dev/
 * @version 1.0.0
 * ============================================================================
 */

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
  process.env.PRODUCTION_CLIENT_URL,         // Production frontend URL
  process.env.CLIENT_URL,                    // Development frontend URL
  'http://localhost:3000',                   // Default React dev server
  'http://localhost:5173',                   // Vite dev server alternative
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list OR is a Vercel/Netlify preview
    if (allowedOrigins.includes(origin) || 
        origin.includes('.vercel.app') || 
        origin.includes('.netlify.app') ||
        origin.includes('rtcodex.dev')) {
      console.log('✅ CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
};

// =============================================================================
// MIDDLEWARE SETUP
// =============================================================================
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

// =============================================================================
// DATABASE CONNECTION
// =============================================================================
const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📍 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('💡 Tip: Check your MONGODB_URI in .env file');
    process.exit(1);
  }
};

// Initialize database connection
connectDB();

// =============================================================================
// API ROUTES CONFIGURATION
// =============================================================================
const studentRoutes = require('./routes/studentRoutes');
const feeRoutes = require('./routes/feeRoutes');

/**
 * Student Management Routes
 * - GET    /api/students           - Get all students
 * - POST   /api/students           - Create new student
 * - GET    /api/students/:id       - Get student by ID
 * - PUT    /api/students/:id       - Update student
 * - DELETE /api/students/:id       - Delete student (cascade delete fees)
 */
app.use('/api/students', studentRoutes);

/**
 * Fee Management Routes
 * - GET    /api/types              - Get all fee types
 * - POST   /api/types              - Create fee type
 * - PUT    /api/types/:id          - Update fee type
 * - DELETE /api/types/:id          - Delete fee type
 * - POST   /api/generate           - Generate monthly fees
 * - GET    /api/assignments        - Get fee assignments with filters
 * - PUT    /api/assignments/:id/status - Update assignment status
 */
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
      allowedOrigins: allowedOrigins.filter(Boolean)
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      name: mongoose.connection.name
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

// =============================================================================
// ERROR HANDLING MIDDLEWARE
// =============================================================================

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

// =============================================================================
// SERVER STARTUP
// =============================================================================
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
