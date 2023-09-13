import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Bid } from './entity/bid.entity';
import { EntityManager, Repository } from 'typeorm';
import { User } from 'src/auth/entity/user.entity';
import { Item, Status } from './entity/items.entity';


@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepo: Repository<Bid>,

    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  public async placeBid(item: Item, user: User, bidAmount: number) {

    const currentBid = await this.bidRepo.findOne({
      where: { user: user, item: item },
    });

    await this.itemRepo.save(
      new Item({
        ...item,
        highestBid: bidAmount,
        highestBidder: user,
      }),
    );

    await this.updateUserBalance(user, bidAmount);

    return await this.bidRepo.save({
      ...currentBid,
      user: user,
      item: item,
      bidAmount: bidAmount,
    });

  }

  private async updateUserBalance(user: User, bidAmount: number) {
    const updatedUser = await this.userRepo.save({
      ...user,
      balance: user.balance - bidAmount,
    });
    return updatedUser;
  }

  public async checkIfPublished(itemId: number): Promise<Boolean> {
    const result = await this.itemRepo.findOne({
      where: { id: itemId, status: Status.PUBLISHED },
    });

    if (!result) {
      return false;
    }

    return true;
  }
}
