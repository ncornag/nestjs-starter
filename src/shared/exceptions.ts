import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  HttpExceptionOptions
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyReply } from 'fastify';
import { ServerResponse } from 'http';
import { TypeboxValidationException } from 'nestjs-typebox';

export const NOT_MODIFIED = 'NotModified';
export class NotModifiedException extends HttpException {
  constructor() {
    super(NOT_MODIFIED, HttpStatus.NOT_MODIFIED);
  }
}

export const VALIDATION_FAILED = 'Validation Failed';
export class ValidationException extends HttpException {
  constructor(
    objectOrError?: string | object | any,
    descriptionOrOptions?: string | HttpExceptionOptions
  ) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: VALIDATION_FAILED,
        errors: objectOrError
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply<ServerResponse>>();

    if (exception instanceof TypeboxValidationException) {
      return response.status(exception.getStatus()).send({
        statusCode: exception.getStatus(),
        message: VALIDATION_FAILED,
        errors: (exception as any).response.errors.map((e) => {
          return {
            path: e.path,
            value: e.value,
            message: e.message
          };
        })
      });
    }

    if (exception instanceof HttpException) {
      return response.status(exception.getStatus()).send({
        statusCode: exception.getStatus(),
        message: exception.message,
        errors: (exception as any).response.errors
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: (exception as any)?.message,
      errors: (exception as any)?.response?.errors
    });
  }
}
