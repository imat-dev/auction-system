import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Catch()
export class FallbackExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(FallbackExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (process.env.NODE_ENV !== 'production') {
      // Sentry.captureException(exception);
      // Log the error for debugging purposes
      this.logger.error(
        `Path: ${request.url} - Error: ${exception.message}`,
        exception.stack,
      );
    } else {
      Sentry.captureException(exception);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message || 'Internal Server Error',
    });
  }
}
