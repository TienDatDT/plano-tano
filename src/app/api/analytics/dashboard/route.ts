import { NextRequest } from 'next/server';
import { analyticsService } from '@/modules/reports/services/analytics.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const data = await analyticsService.getDashboardData(startDate, endDate);
    return createResponse(data);
  } catch (error: any) {
    return createError(error.message || 'Failed to calculate analytics dashboard', 500);
  }
}
