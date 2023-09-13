import { Module } from '@nestjs/common';
import { BidController } from './bid.controller';
import { BidService } from './bid.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entity/items.entity';
import { ItemsController } from './items.controller';
import { ItemService } from './items.service';
import { ItemOwnerGuard } from 'src/bid/guards/item-owner.guard';
import { Bid } from './entity/bid.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item , Bid])],
  controllers: [BidController, ItemsController],
  providers: [BidService, ItemService, ItemOwnerGuard],
})
export class BidModule {}
