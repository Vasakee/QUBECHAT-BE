export interface IAppResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
