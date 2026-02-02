import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/services';
import { PasswordService } from '../users/services';
import { UserRole } from '../users/enums/user-role.enum';
import { LoginDto } from '../users/dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let passwordService: PasswordService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    register: jest.fn(),
  };

  const mockPasswordService = {
    hashPassword: jest.fn(),
    comparePasswords: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    passwordService = module.get<PasswordService>(PasswordService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'TestPassword123!',
    };

    const mockUser = {
      id: '123',
      email: 'test@example.com',
      password: 'hashedPassword',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.PARTICIPANT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully login with valid credentials', async () => {
      const accessToken = 'jwt.token.here';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.comparePasswords.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(accessToken);

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(passwordService.comparePasswords).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({
        access_token: accessToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
        },
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(passwordService.comparePasswords).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.comparePasswords.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should include correct role in JWT payload for Admin user', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      const accessToken = 'jwt.token.admin';

      mockUsersService.findByEmail.mockResolvedValue(adminUser);
      mockPasswordService.comparePasswords.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(accessToken);

      const result = await service.login(loginDto);

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: adminUser.id,
        email: adminUser.email,
        role: UserRole.ADMIN,
      });
      expect(result.user.role).toBe(UserRole.ADMIN);
    });
  });

  describe('validateUser', () => {
    const payload = {
      sub: '123',
      email: 'test@example.com',
      role: UserRole.PARTICIPANT,
    };

    const mockUser = {
      id: '123',
      email: 'test@example.com',
      password: 'hashedPassword',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.PARTICIPANT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user if valid', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await service.validateUser(payload);

      expect(usersService.findById).toHaveBeenCalledWith(payload.sub);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.validateUser(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateUser(payload)).rejects.toThrow(
        'Invalid token',
      );
    });
  });
});
