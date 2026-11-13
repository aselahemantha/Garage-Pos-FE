import React, { useState } from 'react';
import {
  useCategories,
  useServices,
  useCreateCategory,
  useCreateService,
  useUpsertVehiclePrice,
  useDeleteVehiclePrice,
} from './api';
import { Wrench, Plus, Clock, X, Loader2, FolderPlus, Car, Trash2 } from 'lucide-react';
import { formatMoney } from '@/lib/format';

export const CatalogPage: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [vehiclePricingSvcId, setVehiclePricingSvcId] = useState<number | null>(null);
  const [vpMake, setVpMake] = useState('');
  const [vpModel, setVpModel] = useState('');
  const [vpPrice, setVpPrice] = useState('');
  const [vpError, setVpError] = useState<string | null>(null);

  // New Category State
  const [catName, setCatName] = useState('');

  // New Service State
  const [svcCatId, setSvcCatId] = useState<number>(1);
  const [svcName, setSvcName] = useState('');
  const [svcDesc, setSvcDesc] = useState('');
  const [svcPrice, setSvcPrice] = useState('');
  const [svcMinutes, setSvcMinutes] = useState('60');

  const { data: categories, isLoading: isLoadingCats } = useCategories();
  const { data: services, isLoading: isLoadingSvcs } = useServices(selectedCategoryId);

  const createCategory = useCreateCategory();
  const createService = useCreateService();
  const upsertVehiclePrice = useUpsertVehiclePrice();
  const deleteVehiclePrice = useDeleteVehiclePrice();

  const activeVehiclePricingSvc = services?.find((s) => s.id === vehiclePricingSvcId) ?? null;

  const handleAddVehiclePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehiclePricingSvc || !vpModel.trim() || !vpPrice) return;
    setVpError(null);
    const minor = Math.round(parseFloat(vpPrice) * 100);
    if (isNaN(minor) || minor < 0) {
      setVpError('Enter a valid price');
      return;
    }
    try {
      await upsertVehiclePrice.mutateAsync({
        serviceId: activeVehiclePricingSvc.id,
        input: {
          vehicle_make: vpMake.trim(),
          vehicle_model: vpModel.trim(),
          price: minor,
        },
      });
      setVpMake('');
      setVpModel('');
      setVpPrice('');
    } catch (err: unknown) {
      setVpError(err instanceof Error ? err.message : 'Failed to save vehicle price');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    try {
      await createCategory.mutateAsync({ name: catName });
      setIsAddCategoryOpen(false);
      setCatName('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!svcName || !svcPrice) return;

    try {
      // Input price in LKR -> convert to minor units (x100)
      const minorPrice = Math.round(parseFloat(svcPrice) * 100);
      await createService.mutateAsync({
        category_id: svcCatId,
        name: svcName,
        description: svcDesc || undefined,
        price: minorPrice,
        est_minutes: svcMinutes ? parseInt(svcMinutes, 10) : undefined,
      });

      setIsAddServiceOpen(false);
      setSvcName('');
      setSvcDesc('');
      setSvcPrice('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create service');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-condensed font-bold tracking-tight text-foreground">
            Service Catalog
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure workshop labor packages, standard repair rates, and diagnostic fees
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddCategoryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground min-h-[44px]"
          >
            <FolderPlus className="w-4 h-4 text-muted-foreground" />
            <span>New Category</span>
          </button>

          <button
            onClick={() => {
              if (categories && categories.length > 0) {
                setSvcCatId(categories[0].id);
              }
              setIsAddServiceOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 py-2.5 rounded-lg shadow-sm text-xs min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills (matching Page 4) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setSelectedCategoryId(undefined)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[34px] ${
            selectedCategoryId === undefined
              ? 'bg-foreground text-background font-bold'
              : 'bg-card text-foreground border border-border hover:bg-muted'
          }`}
        >
          All
        </button>

        {categories?.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[34px] ${
                isSelected
                  ? 'bg-foreground text-background font-bold'
                  : 'bg-card text-foreground border border-border hover:bg-muted'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Services Grid */}
      {isLoadingSvcs || isLoadingCats ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : services && services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div
              key={s.id}
              className="bg-card rounded-xl border border-border p-5 shadow-soft flex flex-col justify-between hover:border-primary/50 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-foreground leading-snug">{s.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-primary/10 text-primary shrink-0">
                    {s.category_name}
                  </span>
                </div>

                {s.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{s.est_minutes ? `~${s.est_minutes} min` : 'Variable time'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setVehiclePricingSvcId(s.id);
                      setVpError(null);
                    }}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-colors ${
                      (s.vehicle_prices?.length ?? 0) > 0
                        ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                        : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted'
                    }`}
                    title="Configure vehicle-specific prices"
                  >
                    <Car className="w-3 h-3" />
                    {(s.vehicle_prices?.length ?? 0) > 0
                      ? `${s.vehicle_prices.length} vehicle${s.vehicle_prices.length > 1 ? 's' : ''}`
                      : 'Vehicle prices'}
                  </button>
                </div>

                <div className="text-right">
                  <span className="font-plate text-xl font-bold tracking-tight text-foreground">
                    {formatMoney(s.price, 'LKR')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-card rounded-xl border border-border">
          <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-lg text-foreground">No services in this category</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Add standard repair procedures and labor tasks to this category.
          </p>
        </div>
      )}

      {/* Add Service Modal */}
      {isAddServiceOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-modal p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <h2 className="text-xl font-condensed font-bold text-foreground">New Service Item</h2>
              <button
                onClick={() => setIsAddServiceOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Category</label>
                <select
                  value={svcCatId}
                  onChange={(e) => setSvcCatId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                >
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={svcName}
                  onChange={(e) => setSvcName(e.target.value)}
                  placeholder="e.g. Brake Pad Replacement"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <input
                  type="text"
                  value={svcDesc}
                  onChange={(e) => setSvcDesc(e.target.value)}
                  placeholder="e.g. Labour · about 1 h"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Price (LKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={svcPrice}
                    onChange={(e) => setSvcPrice(e.target.value)}
                    placeholder="4500"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Est. Minutes
                  </label>
                  <input
                    type="number"
                    value={svcMinutes}
                    onChange={(e) => setSvcMinutes(e.target.value)}
                    placeholder="60"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddServiceOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createService.isPending}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs rounded-lg min-h-[40px] shadow-sm disabled:opacity-50"
                >
                  {createService.isPending ? 'Saving...' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-xl border border-border shadow-modal p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <h2 className="text-xl font-condensed font-bold text-foreground">New Category</h2>
              <button
                onClick={() => setIsAddCategoryOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Electrical Diagnostics"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCategory.isPending}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs rounded-lg min-h-[40px] shadow-sm disabled:opacity-50"
                >
                  {createCategory.isPending ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicle-Specific Pricing Modal */}
      {activeVehiclePricingSvc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-modal p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h2 className="text-xl font-condensed font-bold text-foreground">
                  Vehicle-Specific Prices
                </h2>
                <p className="text-xs text-muted-foreground">
                  {activeVehiclePricingSvc.name} · Base price{' '}
                  <span className="font-semibold text-foreground">
                    {formatMoney(activeVehiclePricingSvc.price, 'LKR')}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setVehiclePricingSvcId(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {vpError && (
              <div className="mb-3 p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive">
                {vpError}
              </div>
            )}

            <form onSubmit={handleAddVehiclePrice} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mb-5">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Make (optional)
                </label>
                <input
                  type="text"
                  value={vpMake}
                  onChange={(e) => setVpMake(e.target.value)}
                  placeholder="Suzuki"
                  className="w-full px-2.5 py-2 text-xs bg-background border border-border rounded-lg min-h-[38px]"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Model *
                </label>
                <input
                  type="text"
                  required
                  value={vpModel}
                  onChange={(e) => setVpModel(e.target.value)}
                  placeholder="Wagon R / Alto / Premio"
                  className="w-full px-2.5 py-2 text-xs bg-background border border-border rounded-lg min-h-[38px]"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Price (LKR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={vpPrice}
                  onChange={(e) => setVpPrice(e.target.value)}
                  placeholder="16500"
                  className="w-full px-2.5 py-2 text-xs bg-background border border-border rounded-lg min-h-[38px]"
                />
              </div>
              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={upsertVehiclePrice.isPending}
                  className="w-full px-3 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs rounded-lg min-h-[38px] disabled:opacity-50"
                >
                  {upsertVehiclePrice.isPending ? '...' : 'Save'}
                </button>
              </div>
            </form>

            <div className="border-t border-border pt-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Configured Vehicle Overrides ({activeVehiclePricingSvc.vehicle_prices?.length ?? 0})
              </h3>
              {activeVehiclePricingSvc.vehicle_prices &&
              activeVehiclePricingSvc.vehicle_prices.length > 0 ? (
                <div className="divide-y divide-border max-h-60 overflow-y-auto border border-border rounded-lg">
                  {activeVehiclePricingSvc.vehicle_prices.map((vp) => (
                    <div
                      key={vp.id}
                      className="flex items-center justify-between px-3 py-2.5 bg-background/50"
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <Car className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-semibold text-foreground">
                          {vp.vehicle_make ? `${vp.vehicle_make} ` : ''}
                          {vp.vehicle_model}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-plate font-bold text-sm text-foreground">
                          {formatMoney(vp.price, 'LKR')}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            deleteVehiclePrice.mutate({
                              serviceId: activeVehiclePricingSvc.id,
                              priceId: vp.id,
                            })
                          }
                          disabled={deleteVehiclePrice.isPending}
                          className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                          title="Remove override"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center bg-muted/30 rounded-lg border border-dashed border-border">
                  No vehicle-specific prices configured yet. The base price applies to all vehicles.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
