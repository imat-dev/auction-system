import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService, private readonly userService : UserService) {
    super({
      usernameField: 'email',
    });
  }

  public async validate(email: string, password: string): Promise<any> {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }
    const isValid = await this.authService.comparePassword(
      password,
      user.password,
    );

    if (!isValid) {
      throw new UnauthorizedException('invalid pw');
    }

    return user;


    // return await this.authService.validateUser(username, password);
  }
}
