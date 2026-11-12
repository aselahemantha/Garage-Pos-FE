export interface ServiceCategory {
  id: number;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceItem {
  id: number;
  category_id: number;
  category_name: string;
  name: string;
  description?: string;
  price: number; // minor units (cents)
  est_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryInput {
  name: string;
  sort_order?: number;
}

export interface CreateServiceInput {
  category_id: number;
  name: string;
  description?: string;
  price: number; // minor units
  est_minutes?: number;
}
