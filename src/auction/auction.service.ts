import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Item, Status } from './entity/items.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { User } from './../auth/entity/user.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AuctionService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,

    @InjectQueue('refunds')
    private refundsQueue: Queue,
  ) {}

  public async findAll() {
    const params = {
      where: {
        status: In(['published', 'completed']),
      },
      order: {
        dateCreated: 'DESC' as const,
      },
    };

    return await this.itemRepo.find(params);
  }

  public async findAllByUser(status: Status | null, user: User) {
    const params = { where: { status: status, owner: user } };

    if (status) {
      return await this.itemRepo.find(params);
    }

    return await this.itemRepo.find({
      where: { owner: new User({ ...user }) },
    });
  }

  public async createAuctionItem(
    createItemDto: CreateItemDto,
    user: User,
  ): Promise<Item> {
    return await this.itemRepo.save(
      new Item({
        ...createItemDto,
        highestBid: createItemDto.startingPrice,
        owner: user,
      }),
    );
  }

  public async findItemById(id: number): Promise<Item> {
    return await this.itemRepo.findOne({ where: { id: id } });
  }

  public async startAuction(status: Status, itemId: number): Promise<Item> {
    const item = await this.findItemById(itemId);

    if (!item) {
      throw new BadRequestException();
    }

    if (item.status !== Status.DRAFT) {
      throw new BadRequestException(
        'Auction Item already published/completed.',
      );
    }

    const job = await this.refundsQueue.add(
      {
        itemId: itemId, //payload of job
      },
      {
        // delay: item.windowTime * 1000, //use this testing
        delay: item.windowTime * 1000 * 60 * 60,
        attempts: 3, // Number of attempts to run the job in case of failures
        removeOnComplete: true,
      },
    );

    if (!job) {
      //action here when adding queue fails.
      throw new InternalServerErrorException();
    }

    return await this.itemRepo.save(
      new Item({
        ...item,
        auctionStartDate: new Date(),
        refundJobId: String(job.id),
        status: status,
      }),
    );
  }

  public async checkUserOwnership(user: User): Promise<Boolean> {
    const result = await this.itemRepo.findOne({ where: { owner: user } });
    if (!result) {
      return false;
    }
    return true;
  }
}
