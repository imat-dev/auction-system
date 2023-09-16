import { Module } from '@nestjs/common';
import { DepositController } from './deposit.controller';
import { DepositService } from './deposit.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './../auth/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [DepositController],
  providers: [DepositService],
})
export class DepositModule {}
