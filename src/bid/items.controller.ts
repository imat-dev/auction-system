import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ItemService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { AuthenticatedUser } from 'src/auth/strategy/auth.guard.jwt';
import { CurrentUser } from 'src/auth/strategy/current-user.decorator';
import { User } from 'src/auth/entity/user.entity';
import { UpdateItemDto } from './dto/update-item.dto';
import { Status } from './entity/items.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Controller('items')
@UseGuards(AuthenticatedUser)
@UseInterceptors(ClassSerializerInterceptor)
export class ItemsController {
  constructor(
    private readonly itemService: ItemService,

    @InjectQueue('refunds')
    private refundsQueue: Queue,
  ) {}

  //Todo: pagination
  @Get()
  async findAll(@Query('status') status: Status) {
    return await this.itemService.findAll(status);
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createItemDto: CreateItemDto,
  ) {
    return await this.itemService.createBidItem(createItemDto, user);
  }

  @Patch(':itemId')
  async updateItemState(
    @Param('itemId') itemId: number,
    @CurrentUser() user: User,
    @Body() updateItemStateDto: UpdateItemDto,
  ) {
    const isItemOwner = await this.itemService.checkUserOwnership(user);

    if (!isItemOwner) {
      throw new UnauthorizedException();
    }

    const job = await this.refundsQueue.add(
      {
        itemId: itemId,
      },
      {
        delay: 1 * 5000,
        // delay: 1 * 1000 * 60 * 60,
        attempts: 3, // Number of attempts to run the job in case of failures
        removeOnComplete: true,
      },
    );


    if (!job) {
      //action here when adding queue fails.
      throw new InternalServerErrorException()
    }

    return await this.itemService.udpateBidStatus(
      updateItemStateDto.status,
      itemId,
      String(job.id)
    );

  }
}
