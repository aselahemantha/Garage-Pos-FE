import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useInvoice } from './api';
import { useSettings } from '@/features/settings/api';
import { formatMoney, formatDate } from '@/lib/format';
import { Printer, ArrowLeft, Receipt, FileText } from 'lucide-react';
import { Plate } from '@/components/ui/Plate';

export const PrintInvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const formatParam = searchParams.get('format') || 'thermal';
  const [format, setFormat] = useState<'thermal' | 'a4'>(
    formatParam === 'a4' ? 'a4' : 'thermal'
  );

  const { data: invoice, isLoading, error } = useInvoice(id);
  const { data: settings } = useSettings();

  const businessName = settings?.business_name || 'Auto Care Garage';
  const businessAddress = settings?.address || '123 Main Street, Colombo';
  const businessPhone = settings?.phone || '+94 11 234 5678';
  const footerMessage = settings?.invoice_footer || 'Thank you for your business! Drive safely.';

  const handleFormatChange = (newFormat: 'thermal' | 'a4') => {
    setFormat(newFormat);
    setSearchParams({ format: newFormat });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-700">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100 text-slate-800">
        <p className="text-red-600 font-semibold mb-3">Failed to load invoice</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans print:bg-white print:text-black">
      {/* Print Controls Header - Hidden during print */}
      <div className="no-print sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="font-bold text-slate-800 text-sm">
            Print Preview: {invoice.invoice_no}
          </span>
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => handleFormatChange('thermal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              format === 'thermal'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>80mm Thermal</span>
          </button>
          <button
            onClick={() => handleFormatChange('a4')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              format === 'a4'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>A4 Full Invoice</span>
          </button>
        </div>

        {/* Print Action */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm rounded-lg shadow transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print Document</span>
        </button>
      </div>

      {/* Print Page Styles */}
      <style>{`
        @media print {
          @page {
            margin: ${format === 'thermal' ? '0mm' : '10mm'};
            size: ${format === 'thermal' ? '80mm auto' : 'A4'};
          }
          body {
            margin: 0;
            padding: 0;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-area {
            box-shadow: none !important;
            border: none !important;
            margin: 0 auto !important;
            padding: ${format === 'thermal' ? '8px 12px' : '20px'} !important;
            width: ${format === 'thermal' ? '76mm' : '100%'} !important;
            max-width: ${format === 'thermal' ? '76mm' : '100%'} !important;
          }
        }
      `}</style>

      {/* Content Area */}
      <div className="p-4 sm:p-8 flex justify-center">
        {format === 'thermal' ? (
          /* ========================================================= */
          /* 80mm THERMAL RECEIPT LAYOUT                               */
          /* ========================================================= */
          <div className="print-area bg-white text-black w-[80mm] max-w-[80mm] min-h-[140mm] p-4 shadow-xl border border-slate-300 font-mono text-xs rounded-sm space-y-3">
            {/* Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-black">
              <h1 className="text-base font-bold tracking-tight font-sans uppercase">
                {businessName}
              </h1>
              <p className="text-[11px] leading-tight">{businessAddress}</p>
              <p className="text-[11px]">Tel: {businessPhone}</p>
            </div>

            {/* Invoice & Vehicle Info */}
            <div className="space-y-1 pb-2 border-b border-dashed border-black text-[11px]">
              <div className="flex justify-between">
                <span>INV #:</span>
                <span className="font-bold">{invoice.invoice_no}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{formatDate(invoice.issued_at)}</span>
              </div>
              {invoice.job_no && (
                <div className="flex justify-between">
                  <span>JOB #:</span>
                  <span>{invoice.job_no}</span>
                </div>
              )}
              {invoice.plate_no && (
                <div className="flex justify-between items-center pt-1">
                  <span>PLATE:</span>
                  <span className="font-bold border border-black px-1.5 py-0.5 rounded text-xs font-sans">
                    {invoice.plate_no}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>CUSTOMER:</span>
                <span className="font-semibold truncate max-w-[120px]">
                  {invoice.customer_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>CASHIER:</span>
                <span>{invoice.created_by_name}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-1.5 pb-2 border-b border-dashed border-black text-[11px]">
              <div className="flex justify-between font-bold border-b border-black pb-1">
                <span>ITEM / DESCRIPTION</span>
                <span>TOTAL</span>
              </div>

              {invoice.items.map((it) => (
                <div key={it.id} className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="font-medium truncate max-w-[170px]">
                      {it.description}
                    </span>
                    <span className="font-semibold">
                      {(it.line_total / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-600 flex justify-between">
                    <span>
                      {it.qty} {it.item_type === 'labor' ? 'hr/svc' : 'pcs'} @ {(it.unit_price / 100).toFixed(2)}
                    </span>
                    {it.discount > 0 && (
                      <span>Disc: -{(it.discount / 100).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="space-y-1 pb-2 border-b border-dashed border-black text-[11px]">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>{(invoice.subtotal / 100).toFixed(2)}</span>
              </div>
              {invoice.discount_total > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>DISCOUNT:</span>
                  <span>-{(invoice.discount_total / 100).toFixed(2)}</span>
                </div>
              )}
              {invoice.tax_total > 0 && (
                <div className="flex justify-between">
                  <span>VAT ({invoice.tax_bps / 100}%):</span>
                  <span>{(invoice.tax_total / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-black">
                <span>TOTAL (LKR):</span>
                <span>{(invoice.total / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Payments */}
            <div className="space-y-1 pb-2 border-b border-dashed border-black text-[11px]">
              {invoice.payments.length > 0 ? (
                invoice.payments.map((p) => (
                  <div key={p.id} className="space-y-0.5">
                    <div className="flex justify-between font-semibold">
                      <span className="uppercase">PAID ({p.payment_method}):</span>
                      <span>{(p.amount / 100).toFixed(2)}</span>
                    </div>
                    {p.tendered && (
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span>TENDERED:</span>
                        <span>{(p.tendered / 100).toFixed(2)}</span>
                      </div>
                    )}
                    {p.change_given > 0 && (
                      <div className="flex justify-between font-bold text-[11px]">
                        <span>CHANGE:</span>
                        <span>{(p.change_given / 100).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex justify-between font-bold text-red-600">
                  <span>BALANCE DUE:</span>
                  <span>{(invoice.balance / 100).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center pt-2 space-y-1 text-[10px]">
              <p className="font-semibold">{footerMessage}</p>
              <p className="text-slate-500">*** Software by Workshop Ledger ***</p>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* A4 TAX INVOICE LAYOUT                                     */
          /* ========================================================= */
          <div className="print-area bg-white text-slate-900 w-[210mm] max-w-[210mm] min-h-[297mm] p-10 shadow-xl border border-slate-200 rounded-sm space-y-8 flex flex-col justify-between">
            <div>
              {/* Header Letterhead */}
              <div className="flex justify-between items-start pb-8 border-b-2 border-slate-800">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase font-sans">
                    {businessName}
                  </h1>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs leading-relaxed">
                    {businessAddress}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    Phone: {businessPhone}
                  </p>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded mb-2">
                    Tax Invoice
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 font-mono">
                    {invoice.invoice_no}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Date: {formatDate(invoice.issued_at)}
                  </p>
                  {invoice.job_no && (
                    <p className="text-xs text-slate-500 font-medium">
                      Job Card: {invoice.job_no}
                    </p>
                  )}
                </div>
              </div>

              {/* Bill To & Vehicle Grid */}
              <div className="grid grid-cols-2 gap-8 my-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Billed To
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {invoice.customer_name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">{invoice.customer_phone}</p>
                  {invoice.customer_address && (
                    <p className="text-xs text-slate-600 mt-0.5">
                      {invoice.customer_address}
                    </p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Vehicle Details
                  </span>
                  {invoice.plate_no ? (
                    <div className="flex items-center gap-3">
                      <Plate plate={invoice.plate_no} size="sm" />
                      <span className="text-xs font-semibold text-slate-800">
                        {[invoice.vehicle_make, invoice.vehicle_model, invoice.vehicle_color]
                          .filter(Boolean)
                          .join(' ')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600 font-medium">
                      Direct Over-the-counter
                    </span>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="my-6">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-800 text-[11px] font-bold text-slate-800 uppercase">
                      <th className="py-2.5 px-2">#</th>
                      <th className="py-2.5 px-2">Description</th>
                      <th className="py-2.5 px-2">Type</th>
                      <th className="py-2.5 px-2 text-right">Qty</th>
                      <th className="py-2.5 px-2 text-right">Unit Price</th>
                      <th className="py-2.5 px-2 text-right">Discount</th>
                      <th className="py-2.5 px-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((it, idx) => (
                      <tr key={it.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-2 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-3 px-2 font-medium text-slate-900">
                          {it.description}
                          {it.mechanic_name && (
                            <span className="block text-[10px] text-slate-500">
                              Tech: {it.mechanic_name}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              it.item_type === 'labor'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {it.item_type}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-mono">{it.qty}</td>
                        <td className="py-3 px-2 text-right font-mono">
                          {formatMoney(it.unit_price, 'LKR')}
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-slate-600">
                          {it.discount > 0 ? `-${formatMoney(it.discount, 'LKR')}` : '-'}
                        </td>
                        <td className="py-3 px-2 text-right font-bold font-mono text-slate-900">
                          {formatMoney(it.line_total, 'LKR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary & Payment History */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200">
                {/* Payments History */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Payment Transactions
                  </span>
                  {invoice.payments.length > 0 ? (
                    <div className="space-y-2 text-xs">
                      {invoice.payments.map((p) => (
                        <div
                          key={p.id}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center"
                        >
                          <div>
                            <span className="font-bold uppercase text-slate-800">
                              {p.payment_method}
                            </span>
                            {p.reference_no && (
                              <span className="text-[10px] text-slate-500 block">
                                Ref: {p.reference_no}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 block">
                              {formatDate(p.created_at)}
                            </span>
                          </div>
                          <span className="font-bold font-mono text-emerald-700">
                            {formatMoney(p.amount, 'LKR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No payments recorded yet</p>
                  )}
                </div>

                {/* Totals Table */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-mono font-semibold">
                      {formatMoney(invoice.subtotal, 'LKR')}
                    </span>
                  </div>
                  {invoice.discount_total > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                      <span>Discount Total:</span>
                      <span className="font-mono font-semibold">
                        -{formatMoney(invoice.discount_total, 'LKR')}
                      </span>
                    </div>
                  )}
                  {invoice.tax_total > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">VAT ({invoice.tax_bps / 100}%):</span>
                      <span className="font-mono font-semibold">
                        {formatMoney(invoice.tax_total, 'LKR')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t-2 border-slate-800 text-sm font-bold">
                    <span>Grand Total:</span>
                    <span className="font-mono text-slate-950">
                      {formatMoney(invoice.total, 'LKR')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-emerald-700 font-semibold">
                    <span>Amount Paid:</span>
                    <span className="font-mono">{formatMoney(invoice.paid_total, 'LKR')}</span>
                  </div>
                  <div className="flex justify-between py-1 text-base font-bold border-t border-slate-300">
                    <span className={invoice.balance > 0 ? 'text-red-600' : 'text-slate-800'}>
                      Balance Due:
                    </span>
                    <span
                      className={`font-mono ${invoice.balance > 0 ? 'text-red-600' : 'text-slate-800'}`}
                    >
                      {formatMoney(invoice.balance, 'LKR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Signatures & Footer */}
            <div className="pt-8 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-12 text-xs mb-8">
                <div>
                  <div className="border-b border-slate-400 h-12 w-48 mb-2"></div>
                  <span className="text-slate-500 font-medium">Customer Signature</span>
                </div>
                <div className="text-right">
                  <div className="border-b border-slate-400 h-12 w-48 ml-auto mb-2"></div>
                  <span className="text-slate-500 font-medium">Authorized Cashier / Advisor</span>
                </div>
              </div>

              <div className="text-center text-xs text-slate-500">
                <p className="font-medium text-slate-700">{footerMessage}</p>
                <p className="text-[10px] mt-1 text-slate-400">
                  Workshop Ledger Point of Sale & Invoicing
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
