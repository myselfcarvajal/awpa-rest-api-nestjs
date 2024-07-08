import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

const getStatusCode = <T>(exception: T): number => {
  return exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;
};

const getErrorMessage = <T>(exception: T): string | string[] => {
  if (exception instanceof HttpException) {
    const response = exception.getResponse();
    if (typeof response === 'object' && 'message' in response) {
      return (response as any).message;
    }
    return exception.message;
  }
  return String(exception);
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private logger: Logger) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = getStatusCode(exception);
    const message = getErrorMessage(exception);

    // Log the error
    this.logger.error(
      `[HttpExceptionFilter] ${request.method} ${request.originalUrl} ${statusCode} ${message}`,
    );

    const errorResponse = {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    response.status(statusCode).json(errorResponse);
  }
}
