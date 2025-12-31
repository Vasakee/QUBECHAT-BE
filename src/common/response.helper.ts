import { IAppResponse } from '../interfaces/app-response.interface';

export function successResponse<T = any>(message: string, data?: T): IAppResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function errorResponse(message: string): IAppResponse {
  return {
    success: false,
    message,
  };
}
