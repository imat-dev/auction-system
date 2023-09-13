import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item, Status } from 'src/bid/entity/items.entity';
import { Repository } from 'typeorm';

//only published item can be bidded
@Injectable()
export class PublishedItemGuard implements CanActivate {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { params } = context.switchToHttp().getRequest();
    const itemId = params.itemId;

    console.log(itemId)

    const result = await this.itemRepo.findOne({
      where: { id: itemId, status: Status.PUBLISHED },
    });

    if (result) {
      return true;
    }

    return false;
  }
}
