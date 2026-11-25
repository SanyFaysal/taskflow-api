import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Env values are always strings ("true", "5432").
 * Boolean("false") === true, so booleans need an explicit parser.
 *
 * We read `obj[key]` (the raw input) instead of `value`, because
 * enableImplicitConversion runs first and has already turned "false" into true.
 */
const ToBoolean = () =>
  Transform(({ obj, key }) => {
    const raw = obj[key];
    return raw === true || raw === 'true';
  });

/**
 * The single source of truth for every environment variable the app reads.
 * A field with an initializer is optional (the initializer is its default).
 * A field without one is required: the app refuses to start without it.
 */
class EnvironmentVariables {
  // ---------- Application ----------
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  @IsString()
  API_PREFIX: string = 'api/v1';

  @IsString()
  APP_NAME: string = 'TaskFlow Core API';

  @ToBoolean()
  @IsBoolean()
  SWAGGER_ENABLED: boolean = false;

  @IsString()
  SWAGGER_PATH: string = 'api/docs';

  // ---------- Database ----------
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number = 5432;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_DATABASE: string;

  @ToBoolean()
  @IsBoolean()
  DB_SYNCHRONIZE: boolean = false;

  @ToBoolean()
  @IsBoolean()
  DB_LOGGING: boolean = false;

  // ---------- JWT (no defaults on purpose) ----------
  @IsString()
  @MinLength(32, { message: 'JWT_SECRET must be at least 32 characters' })
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string = '1d';

  @IsString()
  @MinLength(32, {
    message: 'JWT_REFRESH_SECRET must be at least 32 characters',
  })
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string = '7d';
}

/**
 * Called by ConfigModule.forRoot({ validate }) once, at startup,
 * with the merged contents of .env and process.env.
 * Throwing here stops the app before it connects to anything.
 */
export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const env = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true, // "5432" -> 5432
  });

  const errors = validateSync(env, { skipMissingProperties: false });

  // Rules that involve more than one variable
  const crossFieldErrors: string[] = [];
  if (env.NODE_ENV === NodeEnv.Production && env.DB_SYNCHRONIZE) {
    crossFieldErrors.push(
      'DB_SYNCHRONIZE must be false in production (use migrations)',
    );
  }
  if (env.JWT_SECRET && env.JWT_SECRET === env.JWT_REFRESH_SECRET) {
    crossFieldErrors.push('JWT_SECRET and JWT_REFRESH_SECRET must differ');
  }

  if (errors.length > 0 || crossFieldErrors.length > 0) {
    const messages = [
      ...errors.flatMap((e) => Object.values(e.constraints ?? {})),
      ...crossFieldErrors,
    ];
    throw new Error(
      `\n❌ Invalid environment configuration:\n  - ${messages.join('\n  - ')}\n`,
    );
  }

  return env;
}
