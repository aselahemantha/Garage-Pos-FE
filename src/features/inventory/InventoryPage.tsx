import React, { useState } from 'react';
import { useParts, useStockIn, useCreatePart } from './api';
import {
  Search,
  Plus,
  ArrowDownToLine,
  AlertTriangle,
  Loader2,
  X,
  Package,
} from 'lucide-react';
import { formatMoney } from '@/lib/format';

export const InventoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isNewPartOpen, setIsNewPartOpen] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);

  // Stock In Form
  const [stockQty, setStockQty] = useState('');
  const [stockUnitCost, setStockUnitCost] = useState('');
  const [stockNote, setStockNote] = useState('');

  // New Part Form
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Filters');
  const [newUnit, setNewUnit] = useState('each');
  const [newCost, setNewCost] = useState('');
  const [newSell, setNewSell] = useState('');
  const [newReorder, setNewReorder] = useState('4');

  const { data: parts, isLoading } = useParts(searchTerm, selectedCategory);
  const stockInMutation = useStockIn();
  const createPartMutation = useCreatePart();

  const categories = ['Oils and fluids', 'Filters', 'Brakes', 'Other'];

  // Low stock calculation
  const lowStockParts = parts?.filter((p) => p.stock_on_hand <= p.reorder_level) || [];

  const displayedParts = parts?.filter((p) => {
    if (lowStockOnly) {
      return p.stock_on_hand <= p.reorder_level;
    }
    return true;
  });

  const totalStockValue =
    parts?.reduce((sum, p) => sum + p.cost_price * p.stock_on_hand, 0) || 0;

  const handleStockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId || !stockQty || !stockUnitCost) return;

    try {
      await stockInMutation.mutateAsync({
        part_id: selectedPartId,
        qty: parseFloat(stockQty),
        unit_cost: Math.round(parseFloat(stockUnitCost) * 100),
        note: stockNote || undefined,
      });
      setIsStockInOpen(false);
      setStockQty('');
      setStockUnitCost('');
      setStockNote('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to receive stock');
    }
  };

  const handleCreatePartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku || !newName || !newCost || !newSell) return;

    try {
      await createPartMutation.mutateAsync({
        sku: newSku,
        name: newName,
        category: newCat,
        unit: newUnit,
        cost_price: Math.round(parseFloat(newCost) * 100),
        sell_price: Math.round(parseFloat(newSell) * 100),
        reorder_level: parseFloat(newReorder || '0'),
      });
      setIsNewPartOpen(false);
      setNewSku('');
      setNewName('');
      setNewCost('');
      setNewSell('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create part');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-condensed font-bold tracking-tight text-foreground">
            Inventory
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {parts ? `${parts.length} parts · stock value ${formatMoney(totalStockValue, 'LKR')}` : 'Loading...'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewPartOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-muted-foreground" />
            <span>New part</span>
          </button>

          <button
            onClick={() => {
              if (parts && parts.length > 0) setSelectedPartId(parts[0].id);
              setIsStockInOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 py-2.5 rounded-lg shadow-sm text-xs min-h-[44px]"
          >
            <ArrowDownToLine className="w-4 h-4 stroke-[2.5]" />
            <span>Receive stock</span>
          </button>
        </div>
      </div>

      {/* Low stock alert banner (matching Page 9) */}
      {lowStockParts.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong className="font-bold">{lowStockParts.length} parts need reordering: </strong>
              {lowStockParts.map((p) => p.name).slice(0, 3).join(', ')} are at or below reorder level.
            </span>
          </div>
          <button
            onClick={() => setLowStockOnly(true)}
            className="px-3 py-1.5 rounded-md font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 min-h-[32px] transition-colors"
          >
            Filter low stock
          </button>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Part name, SKU or barcode"
            className="w-full pl-9 pr-4 py-2 text-xs bg-card border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none min-h-[38px]"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedCategory(undefined);
              setLowStockOnly(false);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[32px] ${
              selectedCategory === undefined && !lowStockOnly
                ? 'bg-foreground text-background font-bold'
                : 'bg-card text-foreground border border-border hover:bg-muted'
            }`}
          >
            All
          </button>

          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                setSelectedCategory(c);
                setLowStockOnly(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[32px] ${
                selectedCategory === c
                  ? 'bg-foreground text-background font-bold'
                  : 'bg-card text-foreground border border-border hover:bg-muted'
              }`}
            >
              {c}
            </button>
          ))}

          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[32px] ${
              lowStockOnly
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-card text-amber-700 dark:text-amber-400 border border-border hover:bg-muted'
            }`}
          >
            Low stock only · {lowStockParts.length}
          </button>
        </div>
      </div>

      {/* Parts Table */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : displayedParts && displayedParts.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted text-muted-foreground font-semibold uppercase tracking-wider text-[11px] border-b border-border">
                <tr>
                  <th className="py-3 px-4">Part</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">On Hand</th>
                  <th className="py-3 px-4 text-right">Reorder At</th>
                  <th className="py-3 px-4 text-right">Cost</th>
                  <th className="py-3 px-4 text-right">Sell</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayedParts.map((p) => {
                  const isOut = p.stock_on_hand <= 0;
                  const isLow = !isOut && p.stock_on_hand <= p.reorder_level;

                  return (
                    <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground text-sm">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{p.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{p.category || 'General'}</td>
                      <td className="py-3 px-4 text-right font-bold text-foreground">
                        {p.stock_on_hand} <span className="font-normal text-muted-foreground">{p.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {p.reorder_level}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {formatMoney(p.cost_price, 'LKR')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                        {formatMoney(p.sell_price, 'LKR')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-destructive border border-red-500/20">
                            Out of stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            Low
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            In stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedPartId(p.id);
                            setIsStockInOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded border border-border bg-card hover:bg-muted transition-colors"
                        >
                          + Add Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-card rounded-xl border border-border">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-lg text-foreground">No parts found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Add inventory parts to track stock and add them directly to job cards.
          </p>
        </div>
      )}

      {/* Stock In Modal */}
      {isStockInOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-modal p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <h2 className="text-xl font-condensed font-bold text-foreground">Receive Stock</h2>
              <button
                onClick={() => setIsStockInOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Select Part</label>
                <select
                  value={selectedPartId || ''}
                  onChange={(e) => setSelectedPartId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                >
                  {parts?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — on hand: {p.stock_on_hand}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Quantity In *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Unit Cost (LKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={stockUnitCost}
                    onChange={(e) => setStockUnitCost(e.target.value)}
                    placeholder="e.g. 1200"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Note (Optional)</label>
                <input
                  type="text"
                  value={stockNote}
                  onChange={(e) => setStockNote(e.target.value)}
                  placeholder="e.g. Invoice #WAS-20931"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsStockInOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={stockInMutation.isPending}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs rounded-lg min-h-[40px] shadow-sm disabled:opacity-50"
                >
                  {stockInMutation.isPending ? 'Saving...' : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Part Modal (matching Page 11) */}
      {isNewPartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-modal p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <h2 className="text-xl font-condensed font-bold text-foreground">New Part</h2>
              <button
                onClick={() => setIsNewPartOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Part Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Air Filter (Honda Vezel)"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    SKU / Part No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value.toUpperCase())}
                    placeholder="FLT-AIR-HV"
                    className="w-full px-3 py-2 text-sm uppercase font-mono bg-background border border-border rounded-lg min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Category</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                  >
                    <option value="Filters">Filters</option>
                    <option value="Brakes">Brakes</option>
                    <option value="Oils and fluids">Oils and fluids</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  How is it counted?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['each', 'set', 'can', 'litre'].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setNewUnit(u)}
                      className={`py-2 px-3 text-xs font-semibold capitalize rounded-lg border transition-colors ${
                        newUnit === u
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Cost Price (LKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    placeholder="2900"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Selling Price (LKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newSell}
                    onChange={(e) => setNewSell(e.target.value)}
                    placeholder="3600"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Reorder Level Alert Threshold
                </label>
                <input
                  type="number"
                  value={newReorder}
                  onChange={(e) => setNewReorder(e.target.value)}
                  placeholder="3"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsNewPartOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPartMutation.isPending}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs rounded-lg min-h-[40px] shadow-sm disabled:opacity-50"
                >
                  {createPartMutation.isPending ? 'Saving...' : 'Save Part'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
