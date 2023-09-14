import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly userTimestamps = {};

  use(req: Request, res: Response, next: NextFunction) {
    // const userId = req.user.id;  

    // if (this.userTimestamps[userId] && Date.now() - this.userTimestamps[userId] < 5000) {
    //   return res.status(429).json({ message: 'You can bid only once every 5 seconds.' });
    // }

    // this.userTimestamps[userId] = Date.now();
    next();
  }
}