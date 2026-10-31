import { Role } from '../constants/role.enum';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

