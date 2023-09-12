import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import ormConfig from './common/config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositModule } from './deposit/deposit.module';
import { BidModule } from './bid/bid.module';
import ormConfigProd from './common/config/orm.config.prod';

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
    AuthModule,
    DepositModule,
    BidModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
