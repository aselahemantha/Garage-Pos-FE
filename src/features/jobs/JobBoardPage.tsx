import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plate } from '@/components/ui/Plate';
import { useBoardJobs, useUpdateJobStatus } from './api';
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  Truck,
  Plus,
  Calendar,
  AlertTriangle,
  FileCheck2,
  Loader2,
  ChevronRight,
} from 'lucide-react';

interface BoardCardItem {
  id: number;
  job_no: string;
  plate_no: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year?: number;
  customer_name: string;
  complaint: string;
  status: string;
  time: string;
  mechanic?: string;
  initials?: string;
  alert?: string;
  badge?: string;
  paid?: boolean;
}

export const JobBoardPage: React.FC = () => {
  const [selectedMechanic, setSelectedMechanic] = useState('All');

  const { data: realJobs, isLoading } = useBoardJobs();
  const updateStatus = useUpdateJobStatus();

  const mechanics = [
    { id: 'All', name: 'All mechanics' },
    { id: 'Nuwan', name: 'Nuwan' },
    { id: 'Kasun', name: 'Kasun' },
    { id: 'Ruwan', name: 'Ruwan' },
    { id: 'Chaminda', name: 'Chaminda' },
    { id: 'Unassigned', name: 'Unassigned' },
  ];

  // Demo fallback cards matching Page 3 if database has fewer items
  const demoFallbackCards = [
    {
      id: 991,
      job_no: 'JOB-00101',
      plate_no: 'CAB-4521',
      vehicle_make: 'Toyota',
      vehicle_model: 'Aqua',
      vehicle_year: 2017,
      customer_name: 'Shehan Wickramasinghe',
      complaint: 'Full Service, Wheel Alignment +2 more',
      status: 'pending',
      time: '12 min',
      mechanic: 'Unassigned',
      initials: 'UA',
    },
    {
      id: 992,
      job_no: 'JOB-00102',
      plate_no: 'WP KR-8830',
      vehicle_make: 'Honda',
      vehicle_model: 'Vezel',
      vehicle_year: 2019,
      customer_name: 'Ishara Gunawardena',
      complaint: 'AC Service',
      status: 'pending',
      time: '34 min',
      mechanic: 'Kasun',
      initials: 'KS',
    },
    {
      id: 993,
      job_no: 'JOB-00103',
      plate_no: 'WP KX-1194',
      vehicle_make: 'Nissan',
      vehicle_model: 'X-Trail',
      vehicle_year: 2018,
      customer_name: 'Dinesh Abeysekera',
      complaint: 'Brake Pad Replacement, Wheel Alignment',
      status: 'in_progress',
      time: '1 h 20 m',
      mechanic: 'Ruwan',
      initials: 'RJ',
      alert: 'Waiting for parts · brake pads',
    },
    {
      id: 994,
      job_no: 'JOB-00104',
      plate_no: 'CAR-6612',
      vehicle_make: 'Toyota',
      vehicle_model: 'Premio',
      vehicle_year: 2016,
      customer_name: 'Tharushi Perera',
      complaint: 'Full Service',
      status: 'in_progress',
      time: '1 h 55 m',
      mechanic: 'Chaminda',
      initials: 'CF',
    },
    {
      id: 995,
      job_no: 'JOB-00105',
      plate_no: 'WP CAD-7740',
      vehicle_make: 'Toyota',
      vehicle_model: 'Axio',
      vehicle_year: 2015,
      customer_name: 'Sanjeewa Fernando',
      complaint: 'Body Wash and Vacuum',
      status: 'completed',
      time: '2 h 40 m',
      mechanic: 'Nuwan',
      initials: 'NP',
      action: 'Create invoice',
    },
    {
      id: 996,
      job_no: 'JOB-00106',
      plate_no: 'WP KV-5528',
      vehicle_make: 'Suzuki',
      vehicle_model: 'Wagon R',
      vehicle_year: 2018,
      customer_name: 'Hiruni Jayawardena',
      complaint: 'Oil and Filter Change, AC Service',
      status: 'completed',
      time: '3 h 05 m',
      mechanic: 'Ruwan',
      initials: 'RJ',
      badge: 'Part paid LKR 12,981 due',
    },
    {
      id: 997,
      job_no: 'JOB-00107',
      plate_no: 'WP CAA-9013',
      vehicle_make: 'Toyota',
      vehicle_model: 'Aqua',
      vehicle_year: 2016,
      customer_name: 'Pradeep Kumara · Chaminda',
      complaint: 'Paid in full',
      status: 'delivered',
      time: 'Out 10:42',
      paid: true,
    },
  ];

  // Merge real database jobs with demo cards
  const allJobs: BoardCardItem[] = [
    ...(realJobs || []).map((j) => ({
      id: j.id,
      job_no: j.job_no,
      plate_no: j.plate_no,
      vehicle_make: j.vehicle_make,
      vehicle_model: j.vehicle_model,
      vehicle_year: j.vehicle_year,
      customer_name: j.customer_name,
      complaint: j.complaint || 'General Inspection',
      status: j.status,
      time: 'Just now',
      mechanic: j.notes?.includes('Mechanic:') ? j.notes.split('Mechanic:')[1].split('.')[0].trim() : 'Nuwan',
      initials: 'NP',
    })),
    ...demoFallbackCards,
  ];

  const handleAdvanceStatus = async (id: number, currentStatus: string) => {
    let nextStatus = '';
    if (currentStatus === 'pending') nextStatus = 'in_progress';
    else if (currentStatus === 'in_progress') nextStatus = 'completed';
    else if (currentStatus === 'completed') nextStatus = 'delivered';

    if (!nextStatus || id > 900) return; // Ignore mock IDs

    try {
      await updateStatus.mutateAsync({ id, status: nextStatus });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const getFilteredJobs = (status: string) => {
    return allJobs.filter((j) => {
      const matchStatus = j.status === status;
      const matchMechanic =
        selectedMechanic === 'All' ||
        (j.mechanic && j.mechanic.toLowerCase().includes(selectedMechanic.toLowerCase()));
      return matchStatus && matchMechanic;
    });
  };

  const pendingJobs = getFilteredJobs('pending');
  const inProgressJobs = getFilteredJobs('in_progress');
  const completedJobs = getFilteredJobs('completed');
  const deliveredJobs = getFilteredJobs('delivered');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-condensed font-bold tracking-tight text-foreground">
            Today’s jobs
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Wednesday, 11 November · {allJobs.length} vehicles · {pendingJobs.length} waiting to start
          </p>
        </div>

        <Link
          to="/jobs/new"
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-5 py-2.5 rounded-lg shadow-sm min-h-[44px] transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New job</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted min-h-[36px]"
        >
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Today, 11 Nov</span>
        </button>

        <span className="text-xs text-muted-foreground font-medium ml-2">Mechanic</span>

        {mechanics.map((m) => {
          const isSelected = selectedMechanic === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMechanic(m.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors min-h-[32px] ${
                isSelected
                  ? 'bg-foreground text-background font-semibold'
                  : 'bg-card text-foreground border border-border hover:bg-muted'
              }`}
            >
              {m.name}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="py-4 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Column 1: PENDING */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-status-pending text-white font-condensed text-base font-bold tracking-wider">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>PENDING</span>
            </div>
            <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded">
              {pendingJobs.length}
            </span>
          </div>

          <div className="space-y-3">
            {pendingJobs.map((j) => (
              <div key={j.id} className="p-4 bg-card rounded-xl border border-border shadow-soft space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Plate plate={j.plate_no} size="md" />
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> {j.time}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {j.vehicle_make} {j.vehicle_model} {j.vehicle_year || ''}
                  </p>
                  <p className="text-xs text-muted-foreground">{j.customer_name}</p>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{j.complaint}</p>
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-xs text-muted-foreground font-medium">{j.mechanic}</span>
                  <button
                    onClick={() => handleAdvanceStatus(j.id, j.status)}
                    className="text-xs font-semibold px-2.5 py-1 rounded border border-border bg-muted hover:bg-border transition-colors flex items-center gap-1"
                  >
                    <span>Start Work</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: IN PROGRESS */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-status-progress text-white font-condensed text-base font-bold tracking-wider">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              <span>IN PROGRESS</span>
            </div>
            <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded">
              {inProgressJobs.length}
            </span>
          </div>

          <div className="space-y-3">
            {inProgressJobs.map((j) => (
              <div key={j.id} className="p-4 bg-card rounded-xl border border-border shadow-soft space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Plate plate={j.plate_no} size="md" />
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> {j.time}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {j.vehicle_make} {j.vehicle_model} {j.vehicle_year || ''}
                  </p>
                  <p className="text-xs text-muted-foreground">{j.customer_name}</p>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{j.complaint}</p>
                {j.alert && (
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-warning-text flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                    <span>{j.alert}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-muted font-bold text-[10px] flex items-center justify-center">
                      {j.initials || 'RJ'}
                    </div>
                    <span className="text-xs font-medium text-foreground">{j.mechanic}</span>
                  </div>
                  <button
                    onClick={() => handleAdvanceStatus(j.id, j.status)}
                    className="text-xs font-bold px-2.5 py-1 rounded bg-status-completed-soft text-status-completed-text hover:bg-status-completed/20 transition-colors flex items-center gap-1"
                  >
                    <span>Complete</span>
                    <CheckCircle2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: COMPLETED */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-status-completed text-white font-condensed text-base font-bold tracking-wider">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>COMPLETED</span>
            </div>
            <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded">
              {completedJobs.length}
            </span>
          </div>

          <div className="space-y-3">
            {completedJobs.map((j) => (
              <div key={j.id} className="p-4 bg-card rounded-xl border border-border shadow-soft space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Plate plate={j.plate_no} size="md" />
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> {j.time}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {j.vehicle_make} {j.vehicle_model} {j.vehicle_year || ''}
                  </p>
                  <p className="text-xs text-muted-foreground">{j.customer_name}</p>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{j.complaint}</p>
                {j.badge && (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-300">
                    {j.badge}
                  </div>
                )}
                <Link
                  to="/invoices"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-status-completed/30 bg-status-completed-soft text-status-completed-text text-xs font-bold hover:bg-status-completed/20 transition-colors"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Create invoice</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Column 4: DELIVERED */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-status-delivered text-white font-condensed text-base font-bold tracking-wider">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>DELIVERED</span>
            </div>
            <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded">
              {deliveredJobs.length}
            </span>
          </div>

          <div className="space-y-3">
            {deliveredJobs.map((j) => (
              <div key={j.id} className="p-4 bg-card rounded-xl border border-border shadow-soft space-y-3 opacity-90">
                <div className="flex items-start justify-between gap-2">
                  <Plate plate={j.plate_no} size="md" />
                  <span className="text-xs text-muted-foreground">{j.time}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {j.vehicle_make} {j.vehicle_model} {j.vehicle_year || ''}
                  </p>
                  <p className="text-xs text-muted-foreground">{j.customer_name}</p>
                </div>
                <div className="p-2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Paid in full</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
