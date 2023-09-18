import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import { FallbackExceptionFilter } from './common/filters/fallback.filter';

async function bootstrap() {

  if(process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [new Sentry.Integrations.Http({ tracing: true })],
      tracesSampleRate: .3,
    });
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new FallbackExceptionFilter());

  app.use(helmet());

  await app.listen(process.env.PORT || 3000);

}
bootstrap();
