import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plate } from '@/components/ui/Plate';
import { formatMoney } from '@/lib/format';
import { InvoiceDetail } from './types';
import { CheckCircle2, Printer, FileText, Check, ArrowRight, X } from 'lucide-react';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceDetail;
  paidAmount: number;
  changeGiven: number;
  onPrintThermal: () => void;
  onPrintA4: () => void;
  onMarkDelivered?: () => void;
  isDelivered?: boolean;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  invoice,
  paidAmount,
  changeGiven,
  onPrintThermal,
  onPrintA4,
  onMarkDelivered,
  isDelivered,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col">
        {/* Header with success badge */}
        <div className="bg-emerald-600 text-white p-6 flex flex-col items-center justify-center text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-emerald-700 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Completed</h2>
          <p className="text-emerald-100 text-sm mt-1">
            Invoice {invoice.invoice_no} has been settled
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary Box */}
          <div className="bg-muted/40 rounded-xl p-4 border border-border/60 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Vehicle
              </span>
              {invoice.plate_no ? (
                <Plate plate={invoice.plate_no} size="sm" />
              ) : (
                <span className="text-sm font-medium">Over-the-counter</span>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-semibold text-foreground">{invoice.customer_name}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-bold text-foreground text-base">
                {formatMoney(paidAmount, 'LKR')}
              </span>
            </div>

            {changeGiven > 0 && (
              <div className="flex items-center justify-between text-sm pt-2 border-t border-border/40 text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Change Given:</span>
                <span className="text-base">{formatMoney(changeGiven, 'LKR')}</span>
              </div>
            )}
          </div>

          {/* Quick Print Actions */}
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block">
              Receipt & Invoicing
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onPrintThermal}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted font-medium text-sm transition-all shadow-sm"
              >
                <Printer className="w-4 h-4 text-primary" />
                <span>80mm Thermal</span>
              </button>
              <button
                type="button"
                onClick={onPrintA4}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted font-medium text-sm transition-all shadow-sm"
              >
                <FileText className="w-4 h-4 text-primary" />
                <span>A4 Tax Invoice</span>
              </button>
            </div>
          </div>

          {/* Vehicle Status Action */}
          {invoice.job_card_id && !isDelivered && onMarkDelivered && (
            <button
              type="button"
              onClick={onMarkDelivered}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Mark Vehicle as Delivered & Hand Over</span>
            </button>
          )}

          {isDelivered && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>Vehicle Marked as Delivered</span>
            </div>
          )}

          {/* Navigation CTA */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/');
              }}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <span>Back to Job Board</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
