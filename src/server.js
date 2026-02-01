import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import scenarioRoutes from './routes/scenarioRoutes.js';
import hsCodeRoutes from './routes/hsCodeRoutes.js';
import buyerRoutes from './routes/buyerRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import customFieldRoutes from './routes/customFieldRoutes.js';
import printSettingsRoutes from './routes/printSettingsRoutes.js';

const app = express();

// When behind a proxy/load balancer in production, trust the proxy so req.ip is correct
if (config.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

// CORS configuration - lock to production domain in production
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow all origins
    if (config.nodeEnv !== 'production') {
      return callback(null, true);
    }

    // In production, only allow specific origins from config
    if (config.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Reject unauthorized origins in production
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: false,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'X-Requested-With',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  exposedHeaders: [],
  maxAge: 86400,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting for all API routes
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'FBR Invoice Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/scenarios', scenarioRoutes);
app.use('/api/v1/hs-codes', hsCodeRoutes);
app.use('/api/v1/buyers', buyerRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/custom-fields', customFieldRoutes);
app.use('/api/v1/invoice-print-settings', printSettingsRoutes);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot find ${req.originalUrl} on this server`,
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
