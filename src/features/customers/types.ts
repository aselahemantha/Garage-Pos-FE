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

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  vehicles?: Vehicle[];
}

export interface CreateCustomerInput {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface CreateVehicleInput {
  customer_id: number;
  plate_no: string;
  make: string;
  model: string;
  year?: number;
  vin?: string;
  fuel_type?: string;
  color?: string;
  last_mileage?: number;
}
