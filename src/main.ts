// src/main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

async function bootstrap() {
  dotenv.config();
  const logger = new Logger('Bootstrap');
  
  if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
    logger.log('Created uploads directory');
  }
  
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:4000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:4000',
      ];
      
      // Allow requests without origin (like Postman or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
  });

  const config = new DocumentBuilder()
    .setTitle('Studygai EdTech API')
    .setDescription(
      'AI-Powered Study Assistant API with PDF processing and chat capabilities',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'jwt',
        description: 'Enter JWT token',
      },
      'jwt',
    )
    .build();
    
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/docs', app, document, {
    customSiteTitle: 'SAGE API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  
  logger.log('Swagger UI available at /docs');

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`SAGE Backend running on http://localhost:${port}`);
  logger.log(`API Documentation: http://localhost:${port}/docs`);
}

bootstrap();