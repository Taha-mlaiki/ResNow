import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import * as bcrypt from 'bcrypt';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await service.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should hash passwords using bcrypt', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await service.hashPassword(password);

      const isValidBcryptHash = await bcrypt.compare(password, hashedPassword);
      expect(isValidBcryptHash).toBe(true);
    });
  });

  describe('comparePasswords', () => {
    it('should return true for matching passwords', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await service.hashPassword(password);

      const result = await service.comparePasswords(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hashedPassword = await service.hashPassword(password);

      const result = await service.comparePasswords(
        wrongPassword,
        hashedPassword,
      );
      expect(result).toBe(false);
    });

    it('should handle empty passwords', async () => {
      const password = '';
      const hashedPassword = await service.hashPassword(password);

      const result = await service.comparePasswords(password, hashedPassword);
      expect(result).toBe(true);
    });
  });
});
