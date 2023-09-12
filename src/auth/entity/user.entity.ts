import { Exclude, Expose } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, ValueTransformer } from 'typeorm';


const decimalTransformer: ValueTransformer = {
  from: (dbValue: string) => parseFloat(dbValue),
  to: (entityValue: number) => entityValue.toString()
};

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

}
