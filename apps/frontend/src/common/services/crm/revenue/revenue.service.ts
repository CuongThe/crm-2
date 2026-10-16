import { CrmBaseService } from '../crm-base.service';
import { RevenueReportResponse, RevenueFilterParams } from './types';
import { ServiceItem } from '../appointments/types';
import { RequestOptions } from '@frontend/common';

export class RevenueService extends CrmBaseService<RevenueReportResponse> {
  protected override basePath = '/revenue';

  public getRevenueReport(
    params?: RevenueFilterParams,
    options?: RequestOptions,
  ): Promise<RevenueReportResponse> {
    return this.client.get<RevenueReportResponse>(this.basePath, {
      ...options,
      params,
    });
  }

  public getServices(options?: RequestOptions): Promise<ServiceItem[]> {
    return this.client.get<ServiceItem[]>(
      '/appointments/meta/services',
      options,
    );
  }
}

export const revenueService = new RevenueService();
