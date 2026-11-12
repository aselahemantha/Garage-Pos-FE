import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useJob,
  useUpdateJobStatus,
  useAddJobItem,
  useRemoveJobItem,
  useUpdateJob,
} from './api';
import { useServices } from '@/features/catalog/api';
import { useParts } from '@/features/inventory/api';
import { useIssueInvoice } from '@/features/billing/api';
import { Plate } from '@/components/ui/Plate';
import { formatMoney, formatDate } from '@/lib/format';
import {
  ArrowLeft,
  Clock,
  PlayCircle,
  CheckCircle2,
  Truck,
  Plus,
  Trash2,
  FileCheck2,
  Wrench,
  Boxes,
  User,
  Phone,
  Gauge,
  ClipboardList,
  Edit2,
  X,
  Smartphone,
  Printer,
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: job, isLoading, error } = useJob(id);
  const updateStatusMutation = useUpdateJobStatus();
  const addItemMutation = useAddJobItem(Number(id));
  const removeItemMutation = useRemoveJobItem(Number(id));
  const updateJobMutation = useUpdateJob(Number(id));
  const issueInvoiceMutation = useIssueInvoice();

  const { data: catalogServices } = useServices();
  const { data: inventoryParts } = useParts();

  // Technician / Floor Mode View Toggle
  const [technicianMode, setTechnicianMode] = useState<boolean>(false);

  // Add Item Modal
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [itemTypeTab, setItemTypeTab] = useState<'service' | 'part'>('service');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const [customDescription, setCustomDescription] = useState<string>('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemUnitPrice, setItemUnitPrice] = useState<number>(0);

  // Edit Notes & Complaint Modal
  const [showEditNotesModal, setShowEditNotesModal] = useState<boolean>(false);
  const [editComplaint, setEditComplaint] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editMileage, setEditMileage] = useState<number>(0);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-destructive font-semibold">Job Card not found</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm"
        >
          Back to Job Board
        </button>
      </div>
    );
  }

  const isEditable = job.status === 'pending' || job.status === 'in_progress';

  // Handle Status progression
  const handleStatusAdvance = async (newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: Number(id), status: newStatus });
    } catch (err: any) {
      alert(err.message || 'Failed to update job status');
    }
  };

  // Handle invoice creation & checkout
  const handleInvoiceAndPay = async () => {
    try {
      const inv = await issueInvoiceMutation.mutateAsync({ job_card_id: job.id });
      navigate(`/invoices/${inv.id}`);
    } catch {
      navigate('/invoices');
    }
  };

  const handleOpenEditNotes = () => {
    setEditComplaint(job.complaint || '');
    setEditNotes(job.notes || '');
    setEditMileage(job.mileage_in);
    setShowEditNotesModal(true);
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateJobMutation.mutateAsync({
        complaint: editComplaint,
        notes: editNotes,
        mileage_in: editMileage,
      });
      setShowEditNotesModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update notes');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    let desc = customDescription;
    let price = itemUnitPrice;

    if (itemTypeTab === 'service' && selectedServiceId) {
      const svc = catalogServices?.find((s) => s.id === selectedServiceId);
      if (svc) {
        desc = svc.name;
        price = svc.price;
      }
    } else if (itemTypeTab === 'part' && selectedPartId) {
      const prt = inventoryParts?.find((p) => p.id === selectedPartId);
      if (prt) {
        desc = prt.name;
        price = prt.sell_price;
      }
    }

    if (!desc) {
      alert('Please select or specify a description');
      return;
    }

    try {
      await addItemMutation.mutateAsync({
        item_type: itemTypeTab,
        service_id: selectedServiceId || undefined,
        part_id: selectedPartId || undefined,
        description: desc,
        qty: itemQty,
        unit_price: price,
        discount: 0,
      });

      setShowAddItemModal(false);
      setCustomDescription('');
      setSelectedServiceId(null);
      setSelectedPartId(null);
      setItemQty(1);
    } catch (err: any) {
      alert(err.message || 'Failed to add item');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to remove this item?')) return;
    try {
      await removeItemMutation.mutateAsync(itemId);
    } catch (err: any) {
      alert(err.message || 'Failed to remove item');
    }
  };

  const laborTotal = job.items
    .filter((it) => it.item_type === 'service')
    .reduce((sum, it) => sum + it.line_total, 0);

  const partsTotal = job.items
    .filter((it) => it.item_type === 'part')
    .reduce((sum, it) => sum + it.line_total, 0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation & Status Stepper Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
                {job.job_no}
              </h1>
              <span
                className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${
                  job.status === 'pending'
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                    : job.status === 'in_progress'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                    : job.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : job.status === 'delivered'
                    ? 'bg-slate-500/10 text-slate-500 border border-slate-500/30'
                    : 'bg-destructive/10 text-destructive border border-destructive/30'
                }`}
              >
                {job.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Checked in {formatDate(job.created_at)} by {job.advisor_name || 'Service Advisor'}
            </p>
          </div>
        </div>

        {/* Action Controls & Technician Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* Print Work Order Button */}
          <Link
            to={`/jobs/${job.id}/print`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Print Work Order</span>
          </Link>

          {/* Technician floor mode toggle */}
          <button
            type="button"
            onClick={() => setTechnicianMode(!technicianMode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all shadow-sm ${
              technicianMode
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border bg-card hover:bg-muted text-foreground'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{technicianMode ? 'Floor Mode (Active)' : 'Technician Mode'}</span>
          </button>

          {/* Workflow Transition Buttons */}
          {job.status === 'pending' && (
            <button
              onClick={() => handleStatusAdvance('in_progress')}
              disabled={updateStatusMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start Repair</span>
            </button>
          )}

          {job.status === 'in_progress' && (
            <button
              onClick={() => handleStatusAdvance('completed')}
              disabled={updateStatusMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Repair</span>
            </button>
          )}

          {job.status === 'completed' && (
            <button
              onClick={handleInvoiceAndPay}
              disabled={issueInvoiceMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-colors shadow"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Invoice & Pay</span>
            </button>
          )}

          {job.status === 'delivered' && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              <Truck className="w-3.5 h-3.5" />
              <span>Delivered & Handed Over</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Vehicle & Customer Card (Left) + Tasks/Parts Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: VEHICLE & CUSTOMER DETAILS (4 cols)         */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* Vehicle Card */}
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Vehicle Card
              </span>
              <Link to={`/vehicles/${job.vehicle_id}`} title="View Vehicle History">
                <Plate plate={job.plate_no} size="md" />
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model:</span>
                <span className="font-bold text-foreground">
                  {job.vehicle_make} {job.vehicle_model} {job.vehicle_year || ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-in Mileage:</span>
                <span className="font-mono font-bold text-foreground flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
                  {job.mileage_in.toLocaleString()} km
                </span>
              </div>
              {job.promised_by && (
                <div className="flex justify-between pt-1 border-t border-border/60">
                  <span className="text-muted-foreground">Promised By:</span>
                  <span className="font-medium text-foreground flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-amber-500" />
                    {formatDate(job.promised_by)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Card */}
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block pb-2 border-b border-border">
              Customer Info
            </span>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-foreground text-sm">{job.customer_name}</p>
                <a
                  href={`tel:${job.customer_phone}`}
                  className="text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{job.customer_phone}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Customer Complaint & Notes Card */}
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-primary" />
                <span>Job Instructions</span>
              </span>
              {isEditable && (
                <button
                  type="button"
                  onClick={handleOpenEditNotes}
                  className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground font-semibold block text-[11px]">
                  Driver Reported Complaint:
                </span>
                <p className="text-foreground mt-0.5 leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/60">
                  {job.complaint || 'Standard periodic maintenance'}
                </p>
              </div>

              {job.notes && (
                <div>
                  <span className="text-muted-foreground font-semibold block text-[11px]">
                    Internal Workshop Notes:
                  </span>
                  <p className="text-foreground mt-0.5 leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/60">
                    {job.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: REPAIR ITEMS & PARTS LIST (8 cols)         */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Table Header with Add Item button */}
            <div className="p-4 border-b border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-sm text-foreground uppercase tracking-wider">
                  Repair Operations & Parts ({job.items.length})
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Assigned labor operations and deducted inventory parts
                </p>
              </div>

              {isEditable && (
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Service / Part</span>
                </button>
              )}
            </div>

            {/* Technician Touch Checklist Mode */}
            {technicianMode ? (
              <div className="p-4 space-y-3">
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary font-semibold flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Floor Technician Mode: Tap checklist items as operations are completed.</span>
                </div>

                <div className="space-y-2">
                  {job.items.map((it, idx) => (
                    <div
                      key={it.id}
                      className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-base font-bold text-foreground">
                            {it.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                it.item_type === 'service'
                                  ? 'bg-blue-500/10 text-blue-600'
                                  : 'bg-emerald-500/10 text-emerald-600'
                              }`}
                            >
                              {it.item_type}
                            </span>
                            <span>Qty: {it.qty}</span>
                            {it.mechanic_name && (
                              <span className="font-semibold text-foreground">
                                Tech: {it.mechanic_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-foreground">
                          {formatMoney(it.line_total, 'LKR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Standard Table View */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground uppercase font-semibold">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Item & Description</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3 text-right">Qty</th>
                      <th className="py-3 px-3 text-right">Unit Price</th>
                      <th className="py-3 px-4 text-right">Line Total</th>
                      {isEditable && <th className="py-3 px-4 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {job.items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={isEditable ? 7 : 6}
                          className="py-8 text-center text-muted-foreground italic"
                        >
                          No items added yet. Click "+ Add Service / Part" to record work.
                        </td>
                      </tr>
                    ) : (
                      job.items.map((it, idx) => (
                        <tr key={it.id} className="hover:bg-muted/30">
                          <td className="py-3.5 px-4 font-mono text-muted-foreground">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-foreground block">
                              {it.description}
                            </span>
                            {it.mechanic_name && (
                              <span className="text-[11px] text-muted-foreground">
                                Mechanic: {it.mechanic_name}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                it.item_type === 'service'
                                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {it.item_type}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-foreground">
                            {it.qty}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-foreground">
                            {formatMoney(it.unit_price, 'LKR')}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                            {formatMoney(it.line_total, 'LKR')}
                          </td>
                          {isEditable && (
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(it.id)}
                                className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                                title="Remove Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Financial Estimates Footer */}
            <div className="p-5 border-t border-border bg-muted/10 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Labor Subtotal:</span>
                <span className="font-mono font-semibold text-foreground">
                  {formatMoney(laborTotal, 'LKR')}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Parts & Consumables Subtotal:</span>
                <span className="font-mono font-semibold text-foreground">
                  {formatMoney(partsTotal, 'LKR')}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                <span className="text-foreground">Estimated Repair Total:</span>
                <span className="font-mono text-primary font-black text-lg">
                  {formatMoney(job.total_minor, 'LKR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">Add Repair Item / Part</h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
                <button
                  type="button"
                  onClick={() => setItemTypeTab('service')}
                  className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    itemTypeTab === 'service'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Labor Service</span>
                </button>
                <button
                  type="button"
                  onClick={() => setItemTypeTab('part')}
                  className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    itemTypeTab === 'part'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Spare Part</span>
                </button>
              </div>

              {/* Picker based on Tab */}
              {itemTypeTab === 'service' ? (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Select Catalog Service
                  </label>
                  <select
                    value={selectedServiceId || ''}
                    onChange={(e) => {
                      const sId = Number(e.target.value);
                      setSelectedServiceId(sId);
                      const s = catalogServices?.find((x) => x.id === sId);
                      if (s) setItemUnitPrice(s.price);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">-- Choose from Catalog --</option>
                    {catalogServices?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({formatMoney(s.price, 'LKR')})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Select Inventory Part
                  </label>
                  <select
                    value={selectedPartId || ''}
                    onChange={(e) => {
                      const pId = Number(e.target.value);
                      setSelectedPartId(pId);
                      const p = inventoryParts?.find((x) => x.id === pId);
                      if (p) setItemUnitPrice(p.sell_price);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">-- Choose from Parts Ledger --</option>
                    {inventoryParts?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) · {formatMoney(p.sell_price, 'LKR')} · On-hand:{' '}
                        {p.stock_on_hand}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Description Override */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Custom Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Additional bracket tightening..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Quantity & Unit Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={itemQty}
                    onChange={(e) => setItemQty(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Price (LKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={(itemUnitPrice / 100).toFixed(2)}
                    onChange={(e) =>
                      setItemUnitPrice(Math.round(parseFloat(e.target.value || '0') * 100))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addItemMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-colors shadow-md disabled:opacity-50"
                >
                  {addItemMutation.isPending ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Notes & Mileage Modal */}
      {showEditNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-bold text-foreground">Edit Job Instructions</h3>
              <button
                onClick={() => setShowEditNotesModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotes} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Customer Reported Complaint
                </label>
                <textarea
                  rows={2}
                  value={editComplaint}
                  onChange={(e) => setEditComplaint(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Internal Workshop Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Check-in Mileage (km)
                </label>
                <input
                  type="number"
                  value={editMileage}
                  onChange={(e) => setEditMileage(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditNotesModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateJobMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-colors shadow-md disabled:opacity-50"
                >
                  {updateJobMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
