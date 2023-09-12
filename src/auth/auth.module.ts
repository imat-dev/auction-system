import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
JwtModule

@Module({
   imports : [
      TypeOrmModule.forFeature([User]),
      JwtModule.registerAsync({
         useFactory: () => ({
           secret: process.env.AUTH_SECRET,
           signOptions: {
             expiresIn: '60m'
           }
         })
       })
      
   ],
   providers: [UserService, AuthService, LocalStrategy, JwtStrategy],
   controllers: [AuthController, UserController]
})
export class AuthModule {}
