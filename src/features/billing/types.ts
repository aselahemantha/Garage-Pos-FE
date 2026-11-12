export type InvoiceStatus = 'draft' | 'issued' | 'partially_paid' | 'paid' | 'void';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'other';
export type InvoiceItemType = 'labor' | 'part' | 'custom';

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  item_type: InvoiceItemType;
  service_id?: number;
  part_id?: number;
  description: string;
  qty: number;
  unit_price: number; // minor units (cents)
  discount: number;
  line_total: number;
  mechanic_name?: string;
  created_at: string;
}

export interface Payment {
  id: number;
  invoice_id: number;
  cash_session_id?: number;
  payment_method: PaymentMethod;
  amount: number;
  tendered?: number;
  change_given: number;
  reference_no?: string;
  notes?: string;
  created_by_name: string;
  created_at: string;
}

export interface InvoiceSummary {
  id: number;
  invoice_no: string;
  job_card_id?: number;
  job_no?: string;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  vehicle_id?: number;
  plate_no?: string;
  status: InvoiceStatus;
  subtotal: number;
  discount_total: number;
  tax_bps: number;
  tax_total: number;
  total: number;
  paid_total: number;
  balance: number;
  issued_at: string;
  paid_at?: string;
  voided_at?: string;
  created_at: string;
}

export interface InvoiceDetail {
  id: number;
  invoice_no: string;
  job_card_id?: number;
  job_no?: string;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  vehicle_id?: number;
  plate_no?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  status: InvoiceStatus;
  subtotal: number;
  discount_total: number;
  tax_bps: number;
  tax_total: number;
  total: number;
  paid_total: number;
  balance: number;
  issued_at: string;
  due_at?: string;
  paid_at?: string;
  voided_at?: string;
  void_reason?: string;
  notes?: string;
  created_by_name: string;
  created_at: string;
  items: InvoiceItem[];
  payments: Payment[];
}

export interface CashSession {
  id: number;
  session_no: string;
  user_id: number;
  user_name: string;
  opened_at: string;
  closed_at?: string;
  opening_float: number;
  closing_counted?: number;
  expected_cash: number;
  difference?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface IssueInvoicePayload {
  job_card_id?: number;
  customer_id?: number;
  vehicle_id?: number;
  tax_bps?: number;
  notes?: string;
  items?: Array<{
    item_type: InvoiceItemType;
    service_id?: number;
    part_id?: number;
    description: string;
    qty: number;
    unit_price: number;
    discount: number;
    mechanic_name?: string;
  }>;
}

export interface RecordPaymentPayload {
  payment_method: PaymentMethod;
  amount: number;
  tendered?: number;
  reference_no?: string;
  notes?: string;
  mark_delivered?: boolean;
}

export interface OpenCashSessionPayload {
  opening_float: number;
  notes?: string;
}

export interface CloseCashSessionPayload {
  closing_counted: number;
  notes?: string;
}

export interface ApplyDiscountPayload {
  discount_amount?: number;
  discount_percent?: number;
  reason?: string;
}
