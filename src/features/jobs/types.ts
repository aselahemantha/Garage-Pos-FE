export interface JobItem {
  id: number;
  job_card_id: number;
  item_type: 'service' | 'part';
  service_id?: number;
  part_id?: number;
  description: string;
  qty: number;
  unit_price: number; // minor units
  discount: number;   // minor units
  line_total: number; // minor units
  mechanic_id?: number;
  mechanic_name?: string;
  created_at: string;
}

export interface JobCard {
  id: number;
  job_no: string;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  vehicle_id: number;
  plate_no: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year?: number;
  advisor_id: number;
  advisor_name?: string;
  mileage_in: number;
  complaint?: string;
  notes?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delivered' | 'cancelled';
  tracking_token: string;
  promised_by?: string;
  started_at?: string;
  completed_at?: string;
  delivered_at?: string;
  created_at: string;
}

export interface JobDetail extends JobCard {
  items: JobItem[];
  total_minor: number;
}

export interface PublicTrackingItem {
  item_type: 'service' | 'part';
  description: string;
  qty: number;
  unit_price: number;
  discount: number;
  line_total: number;
}

export interface PublicTrackingInvoice {
  invoice_no: string;
  status: string;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  total: number;
  paid_total: number;
  balance: number;
}

export interface PublicTrackingData {
  garage_name: string;
  garage_phone: string;
  garage_address: string;
  currency: string;
  job_no: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delivered' | 'cancelled';
  plate_no: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year?: number;
  customer_name: string;
  mileage_in: number;
  complaint?: string;
  promised_by?: string;
  started_at?: string;
  completed_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  items: PublicTrackingItem[];
  total_minor: number;
  invoice?: PublicTrackingInvoice;
}

export interface CreateJobItemInput {
  item_type: 'service' | 'part';
  service_id?: number;
  part_id?: number;
  description: string;
  qty: number;
  unit_price: number;
  discount: number;
  mechanic_id?: number;
}

export interface CreateJobCardInput {
  customer_id: number;
  vehicle_id: number;
  mileage_in: number;
  complaint?: string;
  notes?: string;
  promised_by?: string;
  items: CreateJobItemInput[];
}

export interface UpdateJobCardInput {
  mileage_in?: number;
  complaint?: string;
  notes?: string;
  promised_by?: string;
}
