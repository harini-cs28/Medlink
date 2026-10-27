export type CriticalityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Medicine {
  id: number;
  generic_name: string;
  brand_name?: string;
  atc_code?: string;
  category: string;
  dosage_form?: string;
  strength?: string;
  criticality: CriticalityLevel;
  reorder_level: number;
  created_at?: string;
}
