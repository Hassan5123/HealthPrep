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
  
  // Register shutdown hooks for graceful termination
  app.enableShutdownHooks();
  
  // Handle process termination signals
  const signals = ['SIGTERM', 'SIGINT'];
  
  signals.forEach(signal => {
    process.on(signal, async () => {
      logger.log(`Received ${signal}, gracefully shutting down...`);
      
      try {
        // Close NestJS app
        await app.close();
        logger.log('Server closed successfully');
        
        // Exit with success code
        process.exit(0);
      } catch (error) {
        logger.error(`Error during shutdown: ${error}`);
        process.exit(1);
      }
    });
  });
  
  // Start the server
  await app.listen(port);
  
  // Log application status
  logger.log(`Server is running on Port ${port}`);
  logger.log('MySQL connection successful');
}

bootstrap().catch(error => {
  const logger = new Logger('Bootstrap');
  logger.error(`Server failed to start: ${error}`);
  process.exit(1);
});