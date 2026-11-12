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

export interface UpdatePartInput {
  name?: string;
  category?: string;
  unit?: string;
  cost_price?: number;
  sell_price?: number;
  reorder_level?: number;
  is_active?: boolean;
}

export interface StockInInput {
  part_id: number;
  qty: number;
  unit_cost: number;
  note?: string;
}

export interface AdjustStockInput {
  new_stock_on_hand: number;
  reason: string;
}

export interface BatchReorderItem {
  part_id: number;
  qty: number;
  unit_cost: number;
  note?: string;
}

export interface BatchReorderInput {
  items: BatchReorderItem[];
  supplier_name?: string;
  invoice_ref?: string;
}

export interface LowStockItem {
  part: Part;
  deficit: number;
  suggested_reorder_qty: number;
  estimated_cost: number;
}

export interface LowStockSummary {
  low_stock_count: number;
  out_of_stock_count: number;
  total_estimated_cost: number;
  items: LowStockItem[];
}
