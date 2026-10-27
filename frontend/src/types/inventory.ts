export type StockStatusType = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCKED';

export interface BatchItem {
  id: number;
  medicine_id: number;
  batch_number: string;
  quantity: number;
  manufacturing_date?: string;
  expiry_date: string;
  unit_cost?: number;
  supplier_id?: number;
  days_to_expiry?: number;
  status?: string;
}

export interface InventoryRecord {
  id?: string;
  medicine_id?: number;
  generic_name?: string;
  brand_name?: string;
  categoryOrDrug?: string;
  category?: string;
  atcDescription?: string;
  volume?: number;
  total_stock?: number;
  reorder_level?: number;
  demandTrend?: string;
  shortageStatus?: string;
  stock_status?: StockStatusType;
  nearest_expiry?: string;
  date?: string;
}
