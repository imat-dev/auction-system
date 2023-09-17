import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true}));
 
  app.use(helmet());

  await app.listen(3000);
}
bootstrap();
