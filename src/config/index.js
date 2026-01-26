import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : ['https://saadtrader.pk', 'https://www.saadtrader.pk'],
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  mfa: {
    issuer: process.env.MFA_ISSUER || 'FBR Invoice Admin',
    encryptionKey: process.env.MFA_ENCRYPTION_KEY || process.env.JWT_SECRET || 'fallback-mfa-key',
    totpWindow: parseInt(process.env.MFA_TOTP_WINDOW_STEPS || '1', 10),
    challengeExpiresIn: process.env.MFA_CHALLENGE_EXPIRES_IN || '10m',
    backupCodesCount: parseInt(process.env.MFA_BACKUP_CODES_COUNT || '8', 10),
  },
};
