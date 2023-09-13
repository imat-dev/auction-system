import { Processor, Process, OnQueueEvent } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import { Item } from '../entity/items.entity';
import { Bid } from '../entity/bid.entity';
import { User } from 'src/auth/entity/user.entity';

@Processor('refunds')
export class RefundsProcessor {
  private readonly logger = new Logger(RefundsProcessor.name);

  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
    @InjectRepository(Bid)
    private readonly bidRepo: Repository<Bid>
  ) {}
  
  @Process()
  async handleRefund(job: Job) {

    this.logger.log(`Started processing job with ID ${job.id}`);
    const { itemId } = job.data;

    const item = await this.itemRepo.findOne({where : { id : itemId}})
    if(!item) {
      throw new Error('Auction item not found.');
      return;
    }

    if(item.isRefundJobCompleted) {
      throw new Error('Already refunded.');
      return;
    }

    
    const usersToRefund = await this.bidRepo.find({
      where: { item: itemId, user: Not(item.highestBidder.id)  }
    })

    if(usersToRefund) {
      //refund users here.
    } 


    const newItem = await this.itemRepo.save(new Item({
      ...item, 
      isRefundJobCompleted: true
    }))

    if(!newItem) {
      throw new Error('Fail updating refundJobId');
    }

  }

  @OnQueueEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job with ID ${job.id} has completed.`);
  }

  @OnQueueEvent('failed')
  onFailed(job: Job, error: any) {
    //Call method that will notify the admin
    //Admin can have a override button or function call
    this.logger.error(`Job with ID ${job.id} has failed. Error: ${error.message}`);
  }

}
