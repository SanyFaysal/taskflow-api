import { registerAs } from '@nestjs/config';

// Every value here is guaranteed by env.validation.ts before this factory runs,
// so there are no fallbacks. A hardcoded secret fallback would let the app start
// in production with a public, guessable signing key.
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET!,
  expiresIn: process.env.JWT_EXPIRES_IN!,
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN!,
}));
