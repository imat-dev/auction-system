import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './../entity/items.entity';
import { Repository } from 'typeorm';

//check user have enough balance.
@Injectable()
export class UserBalanceGuard implements CanActivate {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, body } = context.switchToHttp().getRequest();


    if (user.balance >= body.bidAmount) {
      return true;
    }

    throw new ForbiddenException(
      'You do not have enough balance to place bid on this item.',
    );
    
  }
}
