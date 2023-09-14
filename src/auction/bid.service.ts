import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Bid } from './entity/bid.entity';
import { EntityManager, Repository } from 'typeorm';
import { User } from 'src/auth/entity/user.entity';
import { Item, Status } from './entity/items.entity';
import { PlaceBidDto } from './dto/place-bid.dto';

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
      where: { user: user, item: item },
    });

    if (currentBid) {
      throw new BadRequestException('You already place bid on this item.');
    }

    await this.itemRepo.save(
      new Item({
        ...item,
        highestBid: bidAmount,
        highestBidder: user,
      }),
    );

    await this.updateUserBalance(user, bidAmount);

    return await this.bidRepo.save(
      new Bid({
        user: user,
        item: item,
        bidAmount: bidAmount,
      }),
    );
  }

  public async updateBid(
    item: Item,
    user: User,
    bidAmount: number,
    bidId: number,
  ) {
    const currentBid = await this.bidRepo.findOne({
      where: { id: bidId },
    });

    if (!currentBid) {
      throw new ForbiddenException('You dont have existing bid on this item.');
    }

    if (user.balance + currentBid.bidAmount < bidAmount) {
      throw new ForbiddenException(
        'You do not have enough balance to update your bid on this item.',
      );
    }

    await this.itemRepo.save(
      new Item({
        ...item,
        highestBid: bidAmount,
        highestBidder: user,
      }),
    );

    await this.updateUserBalance(user, bidAmount - currentBid.bidAmount);

    return await this.bidRepo.save(
      new Bid({
        ...currentBid,
        bidAmount: bidAmount,
      }),
    );
  }

  private async updateUserBalance(user: User, bidAmount: number) {
    const updatedUser = await this.userRepo.save({
      ...user,
      balance: user.balance - bidAmount,
    });
    return updatedUser;
  }

  public async validateBid(
    itemId: number,
    placeBidDto: PlaceBidDto,
  ): Promise<Item> {
    const item = await this.itemRepo.findOne({ where: { id: itemId } });

    if (!item) {
      throw new BadRequestException('Item is not valid.');
    }

    if (item.status !== Status.PUBLISHED) {
      throw new BadRequestException('You can not bid on unpublished item.');
    }

    if (placeBidDto.bidAmount <= item.highestBid) {
      throw new BadRequestException(
        'Your bid must be higher than the current highest bid.',
      );
    }

    return item;
  }
}
