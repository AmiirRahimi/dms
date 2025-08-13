import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DatabaseException } from '../exceptions/custom-exceptions';

@Injectable()
export class DatabaseErrorMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DatabaseErrorMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;

    res.send = function (body: any) {
      // Check if the response contains a database error
      if (body && typeof body === 'string') {
        try {
          const parsedBody = JSON.parse(body);
          if (parsedBody.error && parsedBody.error.includes('Database')) {
            // Log database errors for monitoring
            Logger.error(`Database error in ${req.method} ${req.path}: ${parsedBody.message}`);
          }
        } catch (e) {
          // If parsing fails, it's not JSON, so continue normally
        }
      }

      return originalSend.call(this, body);
    };

    next();
  }
}
