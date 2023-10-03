import { IsEmail, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';


export class CreateUserDto {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    @IsStrongPassword()
    password: string;
} 