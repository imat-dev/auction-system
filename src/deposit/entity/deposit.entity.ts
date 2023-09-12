import { Expose } from 'class-transformer';
import { User } from 'src/auth/entity/user.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Deposit {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  amount: number;

  @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;
  @Expose()
  dateCreated: Date;
}
