import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useInvoices } from './api';
import { Plate } from '@/components/ui/Plate';
import { formatMoney, formatDate } from '@/lib/format';
import {
  Search,
  FileText,
  Printer,
  ChevronRight,
  Receipt,
  DollarSign,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const InvoicesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data, isLoading } = useInvoices(
    statusFilter || undefined,
    searchQuery || undefined,
    50,
    0
  );

  const invoices = data?.invoices || [];

  // Compute KPI metrics across loaded invoices
  const totalBilled = invoices.reduce((acc, inv) => acc + (inv.status !== 'void' ? inv.total : 0), 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + (inv.status !== 'void' ? inv.paid_total : 0), 0);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + (inv.status !== 'void' ? inv.balance : 0), 0);

  const filterTabs = [
    { label: 'All Invoices', value: '' },
    { label: 'Unpaid / Issued', value: 'issued' },
    { label: 'Partially Paid', value: 'partially_paid' },
    { label: 'Paid in Full', value: 'paid' },
    { label: 'Voided', value: 'void' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Invoices & Billing
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage customer bills, take payments, and print workshop receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/cash"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted font-bold text-xs sm:text-sm text-foreground transition-colors shadow-sm"
          >
            <Receipt className="w-4 h-4 text-primary" />
            <span>Cash Drawer</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Invoiced
            </span>
            <span className="text-xl font-bold font-mono text-foreground">
              {formatMoney(totalBilled, 'LKR')}
            </span>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Collected
            </span>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatMoney(totalCollected, 'LKR')}
            </span>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Outstanding Balance
            </span>
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {formatMoney(totalOutstanding, 'LKR')}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search invoice, plate, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
            <p className="text-xs text-muted-foreground">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto stroke-1" />
            <p className="font-semibold text-foreground text-sm">No invoices found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Invoices are issued from completed job cards or direct counter sales.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase font-semibold bg-muted/20">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Total</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Balance</th>
                  <th className="py-3 px-4 text-right">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      {inv.invoice_no}
                      {inv.job_no && (
                        <span className="block text-[11px] text-muted-foreground font-normal">
                          {inv.job_no}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {inv.plate_no ? (
                        <Plate plate={inv.plate_no} size="sm" />
                      ) : (
                        <span className="text-muted-foreground italic">Over-counter</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-foreground block">
                        {inv.customer_name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {inv.customer_phone}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          inv.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : inv.status === 'partially_paid'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                            : inv.status === 'void'
                            ? 'bg-slate-500/10 text-slate-500 border border-slate-500/30 line-through'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {inv.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-foreground">
                      {formatMoney(inv.total, 'LKR')}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {formatMoney(inv.paid_total, 'LKR')}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold">
                      <span className={inv.balance > 0 ? 'text-destructive' : 'text-muted-foreground'}>
                        {formatMoney(inv.balance, 'LKR')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right text-muted-foreground whitespace-nowrap">
                      {formatDate(inv.issued_at)}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/invoices/${inv.id}/print?format=thermal`}
                          title="Print Receipt"
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/invoices/${inv.id}`}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[11px] transition-colors"
                        >
                          <span>{inv.balance > 0 ? 'Pay' : 'View'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
