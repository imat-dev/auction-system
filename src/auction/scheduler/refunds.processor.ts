import { Processor, Process, OnQueueEvent } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import { Item, Status } from '../entity/items.entity';
import { Bid } from '../entity/bid.entity';
import { User } from './../../auth/entity/user.entity';

@Processor('refunds')
export class RefundsProcessor {
  private readonly logger = new Logger(RefundsProcessor.name);

  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
    @InjectRepository(Bid)
    private readonly bidRepo: Repository<Bid>,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  @Process()
  async handleRefund(job: Job) {
    this.logger.log(`Started processing job with ID ${job.id}`);
    const { itemId } = job.data;

    const item = await this.itemRepo.findOne({ where: { id: itemId } });
    if (!item) {
      throw new Error('Auction item not found.');
    }

    if (item.isRefundJobCompleted) {
      throw new Error('Already refunded.');
    }

    //check if there's a bidder
    if (item.highestBidder) {
      const bidToRefund = await this.bidRepo.find({
        where: {
          item: new Item({ id: itemId }),
          user: Not(item.highestBidder.id),
        },
      });

      if (bidToRefund){
        await this.entityManager.transaction(
          async (transactionalEntityManager) => {
            for (const bid of bidToRefund) {
              if (!bid.isRefunded) {
                await transactionalEntityManager.save(
                  User,
                  new User({
                    ...bid.user,
                    balance: bid.user.balance + bid.bidAmount,
                  }),
                );

                await transactionalEntityManager.save(
                  Bid,
                  new Bid({
                    ...bid,
                    isRefunded: true,
                  }),
                );
              }
            }
          },
        );
      }
    }

    const newItem = await this.itemRepo.save(
      new Item({
        ...item,
        isRefundJobCompleted: true,
        status: Status.COMPLETED,
      }),
    );

    if (!newItem) {
      throw new Error('Fail updating refundJobId');
    }

    //will be stored in job, can be access to onCompleted event
    return {
      item: newItem,
    };
  }

  @OnQueueEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job with ID ${job.id} has completed.`);
  }

  @OnQueueEvent('failed')
  onFailed(job: Job, error: any) {
    //Call method that will notify the admin
    //Admin can have a override button or function call
    this.logger.error(
      `Job with ID ${job.id} has failed. Error: ${error.message}`,
    );
  }
}
