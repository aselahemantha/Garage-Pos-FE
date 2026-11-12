import React, { useState } from 'react';
import {
  useParts,
  useStockIn,
  useCreatePart,
  useUpdatePart,
  useAdjustStock,
  useBatchRestock,
  useLowStockReport,
} from './api';
import { Part, BatchReorderItem } from './types';
import {
  Search,
  Plus,
  ArrowDownToLine,
  AlertTriangle,
  Loader2,
  X,
  Package,
  ShoppingCart,
  Download,
  Sliders,
  Edit2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatMoney } from '@/lib/format';

export const InventoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isNewPartOpen, setIsNewPartOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [adjustingPart, setAdjustingPart] = useState<Part | null>(null);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
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

  // Edit Part Form
  const [editName, setEditName] = useState('');
  const [editCat, setEditCat] = useState('');
  const [editUnit, setEditUnit] = useState('each');
  const [editCost, setEditCost] = useState('');
  const [editSell, setEditSell] = useState('');
  const [editReorder, setEditReorder] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // Audit Adjustment Form
  const [adjustPhysicalCount, setAdjustPhysicalCount] = useState('');
  const [adjustReason, setAdjustReason] = useState('Physical audit recount');

  // Batch Reorder Form
  const [reorderSupplier, setReorderSupplier] = useState('');
  const [reorderInvoiceRef, setReorderInvoiceRef] = useState('');
  const [reorderItems, setReorderItems] = useState<BatchReorderItem[]>([]);
  const [reorderSuccess, setReorderSuccess] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const { data: parts, isLoading } = useParts(searchTerm, selectedCategory);
  const { data: lowStockSummary } = useLowStockReport();
  const stockInMutation = useStockIn();
  const createPartMutation = useCreatePart();
  const updatePartMutation = useUpdatePart();
  const adjustStockMutation = useAdjustStock();
  const batchRestockMutation = useBatchRestock();

  const categories = ['Oils and fluids', 'Filters', 'Brakes', 'Other'];

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

  const handleOpenEditModal = (p: Part) => {
    setEditingPart(p);
    setEditName(p.name);
    setEditCat(p.category || 'Other');
    setEditUnit(p.unit);
    setEditCost((p.cost_price / 100).toString());
    setEditSell((p.sell_price / 100).toString());
    setEditReorder(p.reorder_level.toString());
    setEditIsActive(p.is_active);
    setModalError(null);
  };

  const handleUpdatePartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPart) return;
    setModalError(null);

    try {
      await updatePartMutation.mutateAsync({
        id: editingPart.id,
        input: {
          name: editName.trim(),
          category: editCat,
          unit: editUnit,
          cost_price: Math.round(parseFloat(editCost) * 100),
          sell_price: Math.round(parseFloat(editSell) * 100),
          reorder_level: parseFloat(editReorder || '0'),
          is_active: editIsActive,
        },
      });
      setEditingPart(null);
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to update part');
    }
  };

  const handleOpenAdjustModal = (p: Part) => {
    setAdjustingPart(p);
    setAdjustPhysicalCount(p.stock_on_hand.toString());
    setAdjustReason('Physical audit recount');
    setModalError(null);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingPart) return;
    setModalError(null);

    try {
      await adjustStockMutation.mutateAsync({
        part_id: adjustingPart.id,
        input: {
          new_stock_on_hand: parseFloat(adjustPhysicalCount),
          reason: adjustReason.trim(),
        },
      });
      setAdjustingPart(null);
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to adjust stock');
    }
  };

  const handleOpenReorderModal = () => {
    if (!lowStockSummary || lowStockSummary.items.length === 0) return;
    const initialItems: BatchReorderItem[] = lowStockSummary.items.map((item) => ({
      part_id: item.part.id,
      qty: item.suggested_reorder_qty,
      unit_cost: item.part.cost_price,
      note: `Deficit: ${item.deficit}`,
    }));
    setReorderItems(initialItems);
    setReorderSupplier('');
    setReorderInvoiceRef('');
    setReorderSuccess(false);
    setModalError(null);
    setIsReorderModalOpen(true);
  };

  const handleReorderQtyChange = (partId: number, qty: number) => {
    setReorderItems((prev) =>
      prev.map((item) => (item.part_id === partId ? { ...item, qty: Math.max(0, qty) } : item))
    );
  };

  const handleReorderCostChange = (partId: number, unitCostCents: number) => {
    setReorderItems((prev) =>
      prev.map((item) => (item.part_id === partId ? { ...item, unit_cost: Math.max(0, unitCostCents) } : item))
    );
  };

  const totalReorderEstimate = reorderItems.reduce(
    (sum, item) => sum + item.qty * item.unit_cost,
    0
  );

  const handleBatchRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeItems = reorderItems.filter((i) => i.qty > 0);
    if (activeItems.length === 0) {
      setModalError('Please specify quantity greater than 0 for at least one item');
      return;
    }

    try {
      await batchRestockMutation.mutateAsync({
        items: activeItems,
        supplier_name: reorderSupplier.trim() || undefined,
        invoice_ref: reorderInvoiceRef.trim() || undefined,
      });
      setReorderSuccess(true);
      setTimeout(() => {
        setIsReorderModalOpen(false);
        setReorderSuccess(false);
      }, 1500);
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to restock parts');
    }
  };

  const handleExportCSV = () => {
    if (!lowStockSummary || lowStockSummary.items.length === 0) return;

    const rows = [
      ['SKU', 'Part Name', 'Category', 'Unit', 'Stock On Hand', 'Reorder Level', 'Deficit', 'Suggested Order Qty', 'Unit Cost (LKR)', 'Line Total (LKR)'],
      ...lowStockSummary.items.map((item) => [
        item.part.sku,
        `"${item.part.name}"`,
        item.part.category || 'General',
        item.part.unit,
        item.part.stock_on_hand,
        item.part.reorder_level,
        item.deficit,
        item.suggested_reorder_qty,
        (item.part.cost_price / 100).toFixed(2),
        ((item.suggested_reorder_qty * item.part.cost_price) / 100).toFixed(2),
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `low_stock_reorder_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-condensed font-bold tracking-tight text-foreground">
            Inventory & Stock Ledger
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {parts ? `${parts.length} parts · total stock value ${formatMoney(totalStockValue, 'LKR')}` : 'Loading...'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {lowStockParts.length > 0 && (
            <button
              onClick={handleOpenReorderModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-300 min-h-[44px] transition-colors"
            >
              <ShoppingCart className="w-4 h-4 text-amber-600" />
              <span>Purchase Order ({lowStockParts.length})</span>
            </button>
          )}

          <button
            onClick={() => setIsNewPartOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-muted-foreground" />
            <span>New Part</span>
          </button>

          <button
            onClick={() => {
              if (parts && parts.length > 0) setSelectedPartId(parts[0].id);
              setIsStockInOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 py-2.5 rounded-lg shadow-sm text-xs min-h-[44px]"
          >
            <ArrowDownToLine className="w-4 h-4 stroke-[2.5]" />
            <span>Receive Stock</span>
          </button>
        </div>
      </div>

      {/* Low stock alert banner */}
      {lowStockParts.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="font-bold text-sm">
                {lowStockParts.length} parts need replenishment
              </div>
              <div className="text-muted-foreground text-[11px] mt-0.5">
                Estimated restocking cost: <strong className="font-bold text-foreground">{formatMoney(lowStockSummary?.total_estimated_cost || 0, 'LKR')}</strong> ({lowStockSummary?.out_of_stock_count || 0} out of stock, {lowStockSummary?.low_stock_count || 0} low)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted font-semibold text-foreground text-xs min-h-[34px] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleOpenReorderModal}
              className="px-3.5 py-1.5 rounded-lg font-bold bg-amber-600 hover:bg-amber-700 text-white min-h-[34px] transition-colors shadow-sm"
            >
              Generate Order
            </button>
          </div>
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
            placeholder="Search part name, SKU or barcode..."
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
                  <th className="py-3 px-4 text-right">Cost Price</th>
                  <th className="py-3 px-4 text-right">Sell Price</th>
                  <th className="py-3 px-4 text-center">Stock Level</th>
                  <th className="py-3 px-4 text-right">Actions</th>
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
                      <td className="py-3 px-4 text-right text-muted-foreground font-medium">
                        {p.reorder_level} {p.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {formatMoney(p.cost_price, 'LKR')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                        {formatMoney(p.sell_price, 'LKR')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOut ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-destructive border border-red-500/20">
                            Out of stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            Low stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            In stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedPartId(p.id);
                              setIsStockInOpen(true);
                            }}
                            title="Receive Stock"
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted transition-colors min-h-[30px]"
                          >
                            + Stock
                          </button>
                          <button
                            onClick={() => handleOpenAdjustModal(p)}
                            title="Audit Stock Count"
                            className="p-1.5 text-xs rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[30px] min-w-[30px] flex items-center justify-center"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            title="Edit Part Details"
                            className="p-1.5 text-xs rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[30px] min-w-[30px] flex items-center justify-center"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <h3 className="font-bold text-lg text-foreground">No parts found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Add inventory parts to track stock and add them directly to job cards.
          </p>
        </div>
      )}

      {/* Stock In Modal */}
      {isStockInOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h2 className="text-xl font-condensed font-bold text-foreground">Receive Stock</h2>
                <p className="text-xs text-muted-foreground">Record incoming inventory from supplier</p>
              </div>
              <button
                onClick={() => setIsStockInOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Select Part *</label>
                <select
                  value={selectedPartId || ''}
                  onChange={(e) => setSelectedPartId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[40px]"
                >
                  {parts?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — on hand: {p.stock_on_hand} {p.unit}
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
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[40px]"
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
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[40px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Supplier / Note</label>
                <input
                  type="text"
                  value={stockNote}
                  onChange={(e) => setStockNote(e.target.value)}
                  placeholder="e.g. Invoice #WAS-20931"
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[40px]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsStockInOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg min-h-[40px]"
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

      {/* New Part Modal */}
      {isNewPartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h2 className="text-xl font-condensed font-bold text-foreground">New Inventory Part</h2>
                <p className="text-xs text-muted-foreground">Add a new item to the garage catalog</p>
              </div>
              <button
                onClick={() => setIsNewPartOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
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
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[40px]"
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
                    className="w-full px-3 py-2 text-xs uppercase font-mono bg-background border border-border rounded-lg min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Category</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[40px]"
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
                  Counting Unit
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
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[40px]"
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
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[40px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Low Stock Reorder Threshold
                </label>
                <input
                  type="number"
                  value={newReorder}
                  onChange={(e) => setNewReorder(e.target.value)}
                  placeholder="4"
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[40px]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsNewPartOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg min-h-[40px]"
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

      {/* Edit Part Modal */}
      {editingPart && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h2 className="text-xl font-condensed font-bold text-foreground">Edit Part</h2>
                <p className="text-xs text-muted-foreground font-mono">{editingPart.sku}</p>
              </div>
              <button
                onClick={() => setEditingPart(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePartSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Part Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[40px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Category</label>
                  <select
                    value={editCat}
                    onChange={(e) => setEditCat(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[40px]"
                  >
                    <option value="Filters">Filters</option>
                    <option value="Brakes">Brakes</option>
                    <option value="Oils and fluids">Oils and fluids</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Counting Unit</label>
                  <input
                    type="text"
                    required
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[40px]"
                  />
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
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[40px]"
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
                    value={editSell}
                    onChange={(e) => setEditSell(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[40px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Reorder Threshold
                  </label>
                  <input
                    type="number"
                    value={editReorder}
                    onChange={(e) => setEditReorder(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Status</label>
                  <button
                    type="button"
                    onClick={() => setEditIsActive(!editIsActive)}
                    className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold border transition-colors min-h-[40px] ${
                      editIsActive
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                  >
                    {editIsActive ? 'Active Part' : 'Inactive'}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingPart(null)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatePartMutation.isPending}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs rounded-lg min-h-[40px] shadow-sm disabled:opacity-50"
                >
                  {updatePartMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Adjustment Modal */}
      {adjustingPart && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h2 className="text-xl font-condensed font-bold text-foreground">Stock Audit Count</h2>
                <p className="text-xs text-muted-foreground">{adjustingPart.name} ({adjustingPart.sku})</p>
              </div>
              <button
                onClick={() => setAdjustingPart(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Current system balance:</span>
                <span className="font-bold text-foreground">
                  {adjustingPart.stock_on_hand} {adjustingPart.unit}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Actual Physical Count On Hand *
                </label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={adjustPhysicalCount}
                  onChange={(e) => setAdjustPhysicalCount(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Reason for Adjustment *
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Month-end inventory recount / Damaged stock"
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[40px]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAdjustingPart(null)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustStockMutation.isPending}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs rounded-lg min-h-[40px] shadow-sm disabled:opacity-50"
                >
                  {adjustStockMutation.isPending ? 'Updating...' : 'Confirm Count'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Purchase Order Modal */}
      {isReorderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl p-6 overflow-y-auto max-h-[90vh] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-amber-600" />
                  <h2 className="text-xl font-condensed font-bold text-foreground">
                    Restock Purchase Order
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Bulk order and receive parts below reorder threshold
                </p>
              </div>
              <button
                onClick={() => setIsReorderModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reorderSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Purchase order received! Stock levels updated.</span>
              </div>
            )}

            {modalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleBatchRestockSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Supplier / Vendor Name
                  </label>
                  <input
                    type="text"
                    value={reorderSupplier}
                    onChange={(e) => setReorderSupplier(e.target.value)}
                    placeholder="e.g. Associated Motorways / AutoMiraj Parts"
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[38px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Supplier Invoice / Bill No.
                  </label>
                  <input
                    type="text"
                    value={reorderInvoiceRef}
                    onChange={(e) => setReorderInvoiceRef(e.target.value)}
                    placeholder="e.g. INV-2026-904"
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[38px]"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-muted text-muted-foreground font-semibold uppercase tracking-wider text-[10px] border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3">Part</th>
                      <th className="py-2.5 px-3 text-center">On Hand / Target</th>
                      <th className="py-2.5 px-3 w-28 text-right">Order Qty</th>
                      <th className="py-2.5 px-3 w-32 text-right">Unit Cost (LKR)</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lowStockSummary?.items.map((item) => {
                      const currentItem = reorderItems.find((i) => i.part_id === item.part.id);
                      const qty = currentItem?.qty || 0;
                      const unitCost = currentItem?.unit_cost || item.part.cost_price;
                      const lineTotal = qty * unitCost;

                      return (
                        <tr key={item.part.id} className="hover:bg-muted/20">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-foreground">{item.part.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{item.part.sku}</div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                              {item.part.stock_on_hand}
                            </span>
                            <span className="text-muted-foreground"> / {item.part.reorder_level * 2}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <input
                              type="number"
                              step="0.001"
                              min="0"
                              value={qty}
                              onChange={(e) => handleReorderQtyChange(item.part.id, parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 text-right text-xs bg-background border border-border rounded font-bold"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={(unitCost / 100).toFixed(2)}
                              onChange={(e) =>
                                handleReorderCostChange(item.part.id, Math.round(parseFloat(e.target.value || '0') * 100))
                              }
                              className="w-28 px-2 py-1 text-right text-xs bg-background border border-border rounded font-mono"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                            {formatMoney(lineTotal, 'LKR')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Total Summary Footer */}
              <div className="p-3 bg-muted/30 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Estimated Order Value
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Stock movements will be logged and inventory updated immediately upon receipt
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-primary">
                    {formatMoney(totalReorderEstimate, 'LKR')}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsReorderModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg min-h-[38px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={batchRestockMutation.isPending || reorderSuccess}
                  className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-5 py-2 text-xs rounded-lg min-h-[38px] transition-colors disabled:opacity-50"
                >
                  {batchRestockMutation.isPending ? 'Processing...' : 'Receive Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
