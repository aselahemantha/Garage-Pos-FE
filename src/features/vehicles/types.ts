export interface Vehicle {
  id: number;
  customer_id: number;
  plate_no: string;
  make: string;
  model: string;
  year?: number;
  vin?: string;
  fuel_type?: string;
  color?: string;
  last_mileage?: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleHistoryJobItem {
  description: string;
  item_type: string;
  qty: number;
  line_total: number;
}

export interface VehicleHistoryJob {
  id: number;
  job_no: string;
  status: string;
  mileage_in: number;
  complaint?: string;
  notes?: string;
  advisor_name: string;
  total_amount: number;
  completed_at?: string;
  created_at: string;
  items: VehicleHistoryJobItem[];
}

export interface VehicleHistoryInvoice {
  id: number;
  invoice_no: string;
  total: number;
  paid_total: number;
  balance: number;
  status: string;
  issued_at: string;
}

export interface VehicleCustomerInfo {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface VehicleHistoryResponse {
  vehicle: Vehicle;
  customer: VehicleCustomerInfo;
  jobs: VehicleHistoryJob[];
  invoices: VehicleHistoryInvoice[];
}
