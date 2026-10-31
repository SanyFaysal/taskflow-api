import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to bypass the global JWT Authentication Guard.
 * Use `@Public()` above controllers or specific route methods to make them publicly accessible.
 * 
 * Example:
 * ```ts
 * @Public()
 * @Post('login')
 * async login(@Body() dto: LoginDto) { ... }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

