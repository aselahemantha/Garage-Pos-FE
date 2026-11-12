import React, { useState } from 'react';
import { useCategories, useServices, useCreateCategory, useCreateService } from './api';
import { Wrench, Plus, Clock, X, Loader2, FolderPlus } from 'lucide-react';
import { formatMoney } from '@/lib/format';

export const CatalogPage: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

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

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{s.est_minutes ? `~${s.est_minutes} min` : 'Variable time'}</span>
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
    </div>
  );
};
