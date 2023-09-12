import { Exclude } from "class-transformer";
import { IsEmail, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";


export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(20)
    @IsStrongPassword()
    password: string;
} 