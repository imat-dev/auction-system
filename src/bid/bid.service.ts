import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Bid } from './entity/bid.entity';
import { EntityManager, Repository } from 'typeorm';
import { User } from 'src/auth/entity/user.entity';
import { Item, Status } from './entity/items.entity';
import { CurrentUser } from 'src/auth/strategy/current-user.decorator';

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepo: Repository<Bid>,

    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

  ) {}

  public async placeBid(item: Item, user: User, bidAmount: number) {

    const currentBid = await this.bidRepo.findOne({
      where: { user: user },
    });

    await this.itemRepo.save(
      new Item({
        ...item,
        highestBid: bidAmount,
        highestBidder: user,
      }),
    );

    await this.updateUserBalance(user, bidAmount);
    
    if (currentBid) {
      return await this.bidRepo.update(
        { id: currentBid.id },
        { bidAmount: bidAmount },
      );

    } else {
      return await this.bidRepo.save(
        new Bid({
          user: user,
          item: item,
          bidAmount: bidAmount,
        }),
      );
    }

  }

  private async updateUserBalance(user: User, bidAmount: number) {
    const updatedUser = await this.userRepo.save(
      new User({
        ...user,
        balance: user.balance - bidAmount,
      }),
    );
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
