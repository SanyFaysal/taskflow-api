import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../../common/constants/role.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;
  let configService: Partial<Record<keyof ConfigService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      findByEmailWithPassword: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'jwt.secret') return 'test_secret';
        if (key === 'jwt.expiresIn') return '1h';
        if (key === 'jwt.refreshSecret') return 'test_refresh_secret';
        if (key === 'jwt.refreshExpiresIn') return '7d';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user is not found', async () => {
      usersService.findByEmailWithPassword!.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nonexistent@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        password: await bcrypt.hash('correctPassword', 10),
        isActive: true,
        role: Role.USER,
      };
      usersService.findByEmailWithPassword!.mockResolvedValue(mockUser);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens and user response on valid credentials', async () => {
      const plainPassword = 'validPassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        password: hashedPassword,
        isActive: true,
        role: Role.USER,
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersService.findByEmailWithPassword!.mockResolvedValue(mockUser);
      jwtService.signAsync!.mockResolvedValueOnce('mock_access_token');
      jwtService.signAsync!.mockResolvedValueOnce('mock_refresh_token');

      const result = await authService.login({
        email: 'test@example.com',
        password: plainPassword,
      });

      expect(result.accessToken).toBe('mock_access_token');
      expect(result.refreshToken).toBe('mock_refresh_token');
      expect(result.user.email).toBe('test@example.com');
    });
  });
});

