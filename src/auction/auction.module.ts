import { Module } from '@nestjs/common';
import { BidController } from './bid.controller';
import { BidService } from './bid.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entity/items.entity';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';
import { Bid } from './entity/bid.entity';
import { UserBalanceGuard } from './guards/user-balance.guard';
import { User } from './../auth/entity/user.entity';
import { RefundsProcessor } from './scheduler/refunds.processor';
import { RefundsQueue } from './scheduler/refunds.queue';
import { RateLimiterService } from './rate-limiter.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item, Bid, User]),
    RefundsQueue,
  ],
  controllers: [BidController, AuctionController],
  providers: [
    BidService,
    AuctionService,
    UserBalanceGuard,
    RefundsProcessor,
    RateLimiterService,
    ConfigService
  ],
})
export class AuctionModule {}
