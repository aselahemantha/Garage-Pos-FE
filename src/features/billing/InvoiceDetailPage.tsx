import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useInvoice, useRecordPayment, useVoidInvoice, useActiveCashSession, useApplyInvoiceDiscount } from './api';
import { Plate } from '@/components/ui/Plate';
import { formatMoney, formatDate } from '@/lib/format';
import { useAuthStore } from '@/features/auth/store';
import { PaymentSuccessModal } from './PaymentSuccessModal';
import { PaymentMethod } from './types';
import {
  ArrowLeft,
  Printer,
  FileText,
  CreditCard,
  Banknote,
  Building,
  CheckCircle2,
  AlertCircle,
  Ban,
  User,
  Phone,
  ShieldCheck,
  Tag,
  Percent,
  X,
} from 'lucide-react';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: invoice, isLoading, error } = useInvoice(id);
  const { data: activeSession } = useActiveCashSession();
  const recordPaymentMutation = useRecordPayment(Number(id));
  const voidMutation = useVoidInvoice(Number(id));
  const applyDiscountMutation = useApplyInvoiceDiscount(Number(id));

  // Payment form state
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [amountInput, setAmountInput] = useState<string>('');
  const [tenderedInput, setTenderedInput] = useState<string>('');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [markDelivered, setMarkDelivered] = useState<boolean>(true);

  // Success Modal state
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [lastPaymentAmount, setLastPaymentAmount] = useState<number>(0);
  const [lastChangeGiven, setLastChangeGiven] = useState<number>(0);

  // Void modal state
  const [showVoidModal, setShowVoidModal] = useState<boolean>(false);
  const [voidReason, setVoidReason] = useState<string>('');

  // Discount modal state
  const [showDiscountModal, setShowDiscountModal] = useState<boolean>(false);
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [discountReason, setDiscountReason] = useState<string>('');
  const [discountError, setDiscountError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-destructive font-semibold">Failed to load invoice</p>
        <button
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/invoices');
            }
          }}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Calculate payment numbers
  const balanceDue = invoice.balance; // in minor units
  const effectiveAmountMinor = amountInput
    ? Math.round(parseFloat(amountInput) * 100)
    : balanceDue;

  const tenderedMinor = tenderedInput
    ? Math.round(parseFloat(tenderedInput) * 100)
    : effectiveAmountMinor;

  const changeMinor = method === 'cash' ? Math.max(0, tenderedMinor - effectiveAmountMinor) : 0;
  const isTenderedSufficient = method !== 'cash' || tenderedMinor >= effectiveAmountMinor;

  // Smart quick cash denominations based on balance due
  const balanceLKR = Math.ceil(balanceDue / 100);
  const quickCashOptions = [
    { label: 'Exact', value: balanceLKR },
    { label: `${Math.ceil(balanceLKR / 1000) * 1000}`, value: Math.ceil(balanceLKR / 1000) * 1000 },
    { label: `${Math.ceil((balanceLKR + 1000) / 5000) * 5000}`, value: Math.ceil((balanceLKR + 1000) / 5000) * 5000 },
    { label: `${Math.ceil((balanceLKR + 5000) / 10000) * 10000}`, value: Math.ceil((balanceLKR + 5000) / 10000) * 10000 },
  ].filter(
    (opt, index, self) =>
      opt.value >= balanceLKR &&
      self.findIndex((o) => o.value === opt.value) === index
  );

  const handleQuickCash = (value: number) => {
    setTenderedInput(String(value));
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTenderedSufficient) return;

    try {
      await recordPaymentMutation.mutateAsync({
        payment_method: method,
        amount: effectiveAmountMinor,
        tendered: method === 'cash' ? tenderedMinor : undefined,
        reference_no: referenceNo || undefined,
        notes: paymentNotes || undefined,
        mark_delivered: markDelivered,
      });

      setLastPaymentAmount(effectiveAmountMinor);
      setLastChangeGiven(changeMinor);
      setShowSuccessModal(true);

      // Reset form
      setTenderedInput('');
      setAmountInput('');
      setReferenceNo('');
      setPaymentNotes('');
    } catch (err: any) {
      alert(err.message || 'Payment recording failed');
    }
  };

  const handleVoidInvoice = async () => {
    if (!voidReason.trim()) return;
    try {
      await voidMutation.mutateAsync(voidReason);
      setShowVoidModal(false);
      setVoidReason('');
    } catch (err: any) {
      alert(err.message || 'Failed to void invoice');
    }
  };

  const canApplyDiscount =
    invoice &&
    invoice.status !== 'void' &&
    invoice.balance > 0 &&
    (user?.role === 'owner' || user?.role === 'advisor');

  const handleOpenDiscountModal = () => {
    if (!invoice) return;
    setDiscountType('amount');
    setDiscountValue(invoice.discount_total > 0 ? (invoice.discount_total / 100).toFixed(2) : '');
    setDiscountReason('');
    setDiscountError(null);
    setShowDiscountModal(true);
  };

  const valFloat = parseFloat(discountValue) || 0;
  const previewDiscountMinor =
    discountType === 'amount'
      ? Math.round(valFloat * 100)
      : invoice
      ? Math.round((invoice.subtotal * valFloat) / 100)
      : 0;

  const previewNetSubtotal = invoice ? Math.max(0, invoice.subtotal - previewDiscountMinor) : 0;
  const previewTaxMinor =
    invoice && invoice.tax_bps > 0
      ? Math.round((previewNetSubtotal * invoice.tax_bps + 5000) / 10000)
      : 0;
  const previewTotalMinor = previewNetSubtotal + previewTaxMinor;
  const previewBalanceMinor = invoice ? Math.max(0, previewTotalMinor - invoice.paid_total) : 0;

  const handleApplyDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDiscountError(null);
    if (previewDiscountMinor < 0) {
      setDiscountError('Discount cannot be negative');
      return;
    }
    if (invoice && previewDiscountMinor > invoice.subtotal) {
      setDiscountError('Discount cannot exceed subtotal');
      return;
    }

    try {
      if (discountType === 'amount') {
        await applyDiscountMutation.mutateAsync({
          discount_amount: previewDiscountMinor,
          reason: discountReason.trim() || undefined,
        });
      } else {
        await applyDiscountMutation.mutateAsync({
          discount_percent: valFloat,
          reason: discountReason.trim() || undefined,
        });
      }
      setShowDiscountModal(false);
    } catch (err: unknown) {
      setDiscountError(err instanceof Error ? err.message : 'Failed to apply discount');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/invoices');
              }
            }}
            className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
                {invoice.invoice_no}
              </h1>
              <span
                className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${
                  invoice.status === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : invoice.status === 'partially_paid'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                    : invoice.status === 'void'
                    ? 'bg-slate-500/10 text-slate-500 border border-slate-500/30 line-through'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                }`}
              >
                {invoice.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Issued {formatDate(invoice.issued_at)} by {invoice.created_by_name}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            to={`/invoices/${invoice.id}/print?format=thermal`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-muted text-xs font-medium text-foreground transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-primary" />
            <span>80mm Thermal</span>
          </Link>
          <Link
            to={`/invoices/${invoice.id}/print?format=a4`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-muted text-xs font-medium text-foreground transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span>A4 Invoice</span>
          </Link>
          {canApplyDiscount && (
            <button
              onClick={() => handleOpenDiscountModal()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-colors"
            >
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>{invoice.discount_total > 0 ? 'Edit Discount' : '+ Discount'}</span>
            </button>
          )}
          {user?.role === 'owner' && invoice.status !== 'void' && (
            <button
              onClick={() => setShowVoidModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-medium transition-colors"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Void</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left = Invoice Document, Right = POS Cash Register */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: INVOICE DETAILS & ITEM TABLE (7 cols)       */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer & Vehicle Header Card */}
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Vehicle
                </span>
                {invoice.plate_no ? (
                  invoice.vehicle_id ? (
                    <Link
                      to={`/vehicles/${invoice.vehicle_id}?tab=invoices`}
                      className="flex items-center gap-3 group hover:opacity-90 transition-opacity"
                      title="View Vehicle History"
                    >
                      <Plate plate={invoice.plate_no} size="md" />
                      <div>
                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors block">
                          {[invoice.vehicle_make, invoice.vehicle_model].filter(Boolean).join(' ')}
                        </span>
                        {invoice.vehicle_color && (
                          <span className="text-xs text-muted-foreground">
                            Color: {invoice.vehicle_color}
                          </span>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Plate plate={invoice.plate_no} size="md" />
                      <div>
                        <span className="text-sm font-bold text-foreground block">
                          {[invoice.vehicle_make, invoice.vehicle_model].filter(Boolean).join(' ')}
                        </span>
                        {invoice.vehicle_color && (
                          <span className="text-xs text-muted-foreground">
                            Color: {invoice.vehicle_color}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <span className="text-sm font-medium text-foreground">
                    Over-the-counter Direct Sale
                  </span>
                )}
              </div>

              {invoice.job_no && (
                <div className="text-right">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Job Card
                  </span>
                  <Link
                    to={`/jobs/${invoice.job_card_id}`}
                    className="text-sm font-bold text-primary hover:underline font-mono"
                  >
                    {invoice.job_no}
                  </Link>
                </div>
              )}
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground block">Customer</span>
                  <span className="font-semibold text-foreground text-sm">
                    {invoice.customer_name}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground block">Phone</span>
                  <span className="font-semibold text-foreground text-sm">
                    {invoice.customer_phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-muted/30">
              <h2 className="font-bold text-sm text-foreground uppercase tracking-wider">
                Invoice Line Items ({invoice.items.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase font-semibold">
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3 text-right">Qty</th>
                    <th className="py-3 px-3 text-right">Unit Price</th>
                    <th className="py-3 px-3 text-right">Discount</th>
                    <th className="py-3 px-4 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {invoice.items.map((it) => (
                    <tr key={it.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground block">
                          {it.description}
                        </span>
                        {it.mechanic_name && (
                          <span className="text-[11px] text-muted-foreground">
                            Mechanic: {it.mechanic_name}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            it.item_type === 'labor'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {it.item_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-foreground">
                        {it.qty}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-foreground">
                        {formatMoney(it.unit_price, 'LKR')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                        {it.discount > 0 ? `-${formatMoney(it.discount, 'LKR')}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                        {formatMoney(it.line_total, 'LKR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Totals Breakdown */}
            <div className="p-5 border-t border-border bg-muted/10 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-foreground">
                  {formatMoney(invoice.subtotal, 'LKR')}
                </span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Discount Total:</span>
                  {canApplyDiscount && (
                    <button
                      type="button"
                      onClick={() => handleOpenDiscountModal()}
                      className="text-[11px] text-primary font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{invoice.discount_total > 0 ? 'Edit Discount' : '+ Add Discount'}</span>
                    </button>
                  )}
                </div>
                <span className={`font-mono font-semibold ${invoice.discount_total > 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-foreground'}`}>
                  {invoice.discount_total > 0
                    ? `-${formatMoney(invoice.discount_total, 'LKR')}`
                    : 'LKR 0.00'}
                </span>
              </div>
              {invoice.tax_total > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT ({invoice.tax_bps / 100}%):</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatMoney(invoice.tax_total, 'LKR')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                <span className="text-foreground">Grand Total:</span>
                <span className="font-mono text-primary font-black text-lg">
                  {formatMoney(invoice.total, 'LKR')}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                <span>Amount Paid:</span>
                <span className="font-mono">{formatMoney(invoice.paid_total, 'LKR')}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                <span className={invoice.balance > 0 ? 'text-destructive' : 'text-foreground'}>
                  Balance Due:
                </span>
                <span
                  className={`font-mono text-lg font-black ${
                    invoice.balance > 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatMoney(invoice.balance, 'LKR')}
                </span>
              </div>
            </div>
          </div>

          {/* Past Payments History */}
          {invoice.payments.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Payment History ({invoice.payments.length})
              </h3>
              <div className="divide-y divide-border/60">
                {invoice.payments.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold uppercase text-foreground">
                          {p.payment_method}
                        </span>
                        {p.reference_no && (
                          <span className="text-muted-foreground font-mono">
                            Ref: {p.reference_no}
                          </span>
                        )}
                      </div>
                      <span className="text-muted-foreground text-[11px] block mt-0.5">
                        {formatDate(p.created_at)} by {p.created_by_name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm block">
                        {formatMoney(p.amount, 'LKR')}
                      </span>
                      {p.change_given > 0 && (
                        <span className="text-[11px] text-muted-foreground">
                          Change: {formatMoney(p.change_given, 'LKR')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: POS PAYMENT DRAWER / TERMINAL (5 cols)     */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card rounded-2xl border border-border shadow-lg p-5 space-y-5 sticky top-6">
            {invoice.balance === 0 ? (
              /* ==================================================== */
              /* INVOICE PAID IN FULL STATE                           */
              /* ==================================================== */
              <div className="text-center py-8 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Invoice Paid in Full</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Settled on {formatDate(invoice.paid_at || invoice.created_at)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    to={`/invoices/${invoice.id}/print?format=thermal`}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border hover:bg-muted font-medium text-xs transition-colors shadow-sm"
                  >
                    <Printer className="w-4 h-4 text-primary" />
                    <span>80mm Receipt</span>
                  </Link>
                  <Link
                    to={`/invoices/${invoice.id}/print?format=a4`}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border hover:bg-muted font-medium text-xs transition-colors shadow-sm"
                  >
                    <FileText className="w-4 h-4 text-primary" />
                    <span>A4 Tax Invoice</span>
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm transition-colors shadow-md"
                >
                  Return to Job Board
                </button>
              </div>
            ) : invoice.status === 'void' ? (
              /* ==================================================== */
              /* INVOICE VOIDED STATE                                 */
              /* ==================================================== */
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto border border-destructive/20">
                  <Ban className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Invoice Voided</h3>
                <p className="text-xs text-muted-foreground">
                  Reason: {invoice.void_reason || 'No reason provided'}
                </p>
              </div>
            ) : (
              /* ==================================================== */
              /* PAYMENT TERMINAL TENDER FORM                         */
              /* ==================================================== */
              <form onSubmit={handleRecordPayment} className="space-y-5">
                {/* Balance Due Header Banner */}
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                      Balance Due
                    </span>
                    <span className="text-2xl font-black font-mono text-foreground">
                      {formatMoney(balanceDue, 'LKR')}
                    </span>
                  </div>
                  {activeSession ? (
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Drawer Active
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5 font-mono">
                        {activeSession.session_no}
                      </span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        Drawer Closed
                      </span>
                    </div>
                  )}
                </div>

                {/* Method Selector Tabs */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setMethod('cash')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                        method === 'cash'
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border bg-card hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <Banknote className="w-5 h-5 mb-1" />
                      <span>Cash</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMethod('card')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                        method === 'card'
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border bg-card hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mb-1" />
                      <span>Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMethod('bank_transfer')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                        method === 'bank_transfer'
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border bg-card hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <Building className="w-5 h-5 mb-1" />
                      <span>Bank</span>
                    </button>
                  </div>
                </div>

                {/* Payment Amount Input */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Amount to Apply (LKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={(balanceDue / 100).toFixed(2)}
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-mono font-bold text-base focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                {/* Cash Drawer Tender Inputs */}
                {method === 'cash' && (
                  <div className="space-y-3 pt-2 border-t border-border/60">
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                        Quick Cash Denominations
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        {quickCashOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleQuickCash(opt.value)}
                            className="py-2 px-1 rounded-lg border border-border hover:border-primary bg-muted/40 hover:bg-primary/10 text-xs font-bold font-mono transition-colors text-foreground"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                        Cash Tendered (LKR)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder={(balanceDue / 100).toFixed(2)}
                        value={tenderedInput}
                        onChange={(e) => setTenderedInput(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl border font-mono font-bold text-base focus:ring-2 focus:outline-none ${
                          !isTenderedSufficient
                            ? 'border-destructive focus:ring-destructive bg-destructive/5'
                            : 'border-border bg-background focus:ring-primary text-foreground'
                        }`}
                      />
                      {!isTenderedSufficient && (
                        <p className="text-xs text-destructive mt-1 font-medium">
                          Tendered amount is less than payment amount
                        </p>
                      )}
                    </div>

                    {/* Change to Give Box */}
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Change to Give
                      </span>
                      <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {formatMoney(changeMinor, 'LKR')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Card or Bank Reference */}
                {method !== 'cash' && (
                  <div className="space-y-3 pt-2 border-t border-border/60">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                        {method === 'card' ? 'Approval / Authorization Code' : 'Bank Slip / Reference No'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AUTH-88219"
                        value={referenceNo}
                        onChange={(e) => setReferenceNo(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Mark Vehicle as Delivered Checkbox */}
                {invoice.job_card_id && (
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-muted/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={markDelivered}
                      onChange={(e) => setMarkDelivered(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-foreground block">
                        Mark Vehicle as Delivered
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        Automatically transitions job card status to Delivered
                      </span>
                    </div>
                  </label>
                )}

                {/* Complete Payment Button */}
                <button
                  type="submit"
                  disabled={!isTenderedSufficient || recordPaymentMutation.isPending}
                  className="w-full py-4 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {recordPaymentMutation.isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Complete Payment ({formatMoney(effectiveAmountMinor, 'LKR')})</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Payment Success Modal */}
      {showSuccessModal && (
        <PaymentSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          invoice={invoice}
          paidAmount={lastPaymentAmount}
          changeGiven={lastChangeGiven}
          onPrintThermal={() => navigate(`/invoices/${invoice.id}/print?format=thermal`)}
          onPrintA4={() => navigate(`/invoices/${invoice.id}/print?format=a4`)}
          isDelivered={invoice.status === 'paid' && markDelivered}
        />
      )}

      {/* Owner Void Modal */}
      {showVoidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Void Invoice {invoice.invoice_no}</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Voiding an invoice marks it permanently canceled. Please provide a mandatory audit reason.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Customer canceled repair, duplicate billing..."
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-destructive focus:outline-none"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowVoidModal(false)}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!voidReason.trim() || voidMutation.isPending}
                onClick={handleVoidInvoice}
                className="px-4 py-2 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground text-sm font-bold disabled:opacity-50"
              >
                {voidMutation.isPending ? 'Voiding...' : 'Confirm Void'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply / Edit Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Apply Bill Discount</h3>
                  <p className="text-xs text-muted-foreground">Adjust overall discount for {invoice.invoice_no}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDiscountModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {discountError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{discountError}</span>
              </div>
            )}

            <form onSubmit={handleApplyDiscountSubmit} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div>
                <label className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Discount Type
                </label>
                <div className="grid grid-cols-2 gap-2 bg-muted/40 p-1 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setDiscountType('amount')}
                    className={`py-2 px-3 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                      discountType === 'amount'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>Fixed Amount (LKR)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('percent')}
                    className={`py-2 px-3 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                      discountType === 'percent'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>Percentage (%)</span>
                  </button>
                </div>
              </div>

              {/* Value Input */}
              <div>
                <label className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  {discountType === 'amount' ? 'Discount Amount (LKR)' : 'Discount Percentage (%)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={discountType === 'amount' ? '0.01' : '1'}
                    min="0"
                    max={discountType === 'amount' ? (invoice.subtotal / 100).toFixed(2) : '100'}
                    placeholder={discountType === 'amount' ? 'e.g. 500.00' : 'e.g. 10'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-mono font-bold text-base focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    {discountType === 'amount' ? 'LKR' : '%'}
                  </span>
                </div>
              </div>

              {/* Reason / Notes */}
              <div>
                <label className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Reason / Concession Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer loyalty concession, seasonal promo"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-3.5 bg-muted/30 border border-border rounded-xl space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Gross Subtotal:</span>
                  <span className="font-mono font-semibold">{formatMoney(invoice.subtotal, 'LKR')}</span>
                </div>
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
                  <span>Applied Discount:</span>
                  <span className="font-mono font-bold">-{formatMoney(previewDiscountMinor, 'LKR')}</span>
                </div>
                {invoice.tax_bps > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>VAT ({invoice.tax_bps / 100}%):</span>
                    <span className="font-mono font-semibold">{formatMoney(previewTaxMinor, 'LKR')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-foreground pt-1.5 border-t border-border">
                  <span>New Grand Total:</span>
                  <span className="font-mono text-primary text-base font-black">
                    {formatMoney(previewTotalMinor, 'LKR')}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-xs text-foreground">
                  <span>New Balance Due:</span>
                  <span className="font-mono text-destructive font-bold">
                    {formatMoney(previewBalanceMinor, 'LKR')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDiscountModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyDiscountMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-colors shadow-md disabled:opacity-50"
                >
                  {applyDiscountMutation.isPending ? 'Saving...' : 'Apply Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
