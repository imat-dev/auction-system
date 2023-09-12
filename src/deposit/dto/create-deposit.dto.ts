import {  IsNumber, IsPositive } from "class-validator";


export class CreateDepositDto {
    @IsNumber()
    @IsPositive({ message: 'Amount must be greater than 0' })
    amount : number;
} 