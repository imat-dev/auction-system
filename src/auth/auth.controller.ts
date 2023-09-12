import { ClassSerializerInterceptor, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuardLocal } from './strategy/auth.guard.local';
import { CurrentUser } from './strategy/current-user.decorator';
import { User } from './entity/user.entity';
import { AuthService } from './auth.service';
import { AuthenticatedUser } from './strategy/auth.guard.jwt';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthGuardLocal)
  async login(@CurrentUser() user: User) {
    return {
      email: user.email,
      token: await this.authService.generateToken(user)
    };
  }

  @Get('profile')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthenticatedUser)
  async getProfile(@CurrentUser() user: User) {
    return user;
  }
}
