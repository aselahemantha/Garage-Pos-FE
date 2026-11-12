export type ReportPeriod = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_30_days' | 'custom';

export interface ReportSummary {
  period: string;
  start_date: string;
  end_date: string;
  total_collected: number;
  cash_collected: number;
  card_collected: number;
  bank_collected: number;
  paid_invoices_count: number;
  total_invoiced: number;
  invoice_count: number;
  total_subtotal: number;
  total_discount: number;
  total_tax: number;
  total_outstanding: number;
  outstanding_count: number;
  completed_jobs_count: number;
  average_job_value: number;
  labor_total: number;
  parts_total: number;
  custom_total: number;
}

export interface RevenueTrendItem {
  day: string;
  total_amount: number;
  cash_amount: number;
  card_amount: number;
  bank_amount: number;
}

export interface PaymentMethodItem {
  payment_method: string;
  total_amount: number;
  payment_count: number;
  percentage: number;
}

export interface TopServiceItem {
  id: number;
  name: string;
  times_performed: number;
  total_revenue: number;
}

export interface TopPartItem {
  id: number;
  name: string;
  sku: string;
  qty_sold: number;
  total_revenue: number;
}

export interface TopOutstandingItem {
  id: number;
  invoice_no: string;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  plate_no?: string;
  total: number;
  paid_total: number;
  balance: number;
  issued_at: string;
}

export interface TopItemsResponse {
  top_services: TopServiceItem[];
  top_parts: TopPartItem[];
  top_outstanding: TopOutstandingItem[];
}

export interface CashSessionSummaryItem {
  id: number;
  session_no: string;
  user_name: string;
  opened_at: string;
  closed_at?: string;
  opening_float: number;
  closing_counted?: number;
  expected_cash: number;
  difference?: number;
  status: string;
}

export interface EndOfDayReport {
  date: string;
  total_collected: number;
  cash_collected: number;
  card_collected: number;
  bank_collected: number;
  invoices_paid_count: number;
  jobs_completed_count: number;
  total_opening_float: number;
  total_closing_counted: number;
  total_expected_cash: number;
  total_difference: number;
  sessions: CashSessionSummaryItem[];
}
