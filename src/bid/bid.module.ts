import { Module } from '@nestjs/common';
import { BidController } from './bid.controller';
import { BidService } from './bid.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entity/items.entity';
import { ItemsController } from './items.controller';
import { ItemService } from './items.service';
import { Bid } from './entity/bid.entity';
import { UserBalanceGuard } from './guards/user-balance.guard';
import { User } from 'src/auth/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item , Bid, User])],
  controllers: [BidController, ItemsController],
  providers: [BidService, ItemService, UserBalanceGuard],
})
export class BidModule {}
