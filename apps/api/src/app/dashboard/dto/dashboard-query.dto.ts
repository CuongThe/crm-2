import { IsDateString, IsOptional } from 'class-validator';

export class DashboardQueryDto {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'fromDate phải theo chuẩn ISO 8601 (ví dụ: 2026-10-01)' },
  )
  fromDate?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'toDate phải theo chuẩn ISO 8601 (ví dụ: 2026-10-31)' },
  )
  toDate?: string;
}
