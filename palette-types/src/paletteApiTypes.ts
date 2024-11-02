export interface PaletteAPIError {
  param: string;
  msg: string;
}

/**
 * Defines the response the frontend will use.
 */
export interface PaletteAPIResponse<T> {
  success?: boolean;
  data?: T | null;
  loading?: boolean;
  error?: string | null;
  errors?: string[];
}

/**
 * Defines the requests sent to the backend.
 */
export interface PaletteAPIBaseRequest {
  baseURL?: string;
  headers?: HeadersInit;
  method?: string;
  body?: string;
}
