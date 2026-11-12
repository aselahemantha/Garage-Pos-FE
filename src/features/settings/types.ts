export type GarageSettings = Record<string, string>;

export interface UpdateSettingsInput {
  business_name?: string;
  address?: string;
  phone?: string;
  currency_code?: string;
  currency_symbol?: string;
  tax_rate_bp?: string;
  invoice_footer?: string;
}
