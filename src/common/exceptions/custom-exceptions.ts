import { HttpException, HttpStatus } from '@nestjs/common';

export class DatabaseException extends HttpException {
  constructor(message: string, error?: any) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Database operation failed: ${message}`,
        error: 'Database Error',
        details: error?.message || error,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class DataProcessingException extends HttpException {
  constructor(message: string, error?: any) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Data processing failed: ${message}`,
        error: 'Data Processing Error',
        details: error?.message || error,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ValidationException extends HttpException {
  constructor(message: string, errors?: any[]) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Validation failed: ${message}`,
        error: 'Validation Error',
        details: errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `${resource} with id ${id} not found`,
        error: 'Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class RabbitMQException extends HttpException {
  constructor(message: string, error?: any) {
    super(
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: `RabbitMQ operation failed: ${message}`,
        error: 'RabbitMQ Error',
        details: error?.message || error,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
