import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  const port = configService.get<string>('PORT') || 5001;
  
  // Enable CORS for frontend communication
  app.enableCors({
    origin: true, // Allow all origins in development, restrict in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Apply validation pipe globally to all endpoints
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not defined in DTOs
      forbidNonWhitelisted: true, // Throw errors if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );
  
  // Start the server
  await app.listen(port);
  
  // Register shutdown hooks for graceful termination
  let isShuttingDown = false;
  
  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) {
      return; // Prevent multiple shutdown attempts
    }
    isShuttingDown = true;
    
    logger.log(`Received ${signal}, gracefully shutting down...`);
    
    try {
      // Close the HTTP server first
      await app.close();
      logger.log('Server closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error(`Error during shutdown: ${error}`);
      process.exit(1);
    }
  };
  
  // Handle process termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Log application status
  logger.log(`Server is running on Port ${port}`);
  logger.log('MySQL connection successful');
}

bootstrap().catch(error => {
  const logger = new Logger('Bootstrap');
  logger.error(`Server failed to start: ${error}`);
  process.exit(1);
});