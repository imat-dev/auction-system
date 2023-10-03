import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Register')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async register(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findUserByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new BadRequestException('Email already taken.');
    }

    const enteredUser = {
      ...createUserDto,
      password: await this.authService.hashPassword(createUserDto.password),
    };

    const user = await this.userService.create(enteredUser);

    return {
      email: user.email,
      token: await this.authService.generateToken(user)
    }
  }
}
