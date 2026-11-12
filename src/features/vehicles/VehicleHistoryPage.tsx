import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useVehicleHistory } from './api';
import { Plate } from '@/components/ui/Plate';
import { formatMoney, formatDate } from '@/lib/format';
import {
  ArrowLeft,
  Car,
  Wrench,
  Gauge,
  User,
  Phone,
  FileText,
  ExternalLink,
  Printer,
  Plus,
  Loader2,
  TrendingUp,
} from 'lucide-react';

export const VehicleHistoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: history, isLoading, error } = useVehicleHistory(id);
  const [activeTab, setActiveTab] = useState<'jobs' | 'invoices' | 'mileage'>('jobs');

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !history) {
    return (
      <div className="p-12 text-center bg-card rounded-2xl border border-border">
        <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
        <h2 className="text-xl font-bold text-foreground">Vehicle Not Found</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Unable to locate the vehicle service record.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const vehicle = history.vehicle;
  const customer = history.customer;
  const jobs = history.jobs || [];
  const invoices = history.invoices || [];

  const totalSpent = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const latestMileage = vehicle?.last_mileage || (jobs[0]?.mileage_in ?? 0);
  const nextServiceMileage = latestMileage > 0 ? latestMileage + 5000 : null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
            In Progress
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
            Pending
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20">
            Delivered
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <Plate plate={vehicle.plate_no} size="md" />
              <h1 className="text-2xl font-condensed font-bold tracking-tight text-foreground">
                {vehicle.make} {vehicle.model} {vehicle.year || ''}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Vehicle Master Lifecycle Ledger & Workshop Service History
            </p>
          </div>
        </div>

        <Link
          to={`/jobs/new`}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 py-2.5 rounded-lg text-xs shadow-sm transition-colors min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>New Job Card</span>
        </Link>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Workshop Visits
          </span>
          <span className="text-2xl font-bold font-condensed text-foreground mt-1 block">
            {jobs.length} visits
          </span>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Last Recorded Mileage
          </span>
          <span className="text-2xl font-bold font-condensed font-mono text-foreground mt-1 block">
            {latestMileage ? `${latestMileage.toLocaleString()} km` : 'N/A'}
          </span>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Lifetime Maintenance
          </span>
          <span className="text-2xl font-bold font-condensed font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatMoney(totalSpent, 'LKR')}
          </span>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            Next Service Due
          </span>
          <span className="text-2xl font-bold font-condensed font-mono text-amber-600 dark:text-amber-400 mt-1 block">
            {nextServiceMileage ? `~${nextServiceMileage.toLocaleString()} km` : 'In 5,000 km'}
          </span>
        </div>
      </div>

      {/* Vehicle Specification & Owner Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Specs */}
        <div className="md:col-span-2 bg-card rounded-xl border border-border p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Car className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
              Vehicle Profile
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">License Plate:</span>
              <strong className="font-mono text-foreground">{vehicle.plate_no}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Make & Model:</span>
              <strong className="text-foreground">{vehicle.make} {vehicle.model}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Manufacture Year:</span>
              <strong className="text-foreground">{vehicle.year || 'Not specified'}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Color:</span>
              <strong className="text-foreground">{vehicle.color || 'Standard'}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Fuel / Powertrain:</span>
              <strong className="text-foreground">{vehicle.fuel_type || 'Petrol / Hybrid'}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">VIN / Chassis No:</span>
              <strong className="font-mono text-foreground text-[11px]">
                {vehicle.vin || 'VIN-UNSPECIFIED'}
              </strong>
            </div>
          </div>
        </div>

        {/* Registered Owner Card */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <User className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
              Vehicle Owner
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Customer Name:</span>
              <span className="font-bold text-foreground text-sm">{customer.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Phone:</span>
              <a
                href={`tel:${customer.phone}`}
                className="font-semibold text-primary hover:underline flex items-center gap-1 mt-0.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{customer.phone}</span>
              </a>
            </div>
            {customer.address && (
              <div>
                <span className="text-muted-foreground block text-[11px]">Address:</span>
                <span className="text-foreground">{customer.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'jobs'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Service & Repair History ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'invoices'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Invoices & Billing ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mileage')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'mileage'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>Mileage Progression</span>
        </button>
      </div>

      {/* Tab 1: Service & Repair History */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="p-12 text-center bg-card rounded-xl border border-border">
              <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-sm text-foreground">No service records yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Open a new job card when this vehicle arrives for maintenance.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-card rounded-xl border border-border p-5 shadow-soft space-y-4 hover:border-primary/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="font-mono font-bold text-base text-foreground">
                        {job.job_no}
                      </div>
                      {getStatusBadge(job.status)}
                      <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5" />
                        {job.mileage_in.toLocaleString()} km
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(job.created_at)}
                      </span>
                      <Link
                        to={`/jobs/${job.id}/print`}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground p-1.5 rounded-lg border border-border hover:bg-muted"
                        title="Print Work Order"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/jobs/${job.id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                      >
                        <span>View Job</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Complaint & Advisor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px] font-semibold">
                        Customer Complaint / Reason:
                      </span>
                      <p className="text-foreground mt-0.5">
                        {job.complaint || 'Regular maintenance inspection and fluid check'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px] font-semibold">
                        Service Advisor:
                      </span>
                      <p className="text-foreground mt-0.5">{job.advisor_name}</p>
                    </div>
                  </div>

                  {/* Items Installed / Labor Done */}
                  {job.items && job.items.length > 0 && (
                    <div className="border border-border/80 rounded-lg overflow-hidden text-xs">
                      <div className="bg-muted/50 px-3 py-1.5 font-bold uppercase text-[10px] text-muted-foreground">
                        Operations & Replaced Parts ({job.items.length})
                      </div>
                      <div className="divide-y divide-border/60">
                        {job.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 flex items-center justify-between text-xs hover:bg-muted/20"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                                  item.item_type === 'service'
                                    ? 'bg-blue-500/10 text-blue-600'
                                    : 'bg-amber-500/10 text-amber-600'
                                }`}
                              >
                                {item.item_type}
                              </span>
                              <span className="font-medium text-foreground">
                                {item.description}
                              </span>
                              {item.qty > 1 && (
                                <span className="text-muted-foreground font-mono">
                                  × {item.qty}
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-bold text-foreground">
                              {formatMoney(item.line_total, 'LKR')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Job Total */}
                  <div className="flex justify-end pt-1">
                    <div className="text-right">
                      <span className="text-[11px] text-muted-foreground mr-2">Total Service Cost:</span>
                      <span className="font-mono font-bold text-sm text-foreground">
                        {formatMoney(job.total_amount, 'LKR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Invoices & Billing */}
      {activeTab === 'invoices' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-soft">
          {invoices.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-sm">No invoices recorded for this vehicle</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-muted text-muted-foreground font-semibold uppercase tracking-wider text-[11px] border-b border-border">
                <tr>
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {inv.invoice_no}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDate(inv.issued_at)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                      {formatMoney(inv.total, 'LKR')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                      {formatMoney(inv.paid_total, 'LKR')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-600 dark:text-amber-400">
                      {formatMoney(inv.balance, 'LKR')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          inv.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 3: Mileage Progression */}
      {activeTab === 'mileage' && (
        <div className="bg-card rounded-xl border border-border p-5 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="font-bold text-sm text-foreground">Mileage Recording Log</h3>
              <p className="text-xs text-muted-foreground">
                Odometer readings recorded during garage intake inspections
              </p>
            </div>
            <span className="font-mono font-bold text-xs bg-muted px-2.5 py-1 rounded-lg">
              Latest: {latestMileage.toLocaleString()} km
            </span>
          </div>

          <div className="divide-y divide-border">
            {jobs.map((job, idx) => {
              const nextJob = jobs[idx + 1];
              const diff = nextJob ? job.mileage_in - nextJob.mileage_in : 0;

              return (
                <div key={job.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center font-mono">
                      #{jobs.length - idx}
                    </div>
                    <div>
                      <span className="font-bold text-foreground text-sm font-mono block">
                        {job.mileage_in.toLocaleString()} km
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(job.created_at)} · {job.job_no}
                      </span>
                    </div>
                  </div>

                  {nextJob && diff > 0 && (
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono font-semibold text-xs">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{diff.toLocaleString()} km
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        driven since visit
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
