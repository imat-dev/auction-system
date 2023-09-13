import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item, Status } from './entity/items.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { User } from 'src/auth/entity/user.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
  ) {}

  public async findAll(status: Status | null) {
    const params = { where: { status: status } };
    
    if (status) {
      return await this.itemRepo.find(params);
    }
    return await this.itemRepo.find()

  }

  public async createBidItem(
    createItemDto: CreateItemDto,
    user: User,
  ): Promise<Item> {
    return await this.itemRepo.save(
      new Item({ ...createItemDto, owner: user }),
    );
  }

  public async findItemById(id: number): Promise<Item> {
    return await this.itemRepo.findOne({ where: { id: id } });
  }

  public async udpateBidStatus(status: Status, itemId: number): Promise<Item> {
    const item = await this.findItemById(itemId);

    if (!item) {
      throw new BadRequestException();
    }

    return await this.itemRepo.save(
      new Item({
        ...item,
        status: status,
      }),
    );
  }

  public async checkUserOwnership(user: User) : Promise<Boolean> {
    const result = await this.itemRepo.findOne({ where: { owner: user } });
    if(!result) {
      return false
    }
    return true
  }
}
