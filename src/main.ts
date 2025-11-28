// src/main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs'; // ← Add this

async function bootstrap() {
  dotenv.config();
  const logger = new Logger('Bootstrap');
  
  if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
    logger.log('Created uploads directory');
  }
  
  const app = await NestFactory.create(AppModule);
  
  // Remove duplicate ValidationPipe (you have it twice)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('SAGE EdTech API')
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
      persistAuthorization: true, // ← Change to true for better dev experience
    },
  });
  
  logger.log('Swagger UI available at /docs');

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 SAGE Backend running on http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/docs`);
}

bootstrap();