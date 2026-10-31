import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  appName: process.env.APP_NAME || 'TaskFlow Core API',
  swaggerEnabled: process.env.SWAGGER_ENABLED === 'true',
  swaggerPath: process.env.SWAGGER_PATH || 'api/docs',
}));

