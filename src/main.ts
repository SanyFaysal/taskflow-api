import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  const appName = configService.get<string>('app.appName', 'TaskFlow Core API');

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Enable Graceful Shutdown Hooks
  app.enableShutdownHooks();

  // Set Global Routing Prefix (e.g. /api/v1)
  app.setGlobalPrefix(apiPrefix);

  // Global Input Validation & Transformation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(
      `## Enterprise Project & Task Management API
      
      This API demonstrates industry-standard NestJS patterns:
      - **Authentication**: JWT Strategy with Access & Refresh tokens.
      - **Authorization**: Global RBAC with custom decorators and Guards.
      - **Architecture**: Modular DDD design with TypeORM and PostgreSQL.
      - **Data Integrity**: Global validation pipes, transformers, and exception filters.
      - **Relational Depth**: Multi-tenant workspaces, projects, tasks, subtasks, and comments.
      `,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT access token below',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(port);

  logger.log(`========================================================`);
  logger.log(`🚀 ${appName} is successfully running!`);
  logger.log(`📡 Base API URL:      http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Swagger OpenAPI:   http://localhost:${port}/api/docs`);
  logger.log(`========================================================`);
}

bootstrap();

