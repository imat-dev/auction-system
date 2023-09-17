import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from './../../auth/entity/user.entity';
import { Bid } from './../../auction/entity/bid.entity';
import { Item } from './../../auction/entity/items.entity';

export default registerAs(
  'orm.config',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Item, Bid],
    synchronize: true,
    dropSchema: Boolean(parseInt(process.env.DB_DROP_SCHEMA)),
    timezone: 'Z', // This sets the timezone to UTC
  }),
);