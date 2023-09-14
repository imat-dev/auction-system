import { Exclude, Expose } from 'class-transformer';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { decimalTransformer } from 'src/common/helpers/decimal.transformer';
import { User } from 'src/auth/entity/user.entity';
import { Min } from 'class-validator';
import { Bid } from './bid.entity';

export enum Status {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  COMPLETED = 'completed',
}
@Entity()
export class Item {
  constructor(partial?: Partial<Item>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  @Expose()
  startingPrice: number;

  @Column({
    type: 'int',
  })
  @Expose()
  windowTime: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.DRAFT,
  })
  @Expose()
  status: Status;


  @ManyToOne(() => User, user => user.items, { eager : true})
  owner : User

  @ManyToOne(() => User, user => user.highestBidItems, { eager : true})
  highestBidder : User

  @Column({ 
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    default: 0,
    transformer: decimalTransformer,
  })
  @Expose()
  highestBid: number;

  @OneToMany(() => Bid, bid => bid.item)
  bids : Bid[]

  
  @Column({
    nullable: true,
  })
  refundJobId: string

  @Column({ type: 'boolean', default: false })
  isRefundJobCompleted: boolean;

}
