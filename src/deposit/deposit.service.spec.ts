import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './../auth/entity/user.entity';
import { Repository } from 'typeorm';
import { DepositService } from './deposit.service';

describe('DepositService', () => {
  let service: DepositService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DepositService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DepositService>(DepositService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('upateUserBalance', () => {
    it('should update the user balance', async () => {
      const amountToDeposit = 5;
      const userBalance = 1;
      const updatedBalance = amountToDeposit + userBalance;

      const repoSpy = jest
        .spyOn(repository, 'save')
        .mockResolvedValue({ id: 1, balance: updatedBalance } as User);

      expect(
        service.makeDeposit(
          amountToDeposit,
          new User({ id: 1, balance: userBalance }),
        ),
      ).resolves.toEqual({ id: 1, balance: updatedBalance });

      expect(repoSpy).toBeCalledWith({ id: 1, balance: updatedBalance });
    });
  });
});
