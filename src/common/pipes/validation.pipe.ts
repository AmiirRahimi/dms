import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ValidationException } from '../exceptions/custom-exceptions';
import { ValidationError } from '../interfaces/error-response.interface';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const validationErrors: ValidationError[] = this.formatValidationErrors(errors);
      throw new ValidationException('Invalid input data', validationErrors);
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatValidationErrors(errors: any[]): ValidationError[] {
    const validationErrors: ValidationError[] = [];

    errors.forEach(error => {
      if (error.constraints) {
        Object.keys(error.constraints).forEach(key => {
          validationErrors.push({
            field: error.property,
            value: error.value,
            message: error.constraints[key],
            constraint: key,
          });
        });
      }

      if (error.children && error.children.length > 0) {
        validationErrors.push(...this.formatValidationErrors(error.children));
      }
    });

    return validationErrors;
  }
}
