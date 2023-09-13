import { Body, ClassSerializerInterceptor, Controller, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthenticatedUser } from 'src/auth/strategy/auth.guard.jwt';
import { CurrentUser } from 'src/auth/strategy/current-user.decorator';
import { User } from 'src/auth/entity/user.entity';
import { BidService } from './bid.service';
import { PlaceBidDto } from './dto/place-bid.dto';
import { PublishedItemGuard } from './guards/published-item.guard';

@Controller('bid')
@UseGuards(AuthenticatedUser)
@UseInterceptors(ClassSerializerInterceptor)
export class BidController {
  constructor(private readonly bidService: BidService) {}

  //Todo: UseGuard to do not allow owner to participate in own auction
  @UseGuards(PublishedItemGuard)
  @Post(':itemId')
  async bid(
    @Param('itemId') itemId,
    @CurrentUser() user: User,
    @Body() placeBidDto: PlaceBidDto,
  ) {
    return await this.bidService.placeBid(itemId, user, placeBidDto.bidAmount);
  }
}
