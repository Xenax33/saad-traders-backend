import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import scenarioRoutes from './routes/scenarioRoutes.js';
import hsCodeRoutes from './routes/hsCodeRoutes.js';
import buyerRoutes from './routes/buyerRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';

const app = express();

// CORS configuration - lock to production domain in production
const allowedProdOrigins = ['https://saadtrader.pk', 'https://www.saadtrader.pk'];
const corsOptions = {
  origin: (origin, callback) => {
    if (config.nodeEnv !== 'production') {
      return callback(null, true);
    }

    if (origin && allowedProdOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: false,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/scenarios', scenarioRoutes);
app.use('/api/v1/hs-codes', hsCodeRoutes);
app.use('/api/v1/buyers', buyerRoutes);
app.use('/api/v1/invoices', invoiceRoutes);

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
