/**
 * ==============================================
 * VARLIXO - MAIN CONFIGURATION FILE
 * ==============================================
 * Centralizes all environment configuration for the application.
 * Uses a factory function pattern for type-safe configuration access.
 */

export default () => ({
  // Application settings
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3001,
  },

  // Database configuration
  database: {
    uri:
      process.env.MONGODB_URI ||
      process.env.MONGO_URL ||
      process.env.MONGO_URI ||
      process.env.DATABASE_URL ||
      'mongodb://localhost:27017/varlixo',
  },

  // JWT Authentication settings
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-me',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Two-Factor Authentication
  twoFa: {
    appName: process.env.TWO_FA_APP_NAME || 'Varlixo',
  },

  // Email configuration for Resend SMTP
  email: {
    host: process.env.SMTP_HOST || 'smtp.resend.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || 'resend',
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'Varlixo <noreply@varlixo.com>',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@varlixo.com',
  },

  // File upload settings
  upload: {
    path: process.env.UPLOAD_PATH || './uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB
  },

  // Admin panel configuration
  admin: {
    secretRoute: process.env.ADMIN_SECRET_ROUTE || 'admin-secret-2024',
    defaultEmail: process.env.ADMIN_DEFAULT_EMAIL || 'admin@varlixo.com',
    defaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123456',
    ipAllowlist: process.env.ADMIN_IP_ALLOWLIST || '',
  },

  // External APIs
  apis: {
    coinGecko: process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3',
  },

  // CORS settings
  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  // Rate limiting
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  // Session settings
  session: {
    idleTimeout: parseInt(process.env.SESSION_IDLE_TIMEOUT, 10) || 1800000, // 30 minutes
  },

  // Multi-Currency settings
  currency: {
    autoDetectEnabled: process.env.AUTO_CURRENCY === 'true',
    defaultCurrency: process.env.DEFAULT_CURRENCY || 'USD',
    fxProviderPrimary: process.env.FX_PROVIDER_PRIMARY || 'https://api.exchangerate.host/latest',
    fxProviderFallback: process.env.FX_PROVIDER_FALLBACK || 'https://open.er-api.com/v6/latest',
    fxCacheTtlSeconds: parseInt(process.env.FX_TTL_SECONDS, 10) || 3600,
    geoipProviderPrimary: process.env.GEOIP_PROVIDER_PRIMARY || 'https://ipapi.co',
    geoipProviderFallback: process.env.GEOIP_PROVIDER_FALLBACK || 'https://ipwho.is',
  },
});
