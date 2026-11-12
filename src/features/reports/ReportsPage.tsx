import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useReportSummary,
  useRevenueTrend,
  usePaymentMethods,
  useTopItems,
} from './api';
import { ReportPeriod } from './types';
import { ZReportModal } from './ZReportModal';
import { formatMoney } from '@/lib/format';
import { Plate } from '@/components/ui/Plate';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Wrench,
  Boxes,
  Printer,
  Download,
  AlertCircle,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState<ReportPeriod>('this_month');
  const [showZReportModal, setShowZReportModal] = useState<boolean>(false);

  const { data: summary } = useReportSummary(period);
  const { data: trend, isLoading: isTrendLoading } = useRevenueTrend(period);
  const { data: paymentMethods } = usePaymentMethods(period);
  const { data: topItems } = useTopItems(period);

  const periodOptions: { label: string; value: ReportPeriod }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last 30 Days', value: 'last_30_days' },
  ];

  // Calculate highest revenue bar for relative height scaling
  const maxDayRevenue = Math.max(
    ...(trend || []).map((t) => t.total_amount),
    1
  );

  // CSV Export helper
  const handleExportCSV = () => {
    if (!summary) return;
    const rows = [
      ['Metric', 'Value'],
      ['Period', summary.period],
      ['Date Range', `${summary.start_date} to ${summary.end_date}`],
      ['Total Collected (LKR)', (summary.total_collected / 100).toFixed(2)],
      ['Cash Collected (LKR)', (summary.cash_collected / 100).toFixed(2)],
      ['Card Collected (LKR)', (summary.card_collected / 100).toFixed(2)],
      ['Bank Collected (LKR)', (summary.bank_collected / 100).toFixed(2)],
      ['Total Invoiced (LKR)', (summary.total_invoiced / 100).toFixed(2)],
      ['Labor Revenue (LKR)', (summary.labor_total / 100).toFixed(2)],
      ['Parts Revenue (LKR)', (summary.parts_total / 100).toFixed(2)],
      ['Outstanding Balance (LKR)', (summary.total_outstanding / 100).toFixed(2)],
      ['Jobs Completed', String(summary.completed_jobs_count)],
      ['Average Job Value (LKR)', (summary.average_job_value / 100).toFixed(2)],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `garage_report_${period}_${summary.start_date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Range Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Financial ledger, revenue trends, service popularity, and cash reconciliation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-card rounded-xl border border-border">
            {periodOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === opt.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Action CTAs */}
          <button
            type="button"
            onClick={() => setShowZReportModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted font-bold text-xs text-foreground transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-primary" />
            <span>Daily Z-Report</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Gross Collected */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black font-mono text-foreground block">
            {summary ? formatMoney(summary.total_collected, 'LKR') : '...'}
          </span>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
            <span>Cash: {summary ? formatMoney(summary.cash_collected, 'LKR') : '-'}</span>
            <span>Card: {summary ? formatMoney(summary.card_collected, 'LKR') : '-'}</span>
          </div>
        </div>

        {/* Card 2: Labor vs Parts */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Labor vs Parts
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-blue-600 dark:text-blue-400">
                Labor {summary ? formatMoney(summary.labor_total, 'LKR') : '...'}
              </span>
            </div>
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">
                Parts {summary ? formatMoney(summary.parts_total, 'LKR') : '...'}
              </span>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden flex">
            {summary && summary.total_subtotal > 0 && (
              <>
                <div
                  style={{ width: `${(summary.labor_total / summary.total_subtotal) * 100}%` }}
                  className="bg-blue-500 h-full"
                ></div>
                <div
                  style={{ width: `${(summary.parts_total / summary.total_subtotal) * 100}%` }}
                  className="bg-emerald-500 h-full"
                ></div>
              </>
            )}
          </div>
        </div>

        {/* Card 3: Invoiced */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Invoiced
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black font-mono text-foreground block">
            {summary ? formatMoney(summary.total_invoiced, 'LKR') : '...'}
          </span>
          <span className="text-[11px] text-muted-foreground block pt-1 border-t border-border/60">
            {summary?.invoice_count || 0} invoices issued
          </span>
        </div>

        {/* Card 4: Jobs Completed */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Repairs Done
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black font-mono text-foreground block">
            {summary?.completed_jobs_count || 0}
          </span>
          <span className="text-[11px] text-muted-foreground block pt-1 border-t border-border/60">
            Avg ticket: {summary ? formatMoney(summary.average_job_value, 'LKR') : '-'}
          </span>
        </div>

        {/* Card 5: Outstanding Balance */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Receivables Due
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <span
            className={`text-2xl font-black font-mono block ${
              summary && summary.total_outstanding > 0 ? 'text-amber-600' : 'text-foreground'
            }`}
          >
            {summary ? formatMoney(summary.total_outstanding, 'LKR') : '...'}
          </span>
          <span className="text-[11px] text-muted-foreground block pt-1 border-t border-border/60">
            {summary?.outstanding_count || 0} unpaid balances
          </span>
        </div>
      </div>

      {/* Main Grid: Revenue Trend Bar Chart & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* REVENUE TREND CHART (8 cols)                             */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Daily Revenue Collection
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cash and digital payments recorded by calendar day
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-3 h-3 rounded-xs bg-emerald-500"></span> Cash
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-3 h-3 rounded-xs bg-blue-500"></span> Card
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-3 h-3 rounded-xs bg-purple-500"></span> Bank
              </span>
            </div>
          </div>

          {/* Bar Chart Canvas */}
          {isTrendLoading ? (
            <div className="h-56 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !trend || trend.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-xs text-muted-foreground">
              <BarChart3 className="w-10 h-10 stroke-1 mb-2 text-muted-foreground" />
              <span>No revenue data recorded for this period</span>
            </div>
          ) : (
            <div className="h-56 flex items-end gap-2 pt-6 pb-2 px-2 overflow-x-auto scrollbar-none">
              {trend.map((day) => {
                const heightPercent = Math.max(12, Math.round((day.total_amount / maxDayRevenue) * 100));
                const cashPercent = day.total_amount > 0 ? (day.cash_amount / day.total_amount) * 100 : 0;
                const cardPercent = day.total_amount > 0 ? (day.card_amount / day.total_amount) * 100 : 0;
                const bankPercent = day.total_amount > 0 ? (day.bank_amount / day.total_amount) * 100 : 0;

                return (
                  <div
                    key={day.day}
                    className="flex-1 min-w-[28px] max-w-[48px] flex flex-col items-center gap-1 group relative h-full justify-end"
                  >
                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] p-2 rounded shadow-xl whitespace-nowrap z-20 font-mono space-y-0.5">
                      <div className="font-bold border-b border-slate-700 pb-0.5">{day.day}</div>
                      <div>Total: {formatMoney(day.total_amount, 'LKR')}</div>
                      <div>Cash: {formatMoney(day.cash_amount, 'LKR')}</div>
                      <div>Card: {formatMoney(day.card_amount, 'LKR')}</div>
                    </div>

                    {/* Stacked Vertical Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-t-md overflow-hidden flex flex-col justify-end bg-muted/40 transition-all hover:brightness-110"
                    >
                      {bankPercent > 0 && (
                        <div style={{ height: `${bankPercent}%` }} className="w-full bg-purple-500"></div>
                      )}
                      {cardPercent > 0 && (
                        <div style={{ height: `${cardPercent}%` }} className="w-full bg-blue-500"></div>
                      )}
                      {cashPercent > 0 && (
                        <div style={{ height: `${cashPercent}%` }} className="w-full bg-emerald-500"></div>
                      )}
                    </div>

                    {/* Date label */}
                    <span className="text-[10px] text-muted-foreground font-mono truncate max-w-full">
                      {day.day.slice(8)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* PAYMENT METHODS PIE / DISTRIBUTION (4 cols)              */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-border">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Payment Methods
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tender distribution and transaction volume
            </p>
          </div>

          {!paymentMethods || paymentMethods.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">
              No payments collected in this period
            </p>
          ) : (
            <div className="space-y-4">
              {/* Stacked Horizontal Distribution Bar */}
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-muted">
                {paymentMethods.map((pm) => (
                  <div
                    key={pm.payment_method}
                    style={{ width: `${pm.percentage}%` }}
                    className={
                      pm.payment_method === 'cash'
                        ? 'bg-emerald-500'
                        : pm.payment_method === 'card'
                        ? 'bg-blue-500'
                        : 'bg-purple-500'
                    }
                    title={`${pm.payment_method}: ${pm.percentage.toFixed(1)}%`}
                  ></div>
                ))}
              </div>

              {/* Method rows */}
              <div className="space-y-3 pt-2">
                {paymentMethods.map((pm) => (
                  <div
                    key={pm.payment_method}
                    className="flex items-center justify-between text-xs p-2 rounded-xl bg-muted/20 border border-border/50"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          pm.payment_method === 'cash'
                            ? 'bg-emerald-500'
                            : pm.payment_method === 'card'
                            ? 'bg-blue-500'
                            : 'bg-purple-500'
                        }`}
                      ></div>
                      <span className="font-bold uppercase text-foreground">
                        {pm.payment_method.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        ({pm.payment_count} txns)
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-foreground block">
                        {formatMoney(pm.total_amount, 'LKR')}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {pm.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Tables Row: Top Services & Fast-Moving Parts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Top Services Table */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                Top Performing Services
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">Ranked by revenue</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase font-semibold">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-3 text-right">Performed</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {!topItems?.top_services || topItems.top_services.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground italic">
                      No service records in this range
                    </td>
                  </tr>
                ) : (
                  topItems.top_services.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono text-muted-foreground">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{s.name}</td>
                      <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                        {s.times_performed} jobs
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                        {formatMoney(s.total_revenue, 'LKR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Consumed Parts Table */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                Fast-Moving Parts
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">Ranked by revenue</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase font-semibold">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Part & SKU</th>
                  <th className="py-3 px-3 text-right">Qty Used</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {!topItems?.top_parts || topItems.top_parts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground italic">
                      No inventory parts used in this range
                    </td>
                  </tr>
                ) : (
                  topItems.top_parts.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono text-muted-foreground">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-foreground block">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{p.sku}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                        {p.qty_sold} pcs
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                        {formatMoney(p.total_revenue, 'LKR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Outstanding Receivables Table */}
      {topItems?.top_outstanding && topItems.top_outstanding.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-amber-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                Unpaid Receivables Ledger
              </h3>
            </div>
            <Link
              to="/invoices?status=issued"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all unpaid invoices
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase font-semibold">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-3 text-right">Total</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {topItems.top_outstanding.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {inv.invoice_no}
                    </td>
                    <td className="py-3 px-4">
                      {inv.plate_no ? (
                        <Plate plate={inv.plate_no} size="sm" />
                      ) : (
                        <span className="text-muted-foreground">Counter</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-foreground block">{inv.customer_name}</span>
                      <span className="text-[11px] text-muted-foreground">{inv.customer_phone}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                      {formatMoney(inv.total, 'LKR')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                      {formatMoney(inv.paid_total, 'LKR')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-destructive">
                      {formatMoney(inv.balance, 'LKR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[11px] transition-colors"
                      >
                        <span>Collect</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily Z-Report Modal */}
      {showZReportModal && (
        <ZReportModal
          isOpen={showZReportModal}
          onClose={() => setShowZReportModal(false)}
        />
      )}
    </div>
  );
};
