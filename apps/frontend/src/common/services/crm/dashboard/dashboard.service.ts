import { CrmBaseService } from '../crm-base.service';
import { DashboardStats } from './types';
import { RequestOptions } from '@frontend/common';

export class DashboardService extends CrmBaseService<DashboardStats> {
  protected override basePath = '/dashboard';

  public getStats(options?: RequestOptions): Promise<DashboardStats> {
    return this.client.get<DashboardStats>(`${this.basePath}/stats`, options);
  }
}

export const dashboardService = new DashboardService();
