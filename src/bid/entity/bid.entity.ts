import { Expose } from 'class-transformer';
import { User } from 'src/auth/entity/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Item } from './items.entity';
import { decimalTransformer } from 'src/common/helpers/decimal.transformer';

@Entity()
export class Bid {
  constructor(partial?: Partial<Bid>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @ManyToOne( () => User, user => user.bids)
  user: User

  @ManyToOne(() => Item,  item => item.bids)
  item: Item

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  @Expose()
  bidAmount: number

  @CreateDateColumn({ type: 'timestamp', name: 'date_created' })
  dateCreated: Date;
 
}
