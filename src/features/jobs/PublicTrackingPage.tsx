import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PublicTrackingData } from './types';
import { Plate } from '@/components/ui/Plate';
import { formatMoney, formatDate } from '@/lib/format';
import {
  Wrench,
  Clock,
  PlayCircle,
  CheckCircle2,
  Truck,
  Phone,
  MapPin,
  Boxes,
  FileText,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

const STEPS = [
  { key: 'pending', label: 'Checked In', icon: Clock },
  { key: 'in_progress', label: 'In Progress', icon: PlayCircle },
  { key: 'completed', label: 'Ready for Pickup', icon: CheckCircle2 },
  { key: 'delivered', label: 'Delivered', icon: Truck },
] as const;

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  in_progress: 1,
  completed: 2,
  delivered: 3,
};

export const PublicTrackingPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/public/track/${encodeURIComponent(token)}`);
      const raw = await res.text();
      const parsed = raw ? JSON.parse(raw) : null;
      if (!res.ok) {
        throw new Error(parsed?.error?.message || 'Tracking link not found.');
      }
      setData(parsed.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load repair status.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const timer = setInterval(() => fetchTracking(true), 30000);
    return () => clearInterval(timer);
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">Loading live vehicle status...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 text-center space-y-3 shadow-sm">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
          <h1 className="text-lg font-bold text-foreground">Tracking Link Unavailable</h1>
          <p className="text-xs text-muted-foreground">
            {error || 'This repair tracking link is invalid or no longer available.'}
          </p>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_ORDER[data.status] ?? 0;
  const currency = data.currency || 'LKR';

  return (
    <div className="min-h-screen bg-background py-6 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Garage Header */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-condensed font-bold text-foreground leading-tight">
                {data.garage_name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                {data.garage_phone && (
                  <a href={`tel:${data.garage_phone}`} className="inline-flex items-center gap-1 hover:text-primary">
                    <Phone className="w-3 h-3" />
                    <span>{data.garage_phone}</span>
                  </a>
                )}
                {data.garage_address && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{data.garage_address}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchTracking(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Vehicle & Job Card Summary */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Job Card
              </span>
              <div className="text-xl font-mono font-bold text-foreground">{data.job_no}</div>
              <p className="text-xs text-muted-foreground">
                Owner: <span className="font-semibold text-foreground">{data.customer_name}</span>
              </p>
            </div>
            <div className="text-right space-y-1">
              <Plate plate={data.plate_no} size="md" />
              <div className="text-xs text-muted-foreground font-medium">
                {data.vehicle_make} {data.vehicle_model} {data.vehicle_year || ''}
                {data.mileage_in > 0 ? ` · ${data.mileage_in.toLocaleString()} km` : ''}
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          {data.status === 'cancelled' ? (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
              This job card has been cancelled.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 pt-1">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const done = idx <= currentIdx;
                const active = idx === currentIdx;
                return (
                  <div key={step.key} className="flex flex-col items-center text-center gap-1.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : done
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-muted/50 text-muted-foreground border-border'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[11px] leading-tight font-semibold ${
                        active ? 'text-primary font-bold' : done ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {data.complaint && (
            <div className="pt-2 border-t border-border text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Reported Request
              </span>
              <p className="text-foreground bg-muted/30 p-2.5 rounded-lg border border-border/60">
                {data.complaint}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground pt-1">
            <span>Checked in: {formatDate(data.created_at)}</span>
            {data.started_at && <span>Started: {formatDate(data.started_at)}</span>}
            {data.completed_at && <span>Completed: {formatDate(data.completed_at)}</span>}
            {data.delivered_at && <span>Delivered: {formatDate(data.delivered_at)}</span>}
          </div>
        </div>

        {/* Services & Parts Used */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/20 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-primary" />
              <span>Services & Parts Used ({data.items.length})</span>
            </h2>
          </div>

          {data.items.length > 0 ? (
            <div className="divide-y divide-border/60">
              {data.items.map((it, idx) => (
                <div key={idx} className="px-5 py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          it.item_type === 'service'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {it.item_type}
                      </span>
                      <span className="font-semibold text-foreground">{it.description}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                      Qty: {it.qty} × {formatMoney(it.unit_price, currency)}
                      {it.discount > 0 ? ` (−${formatMoney(it.discount, currency)})` : ''}
                    </div>
                  </div>
                  <span className="font-mono font-bold text-foreground shrink-0">
                    {formatMoney(it.line_total, currency)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Inspection in progress — services and parts will appear here as they are added.
            </div>
          )}

          <div className="px-5 py-3.5 border-t border-border bg-muted/20 flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Estimated Repair Total</span>
            <span className="font-mono text-base font-black text-primary">
              {formatMoney(data.total_minor, currency)}
            </span>
          </div>
        </div>

        {/* Invoice Status (if issued) */}
        {data.invoice && (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                <span>Invoice {data.invoice.invoice_no}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary">
                {data.invoice.status.replace('_', ' ')}
              </span>
            </div>
            {data.invoice.discount_total > 0 && (
              <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
                <span>Discounts Applied:</span>
                <span className="font-mono font-bold">
                  -{formatMoney(data.invoice.discount_total, currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-foreground">
              <span>Invoice Total:</span>
              <span className="font-mono">{formatMoney(data.invoice.total, currency)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Paid:</span>
              <span className="font-mono">{formatMoney(data.invoice.paid_total, currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1.5 border-t border-border">
              <span className={data.invoice.balance > 0 ? 'text-destructive' : 'text-emerald-600'}>
                Balance Due:
              </span>
              <span className={`font-mono ${data.invoice.balance > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                {formatMoney(data.invoice.balance, currency)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
