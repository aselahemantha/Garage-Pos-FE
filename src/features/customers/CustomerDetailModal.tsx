import React, { useState } from 'react';
import { Vehicle } from './types';
import { useCustomer, useCreateVehicle } from './api';
import { useInvoices } from '@/features/billing/api';
import { InvoiceSummary } from '@/features/billing/types';
import { Plate } from '@/components/ui/Plate';
import { formatMoney, formatDate } from '@/lib/format';
import { Link } from 'react-router-dom';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Car,
  Plus,
  FileText,
  AlertCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface Props {
  customerId: number;
  onClose: () => void;
}

export const CustomerDetailModal: React.FC<Props> = ({ customerId, onClose }) => {
  const { data: customer, isLoading } = useCustomer(customerId);
  const createVehicle = useCreateVehicle();

  // New Vehicle form state
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newMake, setNewMake] = useState('Toyota');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState('2018');
  const [vehicleError, setVehicleError] = useState<string | null>(null);

  // Invoices for this customer
  const { data: invoicesData, isLoading: isLoadingInvoices } = useInvoices(
    undefined,
    customer?.phone
  );

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim() || !newModel.trim()) return;
    setVehicleError(null);

    try {
      await createVehicle.mutateAsync({
        customer_id: customerId,
        plate_no: newPlate.trim().toUpperCase(),
        make: newMake,
        model: newModel.trim(),
        year: newYear ? parseInt(newYear, 10) : undefined,
      });
      setIsAddVehicleOpen(false);
      setNewPlate('');
      setNewModel('');
    } catch (err: unknown) {
      setVehicleError(err instanceof Error ? err.message : 'Failed to add vehicle');
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            Paid
          </span>
        );
      case 'partial':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            Partial
          </span>
        );
      case 'issued':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
            Unpaid
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
            {status}
          </span>
        );
    }
  };

  if (isLoading || !customer) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-card p-8 rounded-2xl border border-border">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }

  const invoices: InvoiceSummary[] = invoicesData?.invoices || [];
  const totalInvoiced = invoices.reduce((sum: number, inv: InvoiceSummary) => sum + inv.total, 0);
  const totalPaid = invoices.reduce((sum: number, inv: InvoiceSummary) => sum + inv.paid_total, 0);
  const totalOutstanding = invoices.reduce((sum: number, inv: InvoiceSummary) => sum + inv.balance, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card w-full max-w-3xl rounded-2xl border border-border shadow-2xl p-6 overflow-y-auto max-h-[90vh] space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-condensed font-bold text-foreground">
                {customer.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                Client #{customer.id}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1.5">
              <div className="flex items-center gap-1.5 text-primary font-semibold">
                <Phone className="w-3.5 h-3.5" />
                <span>{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{customer.address}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Summary KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/30 rounded-xl p-3 border border-border">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Invoiced
            </span>
            <span className="text-xl font-bold font-mono text-foreground mt-0.5 block">
              {formatMoney(totalInvoiced, 'LKR')}
            </span>
          </div>
          <div className="bg-muted/30 rounded-xl p-3 border border-border">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Total Paid
            </span>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {formatMoney(totalPaid, 'LKR')}
            </span>
          </div>
          <div className="bg-muted/30 rounded-xl p-3 border border-border">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Balance Outstanding
            </span>
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5 block">
              {formatMoney(totalOutstanding, 'LKR')}
            </span>
          </div>
        </div>

        {/* Registered Vehicles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                Registered Vehicles ({customer.vehicles?.length || 0})
              </h3>
            </div>
            <button
              onClick={() => setIsAddVehicleOpen(!isAddVehicleOpen)}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vehicle</span>
            </button>
          </div>

          {/* Add Vehicle Inline Drawer */}
          {isAddVehicleOpen && (
            <form
              onSubmit={handleAddVehicle}
              className="p-4 bg-muted/40 rounded-xl border border-border space-y-3 animate-in fade-in"
            >
              <h4 className="font-bold text-xs uppercase text-foreground">Add New Vehicle</h4>
              {vehicleError && (
                <div className="text-xs text-red-500 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{vehicleError}</span>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Plate No. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CAB-1234"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Make
                  </label>
                  <input
                    type="text"
                    required
                    value={newMake}
                    onChange={(e) => setNewMake(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Vezel / Corolla"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleOpen(false)}
                  className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createVehicle.isPending}
                  className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded hover:bg-primary-hover disabled:opacity-50"
                >
                  {createVehicle.isPending ? 'Saving...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          )}

          {customer.vehicles && customer.vehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customer.vehicles.map((v: Vehicle) => (
                <div
                  key={v.id}
                  className="p-3 bg-muted/20 rounded-xl border border-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Plate plate={v.plate_no} size="sm" />
                    <div>
                      <span className="font-bold text-xs text-foreground block">
                        {v.make} {v.model}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {v.year || 'Year N/A'}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/jobs/new`}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    + Job
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2">No vehicles registered yet.</p>
          )}
        </div>

        {/* Invoices & Ledger */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
              Invoices & Billing History ({invoices.length})
            </h3>
          </div>

          {isLoadingInvoices ? (
            <div className="py-6 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : invoices.length > 0 ? (
            <div className="border border-border rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-muted text-muted-foreground font-semibold uppercase tracking-wider text-[10px] border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3">Invoice No</th>
                    <th className="py-2.5 px-3">Vehicle</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((inv: InvoiceSummary) => (
                    <tr key={inv.id} className="hover:bg-muted/20">
                      <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                        {inv.invoice_no}
                      </td>
                      <td className="py-2.5 px-3">
                        {inv.plate_no ? <Plate plate={inv.plate_no} size="sm" /> : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {formatDate(inv.issued_at || inv.created_at).split(',')[0]}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                        {formatMoney(inv.total, 'LKR')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                        {formatMoney(inv.balance, 'LKR')}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {getInvoiceStatusBadge(inv.status)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          to={`/invoices/${inv.id}`}
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2">No invoices issued for this customer.</p>
          )}
        </div>
      </div>
    </div>
  );
};
