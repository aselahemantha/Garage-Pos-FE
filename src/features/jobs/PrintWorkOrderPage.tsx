import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJob } from './api';
import { useSettings } from '@/features/settings/api';
import { Plate } from '@/components/ui/Plate';
import { formatDate } from '@/lib/format';
import {
  Printer,
  ArrowLeft,
  Wrench,
  FileText,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export const PrintWorkOrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading } = useJob(id);
  const { data: settings } = useSettings();
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');

  if (isLoading || !job) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 print:p-0 print:bg-white print:text-black">
      {/* Top Action Bar (Hidden on print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden bg-card border border-border p-4 rounded-xl shadow-soft">
        <div className="flex items-center gap-3">
          <Link
            to={`/jobs/${job.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg border border-border hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job</span>
          </Link>
          <div>
            <h1 className="font-bold text-sm text-foreground">
              Workshop Work Order · <span className="font-mono">{job.job_no}</span>
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Mechanic shop floor instructions & quality control sheet
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Format selector */}
          <div className="flex items-center bg-muted p-0.5 rounded-lg border border-border">
            <button
              onClick={() => setPrintFormat('a4')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                printFormat === 'a4'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              A4 Work Order
            </button>
            <button
              onClick={() => setPrintFormat('thermal')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                printFormat === 'thermal'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              80mm Pocket Slip
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs shadow-sm min-h-[36px] transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Work Order</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Wrapper */}
      <div className="max-w-4xl mx-auto flex justify-center">
        {printFormat === 'a4' ? (
          /* ======================================================== */
          /* A4 WORKSHOP JOB SHEET & WORK ORDER                       */
          /* ======================================================== */
          <div className="w-full bg-white text-slate-900 border border-slate-300 print:border-none p-8 sm:p-10 shadow-lg print:shadow-none font-sans min-h-[1050px] flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-5 border-b-2 border-slate-900">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <h2 className="font-condensed font-extrabold text-2xl uppercase tracking-wider text-slate-900">
                      {settings?.business_name || 'AUTO CARE GARAGE'}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {settings?.address || '123 Workshop Lane, Industrial Zone'} · Phone: {settings?.phone || '+94 11 234 5678'}
                  </p>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-slate-900 text-white px-3 py-1 text-xs font-bold tracking-widest uppercase rounded">
                    WORK ORDER
                  </div>
                  <div className="font-mono font-extrabold text-lg mt-1 text-slate-900">
                    {job.job_no}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Printed {new Date().toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Vehicle & Customer Highlights Box */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-slate-300 bg-slate-50">
                {/* Vehicle Details */}
                <div className="space-y-2 border-r border-slate-200 pr-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Vehicle Under Repair
                    </span>
                    <Plate plate={job.plate_no} size="md" />
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Make & Model:</span>
                      <strong className="text-slate-900 font-bold">
                        {job.vehicle_make} {job.vehicle_model} {job.vehicle_year || ''}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Mileage In:</span>
                      <strong className="font-mono text-slate-900 font-bold text-sm">
                        {job.mileage_in.toLocaleString()} km
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Customer & Advisor Details */}
                <div className="space-y-2 pl-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Customer & Reception
                  </span>
                  <div className="grid grid-cols-2 gap-x-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Customer Name:</span>
                      <strong className="text-slate-900 font-bold">{job.customer_name}</strong>
                      <span className="block text-slate-600 font-mono text-[11px]">{job.customer_phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Service Advisor:</span>
                      <strong className="text-slate-900 font-bold">{job.advisor_name || 'Floor Advisor'}</strong>
                      {job.promised_by && (
                        <span className="block text-amber-700 font-semibold text-[11px] mt-0.5">
                          Promise: {formatDate(job.promised_by)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Reported Complaint */}
              <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50/60 text-slate-900 space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Customer Reported Complaint / Primary Instructions:
                </span>
                <p className="text-sm font-semibold whitespace-pre-wrap">
                  {job.complaint || 'General inspection, full maintenance servicing and diagnostics.'}
                </p>
              </div>

              {/* Internal Workshop Diagnostic Notes */}
              {job.notes && (
                <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-100 text-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Service Advisor / Diagnostic Notes:
                  </span>
                  <p className="text-xs whitespace-pre-wrap">{job.notes}</p>
                </div>
              )}

              {/* Required Operations & Parts Checklist Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-900">
                  <h3 className="font-condensed font-extrabold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4" />
                    Repair Operations & Replaced Parts Task List
                  </h3>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Technician tick upon completion
                  </span>
                </div>

                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700 border-b border-slate-300">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center">Done</th>
                      <th className="py-2 px-3 w-20">Type</th>
                      <th className="py-2 px-3">Description & Specifications</th>
                      <th className="py-2 px-3 text-right w-16">Qty</th>
                      <th className="py-2 px-3 w-28 text-center">Technician</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {job.items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                          No tasks or parts registered yet. Use mechanic floor mode or edit job card to add.
                        </td>
                      </tr>
                    ) : (
                      job.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-center">
                            <div className="w-4 h-4 border-2 border-slate-400 rounded inline-block"></div>
                          </td>
                          <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-slate-500">
                            {item.item_type === 'service' ? 'LABOR' : 'PART'}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {item.description}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                            {item.qty}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                            {item.mechanic_name || '_____________'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Multi-Point Inspection & Quality Control Check-off */}
              <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-3">
                <span className="font-condensed font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                  Workshop Quality Control & Multi-Point Safety Check-off
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-3.5 h-3.5 border border-slate-400 rounded"></div>
                    <span>Engine oil level & filter sealed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-3.5 h-3.5 border border-slate-400 rounded"></div>
                    <span>Brake fluid & pad thickness</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-3.5 h-3.5 border border-slate-400 rounded"></div>
                    <span>Tire pressure & wheel lugs torqued</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-3.5 h-3.5 border border-slate-400 rounded"></div>
                    <span>Coolant & washer fluid topped up</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-3.5 h-3.5 border border-slate-400 rounded"></div>
                    <span>Suspension & steering linkages</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-3.5 h-3.5 border border-slate-400 rounded"></div>
                    <span>Road test & diagnostic reset ok</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Technician Sign-Off Footer */}
            <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs text-slate-800">
              <div className="space-y-8">
                <div className="space-y-1">
                  <div className="border-b border-slate-400 w-48 h-6"></div>
                  <span className="block font-bold text-[11px] uppercase tracking-wider text-slate-600">
                    Lead Technician Signature
                  </span>
                  <span className="block text-[10px] text-slate-500">Date & Time Finished: __________________</span>
                </div>
              </div>

              <div className="space-y-8 text-right flex flex-col items-end">
                <div className="space-y-1">
                  <div className="border-b border-slate-400 w-48 h-6"></div>
                  <span className="block font-bold text-[11px] uppercase tracking-wider text-slate-600">
                    Quality Assurance Inspector
                  </span>
                  <span className="block text-[10px] text-slate-500">Approved for delivery & invoicing</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* 80mm POCKET JOB SLIP                                     */
          /* ======================================================== */
          <div className="w-[80mm] bg-white text-black p-4 font-mono text-xs shadow-md print:shadow-none print:p-0">
            <div className="text-center pb-3 border-b border-dashed border-black">
              <h2 className="font-bold text-sm uppercase">
                {settings?.business_name || 'AUTO CARE GARAGE'}
              </h2>
              <div className="text-[10px]">WORK ORDER SLIP</div>
              <div className="font-bold text-sm mt-1">{job.job_no}</div>
            </div>

            {/* Vehicle & Customer */}
            <div className="py-2.5 border-b border-dashed border-black space-y-1 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>PLATE:</span>
                <span>{job.plate_no}</span>
              </div>
              <div className="flex justify-between">
                <span>VEHICLE:</span>
                <span>{job.vehicle_make} {job.vehicle_model}</span>
              </div>
              <div className="flex justify-between">
                <span>MILEAGE:</span>
                <span>{job.mileage_in.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between">
                <span>CLIENT:</span>
                <span>{job.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span>PHONE:</span>
                <span>{job.customer_phone}</span>
              </div>
            </div>

            {/* Complaint */}
            <div className="py-2.5 border-b border-dashed border-black text-[11px]">
              <div className="font-bold uppercase text-[10px]">COMPLAINT:</div>
              <div className="mt-0.5">{job.complaint || 'General Service & Checkup'}</div>
            </div>

            {/* Operations list */}
            <div className="py-2.5 border-b border-dashed border-black space-y-1">
              <div className="font-bold uppercase text-[10px] mb-1">TASK LIST ({job.items.length}):</div>
              {job.items.map((i, idx) => (
                <div key={idx} className="flex items-start justify-between text-[11px]">
                  <span>[ ] {i.description}</span>
                  <span className="font-bold">x{i.qty}</span>
                </div>
              ))}
            </div>

            {/* Sign-off */}
            <div className="pt-4 text-center text-[10px] space-y-3">
              <div>TECH SIGN: ___________________</div>
              <div>DATE: {new Date().toLocaleDateString()}</div>
              <div className="text-[9px] text-slate-500">KEEP WITH VEHICLE KEYS</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
