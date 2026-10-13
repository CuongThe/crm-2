import { Controller, Get, Query } from '@nestjs/common';
import { RevenueService } from './revenue.service';
import { RevenueQueryDto } from './dto/revenue-query.dto';

@Controller('revenue')
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get()
  getRevenue(@Query() query: RevenueQueryDto) {
    return this.revenueService.getRevenueReport(query);
  }
}
