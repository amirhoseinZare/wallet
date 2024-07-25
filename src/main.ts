import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // Load environment variables from the .env file
  dotenv.config({ path: join(__dirname, '.env') });

  // Create the NestJS application
  const app = await NestFactory.create(AppModule);

  // Set up Swagger for API documentation
  const config = new DocumentBuilder()
    .setTitle('Daal Wallet Microservice')
    .setDescription(
      'API documentation for the Daal Wallet Microservice. Created by Amir Zare. This microservice handles user wallet data, including balances and transactions.',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // Changed path to 'api-docs' for better clarity

  // Initialize logger
  const logger = new Logger('ProjectStartup');
  logger.verbose(
    `Swagger documentation available at: http://localhost:${process.env.APP_PORT}/api-docs`,
  );

  // Start the application
  await app.listen(process.env.APP_PORT);
}
bootstrap();
