import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/services';
import { RegisterDto } from '../users/dto';
import { UserRole } from '../users/enums/user-role.enum';
import { ConflictException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let usersService: UsersService;

  const mockUsersService = {
    register: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    usersService = module.get<UsersService>(UsersService);
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
});
