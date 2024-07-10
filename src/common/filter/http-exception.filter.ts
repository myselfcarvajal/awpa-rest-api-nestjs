import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { HealthCheckResult } from '@nestjs/terminus';

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

// Type guard to check if the response is a HealthCheckResult
const isHealthCheckResult = (
  response: unknown,
): response is HealthCheckResult => {
  return (
    typeof response === 'object' && response !== null && 'status' in response
  );
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

    const errorResponse = {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Check if the exception is a health check result
    const exceptionResponse = exception.getResponse();
    if (isHealthCheckResult(exceptionResponse)) {
      return response.status(statusCode).json(exceptionResponse);
    }

    // Log the error
    this.logger.error(
      `[${this.constructor.name}] ${request.method} ${request.originalUrl} ${statusCode} ${message}`,
    );

    response.status(statusCode).json(errorResponse);
  }
}
