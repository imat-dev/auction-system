import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { User } from 'src/auth/entity/user.entity';

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async makeDeposit(amount: number, user: User) : Promise<User> {
    const updatedBalance = user.balance + amount;
    const update = new User({
      ...user,
      balance: updatedBalance,
    });

    return await this.userRepository.save(update)
  }
}
