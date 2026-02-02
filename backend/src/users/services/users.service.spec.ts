import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PasswordService } from './password.service';
import { User } from '../entities';
import { UserRole } from '../enums/user-role.enum';
import { RegisterDto } from '../dto';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let passwordService: PasswordService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockPasswordService = {
    hashPassword: jest.fn(),
    comparePasswords: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    passwordService = module.get<PasswordService>(PasswordService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should successfully register a new user', async () => {
      const hashedPassword = 'hashedPassword123';
      const savedUser = {
        id: '123',
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: UserRole.PARTICIPANT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockPasswordService.hashPassword.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);

      const result = await service.register(registerDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(
        registerDto.password,
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: UserRole.PARTICIPANT,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(savedUser);
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(registerDto.email);
    });

    it('should register user with Admin role when specified', async () => {
      const adminRegisterDto: RegisterDto = {
        ...registerDto,
        role: UserRole.ADMIN,
      };
      const hashedPassword = 'hashedPassword123';
      const savedUser = {
        id: '123',
        email: adminRegisterDto.email,
        password: hashedPassword,
        firstName: adminRegisterDto.firstName,
        lastName: adminRegisterDto.lastName,
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockPasswordService.hashPassword.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);

      const result = await service.register(adminRegisterDto);

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: adminRegisterDto.email,
        password: hashedPassword,
        firstName: adminRegisterDto.firstName,
        lastName: adminRegisterDto.lastName,
        role: UserRole.ADMIN,
      });
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should throw ConflictException if user already exists', async () => {
      const existingUser = {
        id: '123',
        email: registerDto.email,
        password: 'hashedPassword',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.PARTICIPANT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'User with this email already exists',
      );
      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if save fails', async () => {
      const hashedPassword = 'hashedPassword123';
      const newUser = {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: UserRole.PARTICIPANT,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockPasswordService.hashPassword.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.register(registerDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Failed to create user',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.PARTICIPANT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('test@example.com');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.PARTICIPANT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findById('123');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });
});
