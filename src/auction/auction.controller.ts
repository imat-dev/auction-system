import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuctionService } from './auction.service';
import { CreateItemDto } from './dto/create-item.dto';
import { AuthenticatedUser } from './../auth/strategy/auth.guard.jwt';
import { CurrentUser } from './../auth/strategy/current-user.decorator';
import { User } from './../auth/entity/user.entity';
import { UpdateItemDto } from './dto/update-item.dto';
import { Status } from './entity/items.entity';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auction')
@Controller('auction')
@UseGuards(AuthenticatedUser)
@UseInterceptors(ClassSerializerInterceptor)
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  //Todo: pagination
  @SkipThrottle({ default: true })
  @Get()
  async findAll() {
    return await this.auctionService.findAll();
  }

  @Get('my-items')
  async findByUser(@Query('status') status: Status, @CurrentUser() user: User) {
    return await this.auctionService.findAllByUser(status, user);
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createItemDto: CreateItemDto,
  ) {
    return await this.auctionService.createAuctionItem(createItemDto, user);
  }

  @Patch(':itemId')
  async startAuction(
    @Param('itemId') itemId: number,
    @CurrentUser() user: User,
    @Body() updateItemStateDto: UpdateItemDto,
  ) {
    const isItemOwner = await this.auctionService.checkUserOwnership(user);

    if (!isItemOwner) {
      throw new UnauthorizedException();
    }

    return await this.auctionService.startAuction(
      updateItemStateDto.status,
      itemId,
    );
  }
}
