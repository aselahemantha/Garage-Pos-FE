import React, { useState } from 'react';
import {
  useActiveCashSession,
  useOpenCashSession,
  useCloseCashSession,
  useCashSessions,
} from './api';
import { formatMoney, formatDate } from '@/lib/format';
import {
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
} from 'lucide-react';

export const CashDrawerPage: React.FC = () => {
  const { data: activeSession, isLoading: isSessionLoading } = useActiveCashSession();
  const { data: pastSessions, isLoading: isHistoryLoading } = useCashSessions(20, 0);

  const openSessionMutation = useOpenCashSession();
  const closeSessionMutation = useCloseCashSession(activeSession?.id || 0);

  // Open drawer form
  const [openingFloatInput, setOpeningFloatInput] = useState<string>('10000');
  const [openNotes, setOpenNotes] = useState<string>('');

  // Close drawer form
  const [countedInput, setCountedInput] = useState<string>('');
  const [closeNotes, setCloseNotes] = useState<string>('');

  const expectedMinor = activeSession?.expected_cash || 0;
  const countedMinor = countedInput ? Math.round(parseFloat(countedInput) * 100) : 0;
  const varianceMinor = countedInput ? countedMinor - expectedMinor : 0;

  const handleOpenDrawer = async (e: React.FormEvent) => {
    e.preventDefault();
    const floatMinor = Math.round(parseFloat(openingFloatInput || '0') * 100);
    if (floatMinor < 0) return;

    try {
      await openSessionMutation.mutateAsync({
        opening_float: floatMinor,
        notes: openNotes || undefined,
      });
      setOpenNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to open cash drawer');
    }
  };

  const handleCloseDrawer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    if (!countedInput) {
      alert('Please enter the physically counted cash amount in the drawer');
      return;
    }

    try {
      await closeSessionMutation.mutateAsync({
        closing_counted: countedMinor,
        notes: closeNotes || undefined,
      });
      setCountedInput('');
      setCloseNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to close cash drawer');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Cash Drawer & Sessions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage physical till opening floats, cash collections, and end-of-shift reconciliation
          </p>
        </div>
      </div>

      {/* Main Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* CURRENT DRAWER STATUS & ACTION CARD (7 cols)            */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-6">
            {isSessionLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-xs text-muted-foreground">Checking drawer state...</p>
              </div>
            ) : activeSession ? (
              /* ==================================================== */
              /* DRAWER OPEN (ACTIVE SHIFT)                           */
              /* ==================================================== */
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Unlock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                        Cash Drawer Open
                      </span>
                      <span className="text-base font-bold text-foreground font-mono">
                        {activeSession.session_no}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-muted-foreground block">Cashier</span>
                    <span className="font-semibold text-foreground">{activeSession.user_name}</span>
                  </div>
                </div>

                {/* Key Balances Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-muted/20">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Opening Float
                    </span>
                    <span className="text-xl font-bold font-mono text-foreground mt-1 block">
                      {formatMoney(activeSession.opening_float, 'LKR')}
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5 block">
                      Opened {formatDate(activeSession.opened_at)}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                      Expected Cash in Till
                    </span>
                    <span className="text-xl font-black font-mono text-foreground mt-1 block">
                      {formatMoney(activeSession.expected_cash, 'LKR')}
                    </span>
                    <span className="text-[11px] text-primary/80 mt-0.5 block">
                      Float + Cash collections
                    </span>
                  </div>
                </div>

                {/* Close Drawer Reconciliation Form */}
                <form
                  onSubmit={handleCloseDrawer}
                  className="space-y-4 pt-4 border-t border-border"
                >
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      End of Shift Reconciliation
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Physically count all cash in the till and enter the total below to close the drawer.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Counted Cash in Drawer (LKR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder={(expectedMinor / 100).toFixed(2)}
                      value={countedInput}
                      onChange={(e) => setCountedInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-lg font-mono font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  {countedInput && (
                    <div
                      className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                        varianceMinor === 0
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold'
                          : varianceMinor < 0
                          ? 'bg-destructive/10 border-destructive/20 text-destructive font-bold'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {varianceMinor === 0 ? (
                          <CheckCircle2 className="w-5 h-5 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                        )}
                        <span>
                          {varianceMinor === 0
                            ? 'Till is perfectly balanced (Zero discrepancy)'
                            : varianceMinor < 0
                            ? `Shortage detected (${formatMoney(Math.abs(varianceMinor), 'LKR')} short)`
                            : `Overage detected (+${formatMoney(varianceMinor, 'LKR')} excess)`}
                        </span>
                      </div>
                      <span className="font-mono text-sm">
                        {varianceMinor >= 0 ? '+' : ''}
                        {formatMoney(varianceMinor, 'LKR')}
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Shift Notes / Discrepancy Reason (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Evening shift balanced, deposit handed to manager"
                      value={closeNotes}
                      onChange={(e) => setCloseNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={closeSessionMutation.isPending}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {closeSessionMutation.isPending
                        ? 'Reconciling...'
                        : 'Reconcile & Close Cash Drawer'}
                    </span>
                  </button>
                </form>
              </div>
            ) : (
              /* ==================================================== */
              /* DRAWER CLOSED (OPEN NEW SHIFT)                       */
              /* ==================================================== */
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                        Cash Drawer Closed
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        No active shift session in progress
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleOpenDrawer} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Opening Cash Float (LKR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="10000.00"
                      value={openingFloatInput}
                      onChange={(e) => setOpeningFloatInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-lg font-mono font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Starting petty cash in register for giving customer change.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Shift Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Morning shift start with standard float"
                      value={openNotes}
                      onChange={(e) => setOpenNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={openSessionMutation.isPending}
                    className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>
                      {openSessionMutation.isPending
                        ? 'Opening Drawer...'
                        : 'Open Cash Drawer & Start Shift'}
                    </span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: QUICK TILL GUIDELINES & STATS (5 cols)     */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">Cash Control Standard</h3>
            </div>
            <ul className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <span>
                  <strong>Opening Float:</strong> Verify physical cash notes in till before hitting Open.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <span>
                  <strong>Live Tracking:</strong> Every cash payment received in the POS automatically accumulates into expected cash.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <span>
                  <strong>End of Shift:</strong> Count physical denominations and log any discrepancy reasons before handing off.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SESSIONS HISTORY TABLE                                   */}
      {/* ======================================================== */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-bold text-sm text-foreground uppercase tracking-wider">
              Shift Sessions History
            </h2>
          </div>
        </div>

        {isHistoryLoading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Loading session records...
          </div>
        ) : !pastSessions || pastSessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No shift sessions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase font-semibold bg-muted/20">
                  <th className="py-3 px-4">Session #</th>
                  <th className="py-3 px-4">Cashier</th>
                  <th className="py-3 px-4">Opened</th>
                  <th className="py-3 px-4">Closed</th>
                  <th className="py-3 px-3 text-right">Float</th>
                  <th className="py-3 px-3 text-right">Expected</th>
                  <th className="py-3 px-3 text-right">Counted</th>
                  <th className="py-3 px-3 text-right">Difference</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {pastSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {s.session_no}
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">{s.user_name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{formatDate(s.opened_at)}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {s.closed_at ? formatDate(s.closed_at) : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {formatMoney(s.opening_float, 'LKR')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold">
                      {formatMoney(s.expected_cash, 'LKR')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                      {s.closing_counted !== undefined && s.closing_counted !== null
                        ? formatMoney(s.closing_counted, 'LKR')
                        : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      {s.difference !== undefined && s.difference !== null ? (
                        <span
                          className={
                            s.difference === 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : s.difference < 0
                              ? 'text-destructive'
                              : 'text-amber-600'
                          }
                        >
                          {s.difference >= 0 ? '+' : ''}
                          {formatMoney(s.difference, 'LKR')}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          s.status === 'open'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {s.status}
                      </span>
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
