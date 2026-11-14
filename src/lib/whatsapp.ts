import { formatMoney } from './format';

export function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) {
    return digits.slice(1);
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `94${digits.slice(1)}`;
  }
  return digits;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Checked In (Pending)',
  in_progress: 'In Progress (Being Serviced)',
  completed: 'Completed & Ready for Pickup',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export interface JobWhatsAppParams {
  phone: string;
  customerName: string;
  plateNo: string;
  vehicleMake: string;
  vehicleModel: string;
  jobNo: string;
  status: string;
  trackingToken: string;
  totalMinor: number;
  currency?: string;
  garageName?: string;
  itemsCount?: number;
}

export function buildJobTrackingUrl(trackingToken: string): string {
  return `${window.location.origin}/track/${trackingToken}`;
}

export function buildJobWhatsAppUrl(params: JobWhatsAppParams): string {
  const waPhone = formatWhatsAppPhone(params.phone);
  const trackingUrl = buildJobTrackingUrl(params.trackingToken);
  const statusLabel = STATUS_LABELS[params.status] || params.status;
  const currency = params.currency || 'LKR';
  const garage = params.garageName || 'Auto Care Garage';

  const lines = [
    `Hello ${params.customerName},`,
    ``,
    `Here is a service update from *${garage}* for your *${params.vehicleMake} ${params.vehicleModel}* (*${params.plateNo}*):`,
    ``,
    `• Job No: *${params.jobNo}*`,
    `• Status: *${statusLabel}*`,
  ];

  if (params.itemsCount && params.itemsCount > 0) {
    lines.push(`• Services & Parts (${params.itemsCount}): *${formatMoney(params.totalMinor, currency)}*`);
  }

  lines.push(
    ``,
    `Track live repair progress & parts used here:`,
    trackingUrl,
    ``,
    `Thank you for choosing ${garage}!`
  );

  return `https://wa.me/${waPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
}
