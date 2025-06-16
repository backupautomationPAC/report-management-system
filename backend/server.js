require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Enhanced backend with Harvest, OpenAI, and PostgreSQL is running'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TEG Report Management API - Enhanced Version',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      reports: '/api/reports',
      users: '/api/users',
      harvest: '/api/harvest'  // <- NEW ENDPOINT
    },
    features: [
      'PostgreSQL database integration',
      'Harvest API integration for time tracking',
      'OpenAI integration for report generation',
      'Document generation capabilities',
      'Multi-stage approval workflow',
      'Session-based authentication'
    ]
  });
});

// Load routes with error handling
try {
  const authRoutes = require('./routes/auth');
  const reportRoutes = require('./routes/reports');
  const userRoutes = require('./routes/users');
  const harvestRoutes = require('./routes/harvest');  // <- NEW ROUTE

  app.use('/api/auth', authRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/harvest', harvestRoutes);  // <- NEW ROUTE ADDED
  
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  process.exit(1);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    availableRoutes: ['/health', '/api/auth', '/api/reports', '/api/users', '/api/harvest']
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Enhanced backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Harvest API: ${process.env.HARVEST_TOKEN ? 'Configured' : 'Not configured (using mock data)'}`);
  console.log(`🤖 OpenAI API: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured (using mock generation)'}`);
  console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'PostgreSQL connected' : 'Using in-memory storage'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});
