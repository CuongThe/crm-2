import { IsOptional, IsString, Matches } from 'class-validator';

export class RevenueQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'month phải theo định dạng YYYY-MM (ví dụ: 2026-10)',
  })
  month?: string;

  @IsOptional()
  @IsString()
  serviceId?: string;
}
