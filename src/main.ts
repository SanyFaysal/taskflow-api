import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import appConfig from './config/app.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Typed config: `config.port` is a number, and a typo is a compile error.
  // Compare: configService.get<number>('app.prot') compiles and returns undefined.
  const config = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);
  const { port, apiPrefix, appName, swaggerEnabled, swaggerPath } = config;

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

  // ValidationPipe is registered in AppModule via APP_PIPE.

  // Swagger OpenAPI Documentation (off unless SWAGGER_ENABLED=true)
  if (swaggerEnabled) {
    setupSwagger(app, appName, swaggerPath);
  }

  await app.listen(port);

  logger.log(`🚀 ${appName} is running (${config.nodeEnv})`);
  logger.log(`📡 Base API URL: http://localhost:${port}/${apiPrefix}`);
  if (swaggerEnabled) {
    logger.log(`📚 Swagger OpenAPI: http://localhost:${port}/${swaggerPath}`);
  }
}

function setupSwagger(
  app: Awaited<ReturnType<typeof NestFactory.create>>,
  appName: string,
  swaggerPath: string,
) {
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
  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}

bootstrap();

