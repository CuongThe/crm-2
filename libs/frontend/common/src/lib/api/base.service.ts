import { ApiClient, apiClient } from './api-client';
import {
  ApiItemResponse,
  ApiPaginateResponse,
  ApiSuccessResponse,
  ApiCollectionResponse,
  RequestOptions,
} from './types';

export abstract class BaseService<T> {
  protected client: ApiClient;
  protected abstract basePath: string;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  public get(
    params?: Record<string, any>,
    options?: RequestOptions,
  ): Promise<ApiCollectionResponse<T>> {
    return this.client.get<ApiCollectionResponse<T>>(this.basePath, {
      ...options,
      params,
    });
  }

  public list(
    params?: Record<string, any>,
    options?: RequestOptions,
  ): Promise<ApiPaginateResponse<T>> {
    return this.client.get<ApiPaginateResponse<T>>(this.basePath, {
      ...options,
      params,
    });
  }

  public show(
    id: string | number,
    options?: RequestOptions,
  ): Promise<ApiItemResponse<T>> {
    return this.client.get<ApiItemResponse<T>>(
      `${this.basePath}/${id}`,
      options,
    );
  }

  public create(
    data: Partial<T> | any,
    options?: RequestOptions,
  ): Promise<ApiItemResponse<T>> {
    return this.client.post<ApiItemResponse<T>>(this.basePath, data, options);
  }

  public update(
    id: string | number,
    data: Partial<T> | any,
    options?: RequestOptions,
  ): Promise<ApiItemResponse<T>> {
    return this.client.put<ApiItemResponse<T>>(
      `${this.basePath}/${id}`,
      data,
      options,
    );
  }

  public destroy(
    id: string | number,
    options?: RequestOptions,
  ): Promise<ApiSuccessResponse> {
    return this.client.delete<ApiSuccessResponse>(
      `${this.basePath}/${id}`,
      options,
    );
  }
}
