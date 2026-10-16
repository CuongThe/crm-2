import { BaseService, ApiItemResponse, ApiSuccessResponse, RequestOptions } from '@frontend/common';

export abstract class CrmBaseService<T> extends BaseService<T> {
  public override update(
    id: string | number,
    data: Partial<T> | any,
    options?: RequestOptions,
  ): Promise<ApiItemResponse<T>> {
    // Override: Đổi update sang PATCH để phù hợp với NestJS @Patch(':id')
    return this.client.patch<ApiItemResponse<T>>(
      `${this.basePath}/${id}`,
      data,
      options,
    );
  }

  public override destroy(
    id: string | number,
    options?: RequestOptions,
  ): Promise<ApiSuccessResponse> {
    // Override: Gửi organizationId khi xóa nếu có trong localStorage
    let params = options?.params || {};
    if (typeof window !== 'undefined' && window.localStorage) {
      const orgId = localStorage.getItem('currentOrganizationId');
      if (orgId && !params['organizationId']) {
        params = { ...params, organizationId: orgId };
      }
    }

    return this.client.delete<ApiSuccessResponse>(`${this.basePath}/${id}`, {
      ...options,
      params,
    });
  }
}
