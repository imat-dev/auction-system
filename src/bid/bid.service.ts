import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bid } from './entity/bid.entity';
import { Repository } from 'typeorm';
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
  ) {}

  public async placeBid(item: Item, user: User, bidAmount: number) {
    const updatedItem = await this.itemRepo.save(
      new Item({
        ...item,
        highestBid: bidAmount,
        highestBidder: user,
      }),
    );

    // await this.userRepo.save(
    //   new User({
    //     ...user,
    //     balance: user.balance - bidAmount,
    //   }),
    // );

    let updatedBid = new Bid({
      user: user,
      item: updatedItem,
      bidAmount: bidAmount,
    });

    const currentBid = await this.bidRepo.findOne({
      where: { user: user, item: updatedItem },
    });


    if (currentBid) {
      updatedBid = new Bid({
        ...currentBid,
        bidAmount: bidAmount,
      });
    }

    return await this.bidRepo.save(updatedBid);
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
