import { Controller, Get, Query } from '@nestjs/common';
import { RevenueService } from './revenue.service';
import { RevenueQueryDto } from './dto/revenue-query.dto';
import { Roles } from '../auth/decorators';
import { Role } from '../common/enums';

@Controller('revenue')
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get()
  @Roles(Role.ADMIN)
  getRevenue(@Query() query: RevenueQueryDto) {
    return this.revenueService.getRevenueReport(query);
  }
}

