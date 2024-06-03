export class ApiResponse<T> {
  data: T | null;
  message?: string | string[];
  success?: boolean;
  timestamp?: string;

  constructor(data: ApiResponse<T>) {
    this.data = data.data;
    this.message = data.message || "";
    this.success = data.success ?? true;
    this.timestamp = new Date().toISOString();
  }
}
