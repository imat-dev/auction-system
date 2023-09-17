import { Exclude, Expose } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { decimalTransformer } from '../../common/helpers/decimal.transformer';
import { Item } from '../../auction/entity/items.entity';
import { Bid } from '../../auction/entity/bid.entity';

@Entity()
export class User {
  constructor(partial?: Partial<User>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ unique: true })
  @Expose()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00, transformer: decimalTransformer })
  balance: number;

  @OneToMany(() => Item, item => item.owner)
  items: Item[];

  @OneToMany(() => Item, item => item.highestBidder)
  highestBidItems: Item[];

  @OneToMany(() => Bid, bid => bid.user)
  bids: Bid[]

}
