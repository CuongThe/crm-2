import { CrmBaseService } from '../crm-base.service';
import { Customer, CustomerFilterParams, CreateCustomerInput, UpdateCustomerInput } from './types';
import { ApiPaginateResponse, ApiSuccessResponse, RequestOptions } from '@frontend/common';

export class CustomerService extends CrmBaseService<Customer> {
  protected override basePath = '/customers';

  public getCustomers(
    params?: CustomerFilterParams,
    options?: RequestOptions,
  ): Promise<ApiPaginateResponse<Customer>> {
    return this.list(params, options);
  }

  public getCustomerById(
    id: string,
    options?: RequestOptions,
  ): Promise<Customer> {
    // Backend returns raw customer object on GET /customers/:id or ApiItemResponse
    return this.client.get<Customer>(`${this.basePath}/${id}`, options);
  }

  public createCustomer(
    data: CreateCustomerInput,
    options?: RequestOptions,
  ): Promise<Customer> {
    return this.client.post<Customer>(this.basePath, data, options);
  }

  public updateCustomer(
    id: string,
    data: UpdateCustomerInput,
    options?: RequestOptions,
  ): Promise<Customer> {
    return this.client.patch<Customer>(`${this.basePath}/${id}`, data, options);
  }

  public deleteCustomer(
    id: string,
    options?: RequestOptions,
  ): Promise<ApiSuccessResponse> {
    return this.destroy(id, options);
  }
}

export const customerService = new CustomerService();
