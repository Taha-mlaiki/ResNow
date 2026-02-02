import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/services';
import { RegisterDto, LoginDto } from '../users/dto';
import { UserRole } from '../users/enums/user-role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let usersService: UsersService;
  let authService: AuthService;

  const mockUsersService = {
    register: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  const mockAuthService = {
    login: jest.fn(),
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should successfully register a new user', async () => {
      const expectedResult = {
        id: '123',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: UserRole.PARTICIPANT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(usersService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
      expect(result).not.toHaveProperty('password');
    });

    it('should register a user with Admin role', async () => {
      const adminRegisterDto: RegisterDto = {
        ...registerDto,
        role: UserRole.ADMIN,
      };
      const expectedResult = {
        id: '123',
        email: adminRegisterDto.email,
        firstName: adminRegisterDto.firstName,
        lastName: adminRegisterDto.lastName,
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(adminRegisterDto);

      expect(usersService.register).toHaveBeenCalledWith(adminRegisterDto);
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUsersService.register.mockRejectedValue(
        new ConflictException('User with this email already exists'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should handle service errors', async () => {
      mockUsersService.register.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        'Unexpected error',
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'TestPassword123!',
    };

    it('should successfully login with valid credentials', async () => {
      const expectedResult = {
        access_token: 'jwt.token.here',
        user: {
          id: '123',
          email: loginDto.email,
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.PARTICIPANT,
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
      expect(result.access_token).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should return user with correct role', async () => {
      const adminResult = {
        access_token: 'jwt.token.admin',
        user: {
          id: '456',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: UserRole.ADMIN,
        },
      };

      mockAuthService.login.mockResolvedValue(adminResult);

      const result = await controller.login(loginDto);

      expect(result.user.role).toBe(UserRole.ADMIN);
    });
  });
});
