import { registerAs } from '@nestjs/config';

export default registerAs('redis.config', () => ({
  redis: {
    port: parseInt(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD
  },
}));
