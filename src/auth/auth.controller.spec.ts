import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';

describe('Auth Controller (unit)', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userRepo: Repository<User>;
  let jwtService: JwtService;
  let queue: Queue;

  beforeEach(async () => {
    authService = new AuthService(jwtService, userRepo);
    authController = new AuthController(authService);
  });
  const result = {
    email: 'test@test.com',
    token: 'sometoken',
  };

  describe('Login', () => {
    it('should return user email and token', async () => {
      const mockUser = new User({
        id: 1,
        email: 'test@test.com',
      });

      const spy = jest
        .spyOn(authService, 'generateToken')
        .mockImplementation((): any => 'sometoken');

      expect(await authController.login(mockUser)).toEqual(result);
    });

    it('should return forbidden error when wrong credentials', async () => {
      const mockUser = new User({
        id: 1,
        email: 'test@test.com',
      });

      const spy = jest
        .spyOn(authService, 'validateUser')
        .mockImplementation((): any => {
          throw new UnauthorizedException();
        });

      const spy2 = jest
        .spyOn(authService, 'generateToken')
        .mockImplementation((): any => {
          throw new UnauthorizedException();
        });

      try {
        await authController.login(mockUser);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });
});
