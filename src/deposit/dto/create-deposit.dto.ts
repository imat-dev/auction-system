import {  IsNumber, IsPositive } from "class-validator";
import { User } from "src/auth/entity/user.entity";


export class CreateDepositDto {
    @IsNumber()
    @IsPositive({ message: 'Amount must be greater than 0' })
    amount : number;
} 