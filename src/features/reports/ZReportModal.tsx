import React, { useState } from 'react';
import { useEndOfDayReport } from './api';
import { useSettings } from '@/features/settings/api';
import { formatMoney, formatDate } from '@/lib/format';
import {
  Printer,
  X,
  FileText,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

interface ZReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZReportModal: React.FC<ZReportModalProps> = ({ isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [printFormat, setPrintFormat] = useState<'thermal' | 'a4'>('thermal');

  const { data: zReport, isLoading } = useEndOfDayReport(selectedDate);
  const { data: settings } = useSettings();

  const businessName = settings?.business_name || 'Auto Care Garage';
  const businessAddress = settings?.address || '123 Main Street, Colombo';
  const businessPhone = settings?.phone || '+94 11 234 5678';

  if (!isOpen) return null;

  const handlePrint = (format: 'thermal' | 'a4') => {
    setPrintFormat(format);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                End-of-Day Register Z-Report
              </h2>
              <p className="text-xs text-muted-foreground">
                Daily financial audit and physical till reconciliation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-background text-xs">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-foreground text-xs focus:outline-none"
              />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-xs text-muted-foreground">Compiling daily reconciliation...</p>
            </div>
          ) : !zReport ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No financial activity recorded for {selectedDate}
            </p>
          ) : (
            <>
              {/* Daily Sales Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-muted/30 rounded-xl border border-border text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Total Revenue
                  </span>
                  <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                    {formatMoney(zReport.total_collected, 'LKR')}
                  </span>
                </div>

                <div className="p-3 bg-muted/30 rounded-xl border border-border text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Cash Sales
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {formatMoney(zReport.cash_collected, 'LKR')}
                  </span>
                </div>

                <div className="p-3 bg-muted/30 rounded-xl border border-border text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Card / Bank
                  </span>
                  <span className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5 block">
                    {formatMoney(zReport.card_collected + zReport.bank_collected, 'LKR')}
                  </span>
                </div>

                <div className="p-3 bg-muted/30 rounded-xl border border-border text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Paid Invoices
                  </span>
                  <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                    {zReport.invoices_paid_count}
                  </span>
                </div>
              </div>

              {/* Till Reconciliation Box */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-primary" />
                  <span>Cash Drawer Reconciliation</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Opening Floats:</span>
                    <span className="font-mono font-semibold text-foreground text-sm">
                      {formatMoney(zReport.total_opening_float, 'LKR')}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block">Expected Cash:</span>
                    <span className="font-mono font-bold text-primary text-sm">
                      {formatMoney(zReport.total_expected_cash, 'LKR')}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block">Counted Cash:</span>
                    <span className="font-mono font-bold text-foreground text-sm">
                      {formatMoney(zReport.total_closing_counted, 'LKR')}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block">Net Variance:</span>
                    <span
                      className={`font-mono font-bold text-sm flex items-center gap-1 ${
                        zReport.total_difference === 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : zReport.total_difference < 0
                          ? 'text-destructive'
                          : 'text-amber-600'
                      }`}
                    >
                      {zReport.total_difference === 0 ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {zReport.total_difference >= 0 ? '+' : ''}
                        {formatMoney(zReport.total_difference, 'LKR')}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Individual Shift Sessions */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Till Sessions ({zReport.sessions.length})
                </h3>
                {zReport.sessions.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No cash sessions opened on this date.
                  </p>
                ) : (
                  <div className="divide-y divide-border border border-border rounded-xl overflow-hidden text-xs">
                    {zReport.sessions.map((s) => (
                      <div key={s.id} className="p-3 bg-muted/10 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono text-foreground">
                              {s.session_no}
                            </span>
                            <span className="text-muted-foreground">({s.user_name})</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                                s.status === 'open'
                                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {s.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground block mt-0.5">
                            Opened {formatDate(s.opened_at)}{' '}
                            {s.closed_at ? `· Closed ${formatDate(s.closed_at)}` : ''}
                          </span>
                        </div>

                        <div className="text-right font-mono">
                          <span className="font-bold text-foreground block">
                            Expected: {formatMoney(s.expected_cash, 'LKR')}
                          </span>
                          {s.difference !== undefined && s.difference !== null && (
                            <span
                              className={`text-[11px] font-semibold ${
                                s.difference === 0
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : s.difference < 0
                                  ? 'text-destructive'
                                  : 'text-amber-600'
                              }`}
                            >
                              Diff: {s.difference >= 0 ? '+' : ''}
                              {formatMoney(s.difference, 'LKR')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer & Print Actions */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Print end-of-day summary to attach to till drop envelope
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePrint('thermal')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-muted font-bold text-xs text-foreground transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-primary" />
              <span>80mm Thermal Z-Slip</span>
            </button>
            <button
              type="button"
              onClick={() => handlePrint('a4')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-colors shadow-md"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full A4 Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Print Slip Component for Browser Print */}
      {zReport && (
        <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:text-black print:p-4 print:z-50 font-mono text-xs">
          <div
            className={`mx-auto ${
              printFormat === 'thermal' ? 'w-[76mm] max-w-[76mm] text-[11px]' : 'w-full max-w-[210mm]'
            }`}
          >
            <div className="text-center pb-2 border-b border-dashed border-black">
              <h1 className="font-bold text-sm uppercase">{businessName}</h1>
              <p className="text-[10px]">{businessAddress}</p>
              <p className="text-[10px]">Tel: {businessPhone}</p>
              <h2 className="font-bold text-xs uppercase mt-2">*** DAILY Z-REPORT ***</h2>
              <p className="text-[10px]">Date: {selectedDate}</p>
            </div>

            <div className="py-2 space-y-1 border-b border-dashed border-black text-[11px]">
              <div className="flex justify-between">
                <span>TOTAL REVENUE:</span>
                <span className="font-bold">{(zReport.total_collected / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>CASH COLLECTED:</span>
                <span>{(zReport.cash_collected / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>CARD COLLECTED:</span>
                <span>{(zReport.card_collected / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>BANK COLLECTED:</span>
                <span>{(zReport.bank_collected / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>PAID INVOICES:</span>
                <span>{zReport.invoices_paid_count}</span>
              </div>
            </div>

            <div className="py-2 space-y-1 border-b border-dashed border-black text-[11px]">
              <div className="flex justify-between">
                <span>OPENING FLOATS:</span>
                <span>{(zReport.total_opening_float / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>EXPECTED TILL:</span>
                <span className="font-bold">{(zReport.total_expected_cash / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>COUNTED TILL:</span>
                <span className="font-bold">{(zReport.total_closing_counted / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-black">
                <span>NET DIFFERENCE:</span>
                <span>{(zReport.total_difference / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center pt-3 text-[10px]">
              <p>Manager Signature: __________________</p>
              <p className="mt-2 text-slate-500">Workshop Ledger Point of Sale</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
