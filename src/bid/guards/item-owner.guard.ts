import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/bid/entity/items.entity';
import { Repository } from 'typeorm';

//check if the item is owned by the user
@Injectable()
export class ItemOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();

    const result = await this.itemRepo.findOne({ where: { owner: user } });

    if (result) {
      return true;
    }

    return false;
  }
}
