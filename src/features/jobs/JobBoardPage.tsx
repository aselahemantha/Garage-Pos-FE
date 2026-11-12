import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plate } from '@/components/ui/Plate';
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  Truck,
  Plus,
  AlertTriangle,
  FileCheck2,
  Calendar,
} from 'lucide-react';

export const JobBoardPage: React.FC = () => {
  const [selectedMechanic, setSelectedMechanic] = useState('All');

  const mechanics = [
    { id: 'All', name: 'All mechanics' },
    { id: 'Nuwan', name: 'Nuwan' },
    { id: 'Kasun', name: 'Kasun' },
    { id: 'Ruwan', name: 'Ruwan' },
    { id: 'Chaminda', name: 'Chaminda' },
    { id: 'Unassigned', name: 'Unassigned · 1' },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-condensed font-bold tracking-tight text-foreground">
            Today’s jobs
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Wednesday, 11 November · 11 vehicles · 3 waiting to start
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
        {/* Date Selector */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted min-h-[36px]"
        >
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Today, 11 Nov</span>
        </button>

        <span className="text-xs text-muted-foreground font-medium ml-2">Mechanic</span>

        {/* Mechanic filter pills */}
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

      {/* Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Column 1: PENDING */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-status-pending text-white font-condensed text-base font-bold tracking-wider">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>PENDING</span>
            </div>
            <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded">3</span>
          </div>

          <div className="space-y-3">
            {/* Card 1 */}
            <div className="p-4 bg-card rounded-xl border border-border shadow-soft space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Plate plate="CAB-4521" size="md" />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 12 min
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Toyota Aqua 2017</p>
                <p className="text-xs text-muted-foreground">Shehan Wickramasinghe</p>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                Full Service, Wheel Alignment <span className="font-medium text-foreground">+2 more</span>
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <span className="text-xs text-amber-600 font-medium">Unassigned</span>
                <button className="text-xs font-semibold px-2.5 py-1 rounded border border-border bg-muted hover:bg-border transition-colors">
                  Assign
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-4 bg-card rounded-xl border border-border shadow-soft space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Plate plate="WP KR-8830" size="md" />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 34 min
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Honda Vezel 2019</p>
                <p className="text-xs text-muted-foreground">Ishara Gunawardena</p>
              </div>
              <p className="text-xs text-muted-foreground">AC Service</p>
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <div className="w-6 h-6 rounded-full bg-muted font-bold text-[10px] flex items-center justify-center">
                  KS
                </div>
                <span className="text-xs font-medium text-foreground">Kasun</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-4 bg-card rounded-xl border border-border shadow-soft space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Plate plate="WP CBF-2207" size="md" />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 48 min
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Suzuki Alto 2015</p>
                <p className="text-xs text-muted-foreground">Mohamed Rizwan</p>
              </div>
              <p className="text-xs text-muted-foreground">Oil and Filter Change</p>
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <div className="w-6 h-6 rounded-full bg-muted font-bold text-[10px] flex items-center justify-center">
                  NP
                </div>
                <span className="text-xs font-medium text-foreground">Nuwan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: IN PROGRESS */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-status-progress text-white font-condensed text-base font-bold tracking-wider">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              <span>IN PROGRESS</span>
            </div>
            <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded">3</span>
          </div>

          <div className="space-y-3">
            {/* Card 1 */}
            <div className="p-4 bg-card rounded-xl border border-border shadow-soft space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Plate plate="WP KX-1194" size="md" />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 1 h 20 m
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Nissan X-Trail 2018</p>
                <p className="text-xs text-muted-foreground">Dinesh Abeysekera</p>
              </div>
              <p className="text-xs text-muted-foreground">Brake Pad Replacement, Wheel Alignment</p>
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-warning-text flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                <span>Waiting for parts · brake pads</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <div className="w-6 h-6 rounded-full bg-muted font-bold text-[10px] flex items-center justify-center">
                  RJ
                </div>
                <span className="text-xs font-medium text-foreground">Ruwan</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-4 bg-card rounded-xl border border-border shadow-soft space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Plate plate="CAR-6612" size="md" />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 1 h 55 m
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Toyota Premio 2016</p>
                <p className="text-xs text-muted-foreground">Tharushi Perera</p>
              </div>
              <p className="text-xs text-muted-foreground">Full Service</p>
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <div className="w-6 h-6 rounded-full bg-muted font-bold text-[10px] flex items-center justify-center">
                  CF
                </div>
                <span className="text-xs font-medium text-foreground">Chaminda</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-4 bg-card rounded-xl border border-border shadow-soft space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Plate plate="WP PH-3051" size="md" />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 2 h 10 m
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Honda Fit 2014</p>
                <p className="text-xs text-muted-foreground">Anura Bandara</p>
              </div>
              <p className="text-xs text-muted-foreground">Engine Tune-up</p>
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <div className="w-6 h-6 rounded-full bg-muted font-bold text-[10px] flex items-center justify-center">
                  KS
                </div>
                <span className="text-xs font-medium text-foreground">Kasun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: COMPLETED */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-status-completed text-white font-condensed text-base font-bold tracking-wider">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>COMPLETED</span>
            </div>
            <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded">2</span>
          </div>

          <div className="space-y-3">
            {/* Card 1 */}
            <div className="p-4 bg-card rounded-xl border border-border shadow-soft space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Plate plate="WP CAD-7740" size="md" />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 2 h 40 m
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Toyota Axio 2015</p>
                <p className="text-xs text-muted-foreground">Sanjeewa Fernando</p>
              </div>
              <p className="text-xs text-muted-foreground">Body Wash and Vacuum</p>
              <Link
                to="/invoices"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-status-completed/30 bg-status-completed-soft text-status-completed-text text-xs font-bold hover:bg-status-completed/20 transition-colors"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Create invoice</span>
              </Link>
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <div className="w-6 h-6 rounded-full bg-muted font-bold text-[10px] flex items-center justify-center">
                  NP
                </div>
                <span className="text-xs font-medium text-foreground">Nuwan</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-4 bg-card rounded-xl border border-border shadow-soft space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Plate plate="WP KV-5528" size="md" />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 3 h 05 m
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Suzuki Wagon R 2018</p>
                <p className="text-xs text-muted-foreground">Hiruni Jayawardena</p>
              </div>
              <p className="text-xs text-muted-foreground">Oil and Filter Change, AC Service</p>
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                <span className="font-bold text-amber-700 dark:text-amber-300">Part paid</span>
                <span className="font-extrabold text-foreground">LKR 12,981 due</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <div className="w-6 h-6 rounded-full bg-muted font-bold text-[10px] flex items-center justify-center">
                  RJ
                </div>
                <span className="text-xs font-medium text-foreground">Ruwan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 4: DELIVERED */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-status-delivered text-white font-condensed text-base font-bold tracking-wider">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>DELIVERED</span>
            </div>
            <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded">3</span>
          </div>

          <div className="space-y-3">
            {/* Card 1 */}
            <div className="p-4 bg-card rounded-xl border border-border shadow-soft space-y-3 opacity-90">
              <div className="flex items-start justify-between gap-2">
                <Plate plate="WP CAA-9013" size="md" />
                <span className="text-xs text-muted-foreground">Out 10:42</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Toyota Aqua 2016</p>
                <p className="text-xs text-muted-foreground">Pradeep Kumara · Chaminda</p>
              </div>
              <div className="p-2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Paid in full</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-4 bg-card rounded-xl border border-border shadow-soft space-y-3 opacity-90">
              <div className="flex items-start justify-between gap-2">
                <Plate plate="WP KM-2286" size="md" />
                <span className="text-xs text-muted-foreground">Out 09:58</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Honda Grace 2017</p>
                <p className="text-xs text-muted-foreground">Nimesha Silva · Kasun</p>
              </div>
              <div className="p-2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Paid in full</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-4 bg-card rounded-xl border border-border shadow-soft space-y-3 opacity-90">
              <div className="flex items-start justify-between gap-2">
                <Plate plate="61-4471" size="md" />
                <span className="text-xs text-muted-foreground">Out 09:15</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Mitsubishi Lancer 2004</p>
                <p className="text-xs text-muted-foreground">Lalith Herath · Ruwan</p>
              </div>
              <div className="p-2.5 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-between text-xs">
                <span className="font-semibold text-red-700 dark:text-red-400">Balance unpaid</span>
                <span className="font-bold text-red-700 dark:text-red-400">LKR 4,500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
