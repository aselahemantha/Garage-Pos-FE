export interface ServiceCategory {
  id: number;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceVehiclePrice {
  id: number;
  service_id: number;
  vehicle_make: string;
  vehicle_model: string;
  price: number; // minor units (cents)
  created_at: string;
  updated_at: string;
}

export interface UpsertVehiclePriceInput {
  vehicle_make?: string;
  vehicle_model: string;
  price: number; // minor units
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
  vehicle_prices: ServiceVehiclePrice[];
  created_at: string;
  updated_at: string;
}

export function resolveServicePrice(
  service: ServiceItem,
  make?: string,
  model?: string
): { price: number; matchedVehicle?: string } {
  const vps = service.vehicle_prices || [];
  if (vps.length === 0 || (!make && !model)) {
    return { price: service.price };
  }
  const mMake = (make || '').trim().toLowerCase();
  const mModel = (model || '').trim().toLowerCase();

  // 1. Exact make + model match
  if (mMake && mModel) {
    const exact = vps.find(
      (vp) =>
        vp.vehicle_make.trim().toLowerCase() === mMake &&
        vp.vehicle_model.trim().toLowerCase() === mModel
    );
    if (exact) {
      return {
        price: exact.price,
        matchedVehicle: `${exact.vehicle_make} ${exact.vehicle_model}`.trim(),
      };
    }
  }

  // 2. Model-only match (either blank make in rule or exact model match regardless of make)
  if (mModel) {
    const blankMakeMatch = vps.find(
      (vp) => vp.vehicle_make.trim() === '' && vp.vehicle_model.trim().toLowerCase() === mModel
    );
    if (blankMakeMatch) {
      return { price: blankMakeMatch.price, matchedVehicle: blankMakeMatch.vehicle_model.trim() };
    }

    const modelOnly = vps.find((vp) => vp.vehicle_model.trim().toLowerCase() === mModel);
    if (modelOnly) {
      return {
        price: modelOnly.price,
        matchedVehicle: `${modelOnly.vehicle_make} ${modelOnly.vehicle_model}`.trim(),
      };
    }

    // 3. Substring match on model (e.g. "Wagon R Stingray" matching "Wagon R")
    const fuzzy = vps.find((vp) => {
      const vpModel = vp.vehicle_model.trim().toLowerCase();
      const vpMake = vp.vehicle_make.trim().toLowerCase();
      const makeOk = !vpMake || !mMake || vpMake === mMake;
      return makeOk && (mModel.includes(vpModel) || vpModel.includes(mModel));
    });
    if (fuzzy) {
      return {
        price: fuzzy.price,
        matchedVehicle: `${fuzzy.vehicle_make} ${fuzzy.vehicle_model}`.trim(),
      };
    }
  }

  return { price: service.price };
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
