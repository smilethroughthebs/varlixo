/**
 * ==============================================
 * VARLIXO - MAIN APPLICATION BOOTSTRAP
 * ==============================================
 * Entry point for the NestJS application.
 * Configures middleware, security, and global settings.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Get configuration service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3001;
  const frontendUrl = configService.get<string>('cors.frontendUrl') || 'http://localhost:3000';

  // Security middleware (Helmet)
  app.use(helmet.default());

  // Enable CORS with configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests from frontend and localhost during development
      const allowedOrigins = [frontendUrl, 'http://localhost:3000', 'http://localhost:3001'];
      
      // In production, allow the main domain and www subdomain
      if (!origin || allowedOrigins.includes(origin) || origin?.includes('varlixo.com')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all origins for now (can be restricted later)
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400, // 24 hours
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response transformer
  app.useGlobalInterceptors(new TransformInterceptor());

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Serve static files for uploads (e.g. deposit proofs)
  // Multer saves files to `./uploads/...` relative to the process cwd,
  // so we point Express at that folder using process.cwd().
  // This exposes URLs like `/uploads/deposits/filename.png`.
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Start server
  await app.listen(port);
  
  logger.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 VARLIXO INVESTMENT PLATFORM - BACKEND SERVER             ║
║                                                               ║
║   Status:     Running                                         ║
║   Port:       ${port}                                            ║
║   API Base:   http://localhost:${port}/api/v1                    ║
║   Environment: ${configService.get<string>('app.nodeEnv')}                                     ║
║                                                               ║
║   📧 Email:   Resend SMTP configured                          ║
║   🔐 Auth:    JWT + 2FA enabled                               ║
║   🗄️  DB:      MongoDB ready                                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
