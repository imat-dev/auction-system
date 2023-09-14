import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import ormConfig from './common/config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositModule } from './deposit/deposit.module';
import { AuctionModule } from './auction/auction.module';
import ormConfigProd from './common/config/orm.config.prod';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormConfig],
      expandVariables: true,
      envFilePath: `${process.env.NODE_ENV ?? ''}.env`,
    }),
    TypeOrmModule.forRootAsync({
      useFactory:
        process.env.NODE_ENV !== 'production' ? ormConfig : ormConfigProd,
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    AuthModule,
    DepositModule,
    AuctionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
