import { registerAs } from '@nestjs/config';

// Defaults live in env.validation.ts (one place). By the time this factory runs,
// ConfigModule has validated the env and written those defaults into process.env.
export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV!,
  port: parseInt(process.env.PORT!, 10),
  apiPrefix: process.env.API_PREFIX!,
  appName: process.env.APP_NAME!,
  swaggerEnabled: process.env.SWAGGER_ENABLED === 'true',
  swaggerPath: process.env.SWAGGER_PATH!,
}));
