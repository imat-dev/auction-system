import { Body, ClassSerializerInterceptor, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from './../auth/entity/user.entity';
import { AuthenticatedUser } from './../auth/strategy/auth.guard.jwt';
import { CurrentUser } from './../auth/strategy/current-user.decorator';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { DepositService } from './deposit.service';

@Controller('deposits')
@UseGuards(AuthenticatedUser)
@UseInterceptors(ClassSerializerInterceptor)
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createDepositDto: CreateDepositDto,
  ) {
    return await this.depositService.makeDeposit(createDepositDto.amount, user);
  }
}
