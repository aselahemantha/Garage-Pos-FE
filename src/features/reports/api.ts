import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  ReportSummary,
  RevenueTrendItem,
  PaymentMethodItem,
  TopItemsResponse,
  EndOfDayReport,
  ReportPeriod,
} from './types';

export function useReportSummary(period: ReportPeriod, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['report-summary', period, startDate, endDate],
    queryFn: () =>
      apiClient<{ data: ReportSummary }>('/reports/summary', {
        params: {
          period,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      }).then((res) => res.data),
  });
}

export function useRevenueTrend(period: ReportPeriod, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['report-revenue-trend', period, startDate, endDate],
    queryFn: () =>
      apiClient<{ data: RevenueTrendItem[] }>('/reports/revenue-trend', {
        params: {
          period,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      }).then((res) => res.data),
  });
}

export function usePaymentMethods(period: ReportPeriod, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['report-payment-methods', period, startDate, endDate],
    queryFn: () =>
      apiClient<{ data: PaymentMethodItem[] }>('/reports/payment-methods', {
        params: {
          period,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      }).then((res) => res.data),
  });
}

export function useTopItems(period: ReportPeriod, startDate?: string, endDate?: string, limit = 5) {
  return useQuery({
    queryKey: ['report-top-items', period, startDate, endDate, limit],
    queryFn: () =>
      apiClient<{ data: TopItemsResponse }>('/reports/top-items', {
        params: {
          period,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          limit,
        },
      }).then((res) => res.data),
  });
}

export function useEndOfDayReport(date?: string) {
  return useQuery({
    queryKey: ['report-end-of-day', date],
    queryFn: () =>
      apiClient<{ data: EndOfDayReport }>('/reports/end-of-day', {
        params: {
          date: date || undefined,
        },
      }).then((res) => res.data),
  });
}
