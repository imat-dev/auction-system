import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/auth/entity/user.entity';
import { AuthenticatedUser } from 'src/auth/strategy/auth.guard.jwt';
import { CurrentUser } from 'src/auth/strategy/current-user.decorator';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { DepositService } from './deposit.service';

@Controller('deposits')
@UseGuards(AuthenticatedUser)
export class DepositController {
  
  constructor( private readonly depositService : DepositService) {}

    @Post()
    async create(
    @CurrentUser() user: User,
    @Body() createDepositDto: CreateDepositDto,
  ) {
    return await this.depositService.makeDeposit(createDepositDto)
  }
}
