import { ValidationException } from '../exceptions/custom-exceptions';
import { ValidationError } from '../interfaces/error-response.interface';

export class ValidationUtils {
  /**
   * Validates that a value is not null, undefined, or empty string
   */
  static validateRequired(value: any, fieldName: string): void {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
      throw new ValidationException(`${fieldName} is required`);
    }
  }

  /**
   * Validates that a value is a valid number
   */
  static validateNumber(value: any, fieldName: string): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationException(`${fieldName} must be a valid number`);
    }
  }

  /**
   * Validates that a value is a valid string
   */
  static validateString(value: any, fieldName: string): void {
    if (typeof value !== 'string') {
      throw new ValidationException(`${fieldName} must be a string`);
    }
  }

  /**
   * Validates that a value is a valid array
   */
  static validateArray(value: any, fieldName: string): void {
    if (!Array.isArray(value)) {
      throw new ValidationException(`${fieldName} must be an array`);
    }
  }

  /**
   * Validates that a value is a valid object
   */
  static validateObject(value: any, fieldName: string): void {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new ValidationException(`${fieldName} must be an object`);
    }
  }

  /**
   * Validates MongoDB ObjectId format
   */
  static validateObjectId(value: any, fieldName: string): void {
    if (!value || typeof value !== 'string' || !/^[0-9a-fA-F]{24}$/.test(value)) {
      throw new ValidationException(`${fieldName} must be a valid MongoDB ObjectId`);
    }
  }

  /**
   * Validates timestamp (number representing milliseconds since epoch)
   */
  static validateTimestamp(value: any, fieldName: string): void {
    if (typeof value !== 'number' || isNaN(value) || value < 0) {
      throw new ValidationException(`${fieldName} must be a valid timestamp`);
    }
  }

  /**
   * Validates coordinates array (latitude, longitude, altitude)
   */
  static validateCoordinates(coordinates: any, fieldName: string): void {
    if (!Array.isArray(coordinates) || coordinates.length !== 3) {
      throw new ValidationException(`${fieldName} must be an array with exactly 3 coordinates`);
    }

    coordinates.forEach((coord, index) => {
      if (typeof coord !== 'number' || isNaN(coord)) {
        throw new ValidationException(`${fieldName}[${index}] must be a valid number`);
      }
    });

    // Validate latitude range (-90 to 90)
    if (coordinates[0] < -90 || coordinates[0] > 90) {
      throw new ValidationException(`${fieldName}[0] (latitude) must be between -90 and 90`);
    }

    // Validate longitude range (-180 to 180)
    if (coordinates[1] < -180 || coordinates[1] > 180) {
      throw new ValidationException(`${fieldName}[1] (longitude) must be between -180 and 180`);
    }
  }

  /**
   * Validates X-ray data point structure
   */
  static validateXrayDataPoint(point: any, index: number): void {
    if (!point || typeof point !== 'object') {
      throw new ValidationException(`Invalid data point at index ${index}`);
    }

    if (typeof point[0] !== 'number' || isNaN(point[0])) {
      throw new ValidationException(`Invalid time value at index ${index}`);
    }

    this.validateCoordinates(point[1], `data[${index}].coordinates`);
  }

  /**
   * Validates X-ray message structure
   */
  static validateXrayMessage(message: any): void {
    if (!message || typeof message !== 'object') {
      throw new ValidationException('Invalid message format');
    }

    const deviceIds = Object.keys(message);
    if (deviceIds.length === 0) {
      throw new ValidationException('No device ID found in message');
    }

    const deviceId = deviceIds[0];
    const data = message[deviceId];

    if (!data || !data.data || !Array.isArray(data.data)) {
      throw new ValidationException('Invalid data structure in message');
    }

    if (!data.time || typeof data.time !== 'number') {
      throw new ValidationException('Invalid timestamp in message');
    }

    if (data.data.length === 0) {
      throw new ValidationException('Message contains no data points');
    }

    // Validate each data point
    data.data.forEach((point: any, index: number) => {
      this.validateXrayDataPoint(point, index);
    });
  }

  /**
   * Creates a validation error object
   */
  static createValidationError(field: string, value: any, message: string, constraint?: string): ValidationError {
    return {
      field,
      value,
      message,
      constraint,
    };
  }
}
