import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bid } from './entity/bid.entity';
import { Repository } from 'typeorm';
import { PlaceBidDto } from './dto/place-bid.dto';
import { User } from 'src/auth/entity/user.entity';
import { Item } from './entity/items.entity';

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepo: Repository<Bid>,

    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
  ) {}

  public async placeBid(itemId: number, user: User, bidAmount: number) {
    const item = await this.itemRepo.findOne({ where: { id: itemId } });

    if (!item) {
      throw new BadRequestException();
    }

    if (bidAmount <= item.highestBid) {
      throw new BadRequestException(
        'Your bid must be higher than the current highest bid.',
      );
    }

    const updatedItem = await this.itemRepo.save(
      new Item({
        ...item,
        highestBid: bidAmount,
        highestBidder: user
      }),
    );

    return await this.bidRepo.save(
      new Bid({
        user: user,
        item: updatedItem,
        bidAmount: bidAmount,
      }),
    );
  }
}
