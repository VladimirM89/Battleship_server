export interface LoginRequest {
  name: string;
  password: string;
}

export interface LoginResponse {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}
