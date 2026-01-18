import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
};
