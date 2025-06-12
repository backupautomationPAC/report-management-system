import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import reportRoutes from './routes/reports';
import userRoutes from './routes/users';
import dashboardRoutes from './routes/dashboard';
import harvestRoutes from './routes/harvest';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/harvest', harvestRoutes);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Report Management System API',
    version: '1.0.0',
    description: 'API for managing reports with Harvest integration and approval workflows',
    endpoints: {
      auth: {
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/register': 'Register new user',
        'GET /api/auth/me': 'Get current user',
        'POST /api/auth/logout': 'Logout user',
      },
      reports: {
        'GET /api/reports': 'Get all reports',
        'POST /api/reports': 'Create new report',
        'GET /api/reports/:id': 'Get report by ID',
        'PUT /api/reports/:id': 'Update report',
        'DELETE /api/reports/:id': 'Delete report',
        'POST /api/reports/:id/approve': 'Approve/reject report',
      },
      users: {
        'GET /api/users': 'Get all users (admin only)',
        'POST /api/users': 'Create user (admin only)',
        'PUT /api/users/:id': 'Update user (admin only)',
        'DELETE /api/users/:id': 'Delete user (admin only)',
      },
      dashboard: {
        'GET /api/dashboard/stats': 'Get dashboard statistics',
      },
      harvest: {
        'GET /api/harvest/clients': 'Get Harvest clients',
        'GET /api/harvest/projects': 'Get Harvest projects',
        'GET /api/harvest/time-entries': 'Get time entries',
      },
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}/api/docs`);
});

export default app;
