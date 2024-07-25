import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Load environment variables from the .env file
  dotenv.config({ path: join(__dirname, '.env') });

  // Create the NestJS application
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Set up Swagger for API documentation
  const config = new DocumentBuilder()
    .setTitle('Daal Wallet Microservice')
    .setDescription(
      'API documentation for the Daal Wallet Microservice. Created by Amir Zare. This microservice handles user wallet data, including balances and transactions.',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Initialize logger
  const logger = new Logger('ProjectStartup');
  const port = configService.get<number>('APP_PORT', 3333);

  logger.verbose(
    `Swagger documentation available at: http://localhost:${port}/api-docs`,
  );

  // Start the application
  await app.listen(port);
}
bootstrap();
