export interface Part {
  id: number;
  sku: string;
  name: string;
  category?: string;
  unit: string;
  cost_price: number; // minor units
  sell_price: number; // minor units
  reorder_level: number;
  stock_on_hand: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePartInput {
  sku: string;
  name: string;
  category?: string;
  unit: string;
  cost_price: number;
  sell_price: number;
  reorder_level: number;
}

export interface StockInInput {
  part_id: number;
  qty: number;
  unit_cost: number;
  note?: string;
}
