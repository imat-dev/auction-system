import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class RateLimiterService {
  constructor(private configService: NestConfigService) {}

  private readonly redisPort = parseInt(this.configService.get<string>('REDIS_PORT'));
  private readonly redisHost = this.configService.get<string>('REDIS_HOST');
  private readonly redisPw = this.configService.get<string>('REDIS_PASSWORD');

  private readonly redisConfig = {
    host: this.redisHost,
    port: this.redisPort,
    password: this.redisPw
  }
  private redisClient = new Redis(this.redisConfig); // Configure this as needed

  async checkLimit(userId: number, itemId: number, max: number, windowMs: number): Promise<void> {

    const key = `bid_limit:${userId}:${itemId}`;
    const current = await this.redisClient.get(key) || "0";  // Default to "0" if key doesn't exist

    if (parseInt(current) >= max) {
      throw new HttpException('You can only bid once every 5 seconds for each auction.', HttpStatus.TOO_MANY_REQUESTS);
    } else {
      this.redisClient.multi()
        .incr(key)
        .expire(key, windowMs / 1000)
        .exec();
    }
  }
}