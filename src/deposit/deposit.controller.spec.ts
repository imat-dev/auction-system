import { Test, TestingModule } from '@nestjs/testing';
import { DepositController } from './deposit.controller';
import { DepositService } from './deposit.service';
import { User } from './../auth/entity/user.entity';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { Repository } from 'typeorm';
import { LocalStrategy } from './../auth/strategy/local.strategy';
import { AuthService } from './../auth/auth.service';

describe('DepositController (unit)', () => {
  let depositController: DepositController;
  let depositService: DepositService;
  let eventsRepository: Repository<User>;
  let localStrategy: LocalStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    depositService = new DepositService(eventsRepository);
    depositController = new DepositController(depositService);
    localStrategy = new LocalStrategy(authService);
  });

  it('should make deposit', async () => {
    const amount = 5;
    const initialBalance = 0;

    const result = {
      id: 1,
      email: 'test@test.om',
      balance: amount + initialBalance,
    };

    const spy = jest
      .spyOn(depositService, 'makeDeposit')
      .mockImplementation((): any => new User({ ...result }));

    expect(
      await depositController.create(
        new User({ id: 1, email: 'test@test.com', balance: 0 }),
        { amount: amount },
      ),
    ).toEqual(result);
  });

  it('should not make deposit', async () => {
    const currentUser = undefined;

    const spy = jest
      .spyOn(depositService, 'makeDeposit')
      .mockImplementation((): any => Error);

    try {
      await depositController.create(currentUser, { amount: 5 });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
