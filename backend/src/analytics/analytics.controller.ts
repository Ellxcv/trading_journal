import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  getOverview(@CurrentUser() user: any) {
    return this.analyticsService.getOverview(user.id);
  }

  @Get('performance-chart')
  getPerformanceChart(@CurrentUser() user: any) {
    return this.analyticsService.getPerformanceChart(user.id);
  }

  @Get('monthly-performance')
  getMonthlyPerformance(@CurrentUser() user: any) {
    return this.analyticsService.getMonthlyPerformance(user.id);
  }
}
