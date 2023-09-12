import { AuthGuard } from '@nestjs/passport';

export class AuthenticatedUser extends AuthGuard('jwt') {}
