import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticatedUser } from './../auth/strategy/auth.guard.jwt';
import { CurrentUser } from './../auth/strategy/current-user.decorator';
import { User } from './../auth/entity/user.entity';
import { BidService } from './bid.service';
import { PlaceBidDto } from './dto/place-bid.dto';
import { UserBalanceGuard } from './guards/user-balance.guard';
import { RateLimiterService } from './rate-limiter.service';
import { UpdateBidDto } from './dto/update-bid.dto';

@Controller('bid')
@UseGuards(AuthenticatedUser)
@UseInterceptors(ClassSerializerInterceptor)
export class BidController {
  constructor(
    private readonly bidService: BidService,
    private readonly rateLimiterService: RateLimiterService,
  ) {}

  @Get(':itemId')
  async getBid(@CurrentUser() user: User, @Param('itemId') itemId: number) {
    return await this.bidService.getCurrentBidOnItem(itemId, user);
  }

  @UseGuards(UserBalanceGuard)
  @Post(':itemId')
  async placeBid(
    @Param('itemId') itemId,
    @CurrentUser() user: User,
    @Body() placeBidDto: PlaceBidDto,
  ) {
    await this.rateLimiterService.checkLimit(user.id, itemId, 1, 5 * 1000);
    const item = await this.bidService.validateBid(itemId, placeBidDto);

    return await this.bidService.placeBid(item, user, placeBidDto.bidAmount);
  }

  //can't use guard here to check balance since currentBidAmount can be change on front-end
  @Patch(':itemId')
  async upateBid(
    @Param('itemId') itemId,
    @CurrentUser() user: User,
    @Body() updateBidDto: UpdateBidDto,
  ) {
    await this.rateLimiterService.checkLimit(user.id, itemId, 1, 5 * 1000);
    const item = await this.bidService.validateBid(itemId, updateBidDto);
    
    const result =  await this.bidService.updateBid(
      item,
      user,
      updateBidDto.bidAmount,
    );

    return result
  }
}
