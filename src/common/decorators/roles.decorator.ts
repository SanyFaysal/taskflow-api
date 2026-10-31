import { SetMetadata } from '@nestjs/common';
import { Role } from '../constants/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorator to enforce Role-Based Access Control (RBAC).
 * 
 * Example:
 * ```ts
 * @Roles(Role.SYSTEM_ADMIN)
 * @Delete(':id')
 * remove(@Param('id') id: string) { ... }
 * ```
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

