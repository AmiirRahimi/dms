export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  details?: any;
  timestamp: string;
  path?: string;
}

export interface ValidationError {
  field: string;
  value: any;
  message: string;
  constraint?: string;
}

export interface DatabaseError {
  code: string;
  message: string;
  details?: any;
}

export interface ProcessingError {
  step: string;
  message: string;
  data?: any;
}
