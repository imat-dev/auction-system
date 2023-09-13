import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthenticatedUser } from 'src/auth/strategy/auth.guard.jwt';
import { CurrentUser } from 'src/auth/strategy/current-user.decorator';
import { User } from 'src/auth/entity/user.entity';
import { BidService } from './bid.service';
import { PlaceBidDto } from './dto/place-bid.dto';
import { UserBalanceGuard } from './guards/user-balance.guard';
import { ItemService } from './items.service';

@Controller('bid')
@UseGuards(AuthenticatedUser)
@UseInterceptors(ClassSerializerInterceptor)
export class BidController {
  constructor(private readonly bidService: BidService, private readonly itemService: ItemService) {}

  //Todo: UseGuard to do not allow owner to participate in own auction
  //Todo: Allow user to bid every 5 seconds
  @UseGuards(UserBalanceGuard)
  @Post(':itemId')
  async bid(
    @Param('itemId') itemId,
    @CurrentUser() user: User,
    @Body() placeBidDto: PlaceBidDto,
  ) {

    const isPublished = await this.bidService.checkIfPublished(itemId)

    if(!isPublished) {
      throw new BadRequestException()
    }

    const item = await this.itemService.findItemById(itemId)

    if (!item) {
      throw new BadRequestException();
    }

    if (placeBidDto.bidAmount <= item.highestBid) {
      throw new BadRequestException(
        'Your bid must be higher than the current highest bid.',
      );
    }

    return await this.bidService.placeBid(item, user, placeBidDto.bidAmount);
  }
}
