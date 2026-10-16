export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiItemResponse<T> {
  data: T;
  message?: string;
}

export interface ApiPaginateResponse<T> {
  data: T[];
  meta: PaginationMeta;
  message?: string;
}

export interface ApiCollectionResponse<T> {
  data: T[];
  message?: string;
}

export interface ApiSuccessResponse {
  success: boolean;
  message?: string;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  showToastOnError?: boolean;
  silentErrors?: boolean;
  skipAuth?: boolean;
  retryCount?: number;
}
