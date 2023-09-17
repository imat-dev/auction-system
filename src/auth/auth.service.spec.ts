import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './../auth/entity/user.entity';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        JwtService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            sign: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('Validate User', () => {
    it('should retun user if valid credentials', async () => {
      const result = new User({
        email: 'tes@test.com',
        id: 1,
      });

      const repoSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(result);

      const serviceSpy = jest
        .spyOn(service, 'comparePassword')
        .mockResolvedValue(true);

      const user = service.validateUser('test@test.com', 'password');
      expect(user).resolves.toEqual({ email: 'tes@test.com', id: 1 });
      expect(repoSpy).toBeCalledWith({ where: { email: 'test@test.com' } });
    });

    it('should throw error if email does not exist', async () => {
      const result = new User({
        email: 'tes@test.com',
        id: 1,
      });

      const repoSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(undefined);

      try {
        await service.validateUser('test@test.com', 'password');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should throw error if email exist but wrong password', async () => {
      const result = new User({
        email: 'tes@test.com',
        id: 1,
      });

      jest.spyOn(repository, 'findOne').mockResolvedValue(result);

      jest
        .spyOn(service, 'comparePassword')
        .mockImplementation((): any => false);

      try {
        await service.validateUser('test@test.com', 'password');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });
});
