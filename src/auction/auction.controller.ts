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
import { AuthenticatedUser } from 'src/auth/strategy/auth.guard.jwt';
import { CurrentUser } from 'src/auth/strategy/current-user.decorator';
import { User } from 'src/auth/entity/user.entity';
import { UpdateItemDto } from './dto/update-item.dto';
import { Status } from './entity/items.entity';

@Controller('auction')
@UseGuards(AuthenticatedUser)
@UseInterceptors(ClassSerializerInterceptor)
export class AuctionController {
  constructor(
    private readonly auctionService: AuctionService,
  ) {}

  //Todo: pagination
  @Get()
  async findAll(@Query('status') status: Status) {
    return await this.auctionService.findAll(status);
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
      itemId
    );

  }
}
