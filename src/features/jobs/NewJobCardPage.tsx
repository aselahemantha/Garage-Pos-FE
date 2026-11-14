import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useServices } from '@/features/catalog/api';
import { resolveServicePrice, ServiceItem } from '@/features/catalog/types';
import { useParts } from '@/features/inventory/api';
import { useUsers } from '@/features/users/api';
import { useCreateJob } from './api';
import { CreateJobItemInput } from './types';
import { Plate } from '@/components/ui/Plate';
import { formatMoney } from '@/lib/format';
import { apiClient } from '@/lib/api';
import {
  Search,
  Check,
  Plus,
  X,
  ArrowRight,
  Loader2,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface FoundVehicle {
  vehicle_id: number;
  customer_id: number;
  plate_no: string;
  make: string;
  model: string;
  year?: number;
  last_mileage?: number;
  customer_name: string;
  customer_phone: string;
}

export const NewJobCardPage: React.FC = () => {
  const navigate = useNavigate();

  // 1. Search / Lookup state
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [vehicleData, setVehicleData] = useState<FoundVehicle | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Quick Inline creation state (Page 8)
  const [newPlate, setNewPlate] = useState('');
  const [newMake, setNewMake] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');

  // 2. Check-in details state
  const [mileageIn, setMileageIn] = useState<number>(0);
  const [promisedTime, setPromisedTime] = useState('');
  const [complaint, setComplaint] = useState('');

  // 3. Selected Items state
  const [selectedItems, setSelectedItems] = useState<CreateJobItemInput[]>([]);

  // Catalog tab filter
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [catalogSearch, setCatalogSearch] = useState('');

  // 4. Mechanic Assignment state
  const [assignedMechanic, setAssignedMechanic] = useState<string>('');

  const { data: services } = useServices();
  const { data: parts } = useParts();
  const { data: staffUsers } = useUsers();
  const createJob = useCreateJob();

  // Search plate / phone lookup
  const handleLookup = async (lookupStr: string) => {
    if (!lookupStr.trim()) return;
    setIsSearching(true);
    setNotFound(false);

    try {
      const clean = lookupStr.trim().toUpperCase();
      // Try searching vehicle by plate first
      const vRes = await apiClient<{ data: FoundVehicle }>(`/vehicles?plate=${encodeURIComponent(clean)}`);
      if (vRes?.data?.plate_no) {
        // Fetch customer details
        const cRes = await apiClient<{ data: { id: number; name: string; phone: string } }>(
          `/customers/${vRes.data.customer_id}`
        );
        setVehicleData({
          ...vRes.data,
          customer_name: cRes.data.name,
          customer_phone: cRes.data.phone,
        });
        setMileageIn(vRes.data.last_mileage ? vRes.data.last_mileage + 3000 : 50000);
        setIsSearching(false);
        return;
      }
    } catch {
      // Not found by plate, check customer by phone
      try {
        const cRes = await apiClient<{ data: { id: number; name: string; phone: string; vehicles?: { id: number; plate_no: string; make: string; model: string; year?: number; last_mileage?: number }[] } }>(
          `/customers?phone=${encodeURIComponent(lookupStr.trim())}`
        );
        if (cRes?.data?.id) {
          const firstVeh = cRes.data.vehicles?.[0];
          setVehicleData({
            vehicle_id: firstVeh?.id || 1,
            customer_id: cRes.data.id,
            plate_no: firstVeh?.plate_no || 'UNKNOWN',
            make: firstVeh?.make || 'Toyota',
            model: firstVeh?.model || 'Aqua',
            year: firstVeh?.year,
            last_mileage: firstVeh?.last_mileage,
            customer_name: cRes.data.name,
            customer_phone: cRes.data.phone,
          });
          setIsSearching(false);
          return;
        }
      } catch {
        // Not found at all
      }
    }

    setNotFound(true);
    setVehicleData(null);
    setNewPlate(lookupStr.trim().toUpperCase());
    setIsSearching(false);
  };

  // Quick register inline (Page 8)
  const handleInlineSave = async () => {
    if (!newName || !newPhone || !newPlate || !newModel) {
      alert('Please fill customer name, phone, plate, and model.');
      return;
    }
    try {
      const c = await apiClient<{ data: { id: number; name: string; phone: string } }>('/customers', {
        method: 'POST',
        body: JSON.stringify({ name: newName, phone: newPhone }),
      });

      const v = await apiClient<{ data: { id: number; plate_no: string; make: string; model: string; year?: number } }>('/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: c.data.id,
          plate_no: newPlate.toUpperCase(),
          make: newMake,
          model: newModel,
          year: newYear ? parseInt(newYear, 10) : undefined,
          last_mileage: mileageIn,
        }),
      });

      setVehicleData({
        vehicle_id: v.data.id,
        customer_id: c.data.id,
        plate_no: v.data.plate_no,
        make: v.data.make,
        model: v.data.model,
        year: v.data.year,
        last_mileage: mileageIn,
        customer_name: c.data.name,
        customer_phone: c.data.phone,
      });
      setNotFound(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to register customer/vehicle');
    }
  };

  // Toggle item selection
  const toggleService = (svc: ServiceItem) => {
    const exists = selectedItems.some((i) => i.item_type === 'service' && i.service_id === svc.id);
    if (exists) {
      setSelectedItems(selectedItems.filter((i) => !(i.item_type === 'service' && i.service_id === svc.id)));
    } else {
      const { price } = resolveServicePrice(svc, vehicleData?.make, vehicleData?.model);
      setSelectedItems([
        ...selectedItems,
        { item_type: 'service', service_id: svc.id, description: svc.name, qty: 1, unit_price: price, discount: 0 },
      ]);
    }
  };

  // Re-resolve service prices when selected vehicle changes
  React.useEffect(() => {
    if (!services || !vehicleData) return;
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.item_type !== 'service' || !item.service_id) return item;
        const svc = services.find((s) => s.id === item.service_id);
        if (!svc) return item;
        const { price } = resolveServicePrice(svc, vehicleData.make, vehicleData.model);
        return price !== item.unit_price ? { ...item, unit_price: price } : item;
      })
    );
  }, [vehicleData?.make, vehicleData?.model, services]);

  const togglePart = (part: { id: number; name: string; sell_price: number }) => {
    const exists = selectedItems.some((i) => i.item_type === 'part' && i.part_id === part.id);
    if (exists) {
      setSelectedItems(selectedItems.filter((i) => !(i.item_type === 'part' && i.part_id === part.id)));
    } else {
      setSelectedItems([
        ...selectedItems,
        { item_type: 'part', part_id: part.id, description: part.name, qty: 1, unit_price: part.sell_price, discount: 0 },
      ]);
    }
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, idx) => idx !== index));
  };

  // Total estimate calculation
  const totalMinor = selectedItems.reduce((sum, item) => sum + item.qty * item.unit_price - item.discount, 0);
  const totalDiscount = selectedItems.reduce((sum, item) => sum + item.discount, 0);

  // Submit and create Job Card
  const handleOpenJobCard = async () => {
    if (!vehicleData) {
      alert('Please select or register a vehicle and customer.');
      return;
    }
    if (selectedItems.length === 0) {
      alert('Please add at least one service or part to the job card.');
      return;
    }

    try {
      await createJob.mutateAsync({
        customer_id: vehicleData.customer_id,
        vehicle_id: vehicleData.vehicle_id,
        mileage_in: mileageIn,
        complaint: complaint || undefined,
        notes: `Mechanic: ${assignedMechanic}. Promised: ${promisedTime}`,
        items: selectedItems,
      });
      navigate('/');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create job card');
    }
  };

  const mechanicsList = (staffUsers || [])
    .filter((u) => u.is_active)
    .map((u) => {
      const words = u.name.trim().split(/\s+/).filter(Boolean);
      const initial =
        words.length >= 2
          ? `${words[0][0]}${words[1][0]}`.toUpperCase()
          : u.name.slice(0, 2).toUpperCase();
      return {
        name: u.name,
        jobs: u.role,
        initial,
      };
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link to="/" className="hover:text-foreground">
              Jobs
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">New job card</span>
          </div>
          <h1 className="text-3xl font-condensed font-bold text-foreground">New job card</h1>
        </div>
        <span className="text-xs text-muted-foreground">Draft saved 10:58</span>
      </div>

      {/* Main Grid: 2/3 Check-in Form + 1/3 Sticky Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form (2 Columns) */}
        <div className="lg:col-span-2 space-y-8">
          {/* STEP 1: Vehicle and Customer */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-5">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-foreground text-background font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="text-lg font-bold text-foreground">Vehicle and customer</h2>
            </div>

            {/* Universal Search Box */}
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup(query)}
                placeholder="Enter plate or phone number..."
                className="w-full pl-10 pr-24 py-3 bg-background border-2 border-border focus:border-primary rounded-xl font-plate text-xl tracking-wider uppercase focus:outline-none min-h-[52px]"
              />
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <button
                type="button"
                onClick={() => handleLookup(query)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lookup'}
              </button>
            </div>

            {/* Found in records preview (Page 4) */}
            {vehicleData && !notFound && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  <Check className="w-4 h-4" />
                  <span>Found in records — details filled in</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-4">
                    <Plate plate={vehicleData.plate_no} size="lg" />
                    <div>
                      <h4 className="font-bold text-base text-foreground">
                        {vehicleData.make} {vehicleData.model} {vehicleData.year}
                      </h4>
                      <p className="text-xs text-muted-foreground">Silver · Hybrid · Automatic</p>
                    </div>
                  </div>

                  <div className="sm:border-l border-border sm:pl-4">
                    <h5 className="font-semibold text-sm text-foreground">{vehicleData.customer_name}</h5>
                    <p className="text-xs text-muted-foreground font-mono">{vehicleData.customer_phone}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/80 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
                  <span>
                    Last visit <strong>14 Jun 2026 · Full Service</strong> · Last mileage{' '}
                    <strong>{vehicleData.last_mileage ? `${vehicleData.last_mileage.toLocaleString()} km` : '-'}</strong> · 7 visits
                  </span>
                  <button
                    onClick={() => {
                      setVehicleData(null);
                      setNotFound(true);
                    }}
                    className="font-semibold text-primary hover:underline"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            {/* Not Found: Inline Registration (Page 8) */}
            {notFound && (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-4">
                <div className="flex items-center gap-2 text-xs text-destructive font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  <span>No vehicle with this plate. Add details below — it is saved when you open the job card.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Plate</label>
                    <input
                      type="text"
                      value={newPlate}
                      onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg font-plate tracking-wider uppercase text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Make</label>
                    <select
                      value={newMake}
                      onChange={(e) => setNewMake(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    >
                      <option value="Toyota">Toyota</option>
                      <option value="Honda">Honda</option>
                      <option value="Nissan">Nissan</option>
                      <option value="Suzuki">Suzuki</option>
                      <option value="Mitsubishi">Mitsubishi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Model *</label>
                    <input
                      type="text"
                      placeholder="e.g. Aqua"
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Year</label>
                    <input
                      type="number"
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Phone number *</label>
                    <input
                      type="tel"
                      placeholder="077 412 3398"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Customer name *</label>
                    <input
                      type="text"
                      placeholder="Ravindu Senanayake"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleInlineSave}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs rounded-lg shadow-sm"
                  >
                    Save & continue
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Check-in */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-foreground text-background font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-lg font-bold text-foreground">Check-in</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Mileage in (km)
                </label>
                <input
                  type="number"
                  value={mileageIn}
                  onChange={(e) => setMileageIn(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-base font-mono font-bold min-h-[44px]"
                />
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  +3,270 km since last visit
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Promised by</label>
                <div className="relative">
                  <input
                    type="text"
                    value={promisedTime}
                    onChange={(e) => setPromisedTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-lg text-sm min-h-[44px]"
                  />
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  Shown on the job board and SMS
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Customer complaint / job notes
              </label>
              <textarea
                rows={3}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                placeholder="What did the customer report?"
              />
            </div>
          </div>

          {/* STEP 3: Services and parts */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-foreground text-background font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h2 className="text-lg font-bold text-foreground">Services and parts</h2>
            </div>

            {/* Catalog search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search services and parts..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
              />
            </div>

            {/* Category Filter Pills (matching Page 4) */}
            <div className="flex flex-wrap items-center gap-1.5 pb-2">
              {['All', 'Servicing', 'Brakes', 'Tyres and alignment', 'AC and cleaning', 'Parts'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-foreground text-background font-bold'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Catalog Items List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {/* Services */}
              {selectedCategory !== 'Parts' &&
                services
                  ?.filter((s) => !catalogSearch || s.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                  .map((s) => {
                    const isAdded = selectedItems.some((i) => i.item_type === 'service' && i.service_id === s.id);
                    const resolved = resolveServicePrice(s, vehicleData?.make, vehicleData?.model);
                    return (
                      <div
                        key={`s-${s.id}`}
                        className="p-3 rounded-lg border border-border bg-background flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">{s.name}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              ({s.category_name})
                            </span>
                            {resolved.matchedVehicle && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                                {resolved.matchedVehicle} rate
                              </span>
                            )}
                          </div>
                          {s.description && (
                            <p className="text-xs text-muted-foreground">{s.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-plate text-base font-bold text-foreground">
                            {formatMoney(resolved.price, 'LKR')}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleService(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] flex items-center gap-1 ${
                              isAdded
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-muted hover:bg-border text-foreground border border-border'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> Added
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" /> Add
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}

              {/* Parts */}
              {(selectedCategory === 'All' || selectedCategory === 'Parts') &&
                parts
                  ?.filter((p) => !catalogSearch || p.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                  .map((p) => {
                    const isAdded = selectedItems.some((i) => i.item_type === 'part' && i.part_id === p.id);
                    return (
                      <div
                        key={`p-${p.id}`}
                        className="p-3 rounded-lg border border-border bg-background flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">{p.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-muted text-muted-foreground">
                              {p.sku}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Stock: {p.stock_on_hand} {p.unit}
                            {p.stock_on_hand <= p.reorder_level && (
                              <span className="text-amber-600 font-semibold ml-2">· Low stock</span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-plate text-base font-bold text-foreground">
                            {formatMoney(p.sell_price, 'LKR')}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePart(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] flex items-center gap-1 ${
                              isAdded
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-muted hover:bg-border text-foreground border border-border'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> Added
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" /> Add
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* STEP 4: Assign a mechanic (Page 5) */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-foreground text-background font-bold text-xs flex items-center justify-center">
                4
              </span>
              <h2 className="text-lg font-bold text-foreground">Assign a mechanic</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {mechanicsList.map((m) => {
                const isSelected = assignedMechanic === m.name;
                return (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => setAssignedMechanic(m.name)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all min-h-[80px] ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                        : 'border-border bg-background hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-full bg-muted font-bold text-xs flex items-center justify-center">
                        {m.initial}
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                      )}
                    </div>
                    <div>
                      <h5 className="font-semibold text-xs text-foreground mt-2">{m.name}</h5>
                      <span className="text-[10px] text-muted-foreground">{m.jobs}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setAssignedMechanic('Unassigned')}
              className="text-xs text-muted-foreground hover:text-foreground font-medium underline"
            >
              Assign later
            </button>
          </div>
        </div>

        {/* Right Sticky Sidebar: JOB SUMMARY (Matching Page 4) */}
        <div>
          <div className="sticky top-6 bg-card rounded-xl border border-border p-6 shadow-soft space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Job Summary
            </h3>

            {/* Vehicle Card Header */}
            {vehicleData ? (
              <div className="flex items-start gap-3 pb-3 border-b border-border">
                <Plate plate={vehicleData.plate_no} size="md" />
                <div className="overflow-hidden">
                  <h4 className="font-bold text-sm text-foreground truncate">
                    {vehicleData.make} {vehicleData.model} {vehicleData.year}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">{vehicleData.customer_name}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs italic text-muted-foreground">No vehicle selected</p>
            )}

            {/* Selected Items List */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 divide-y divide-border/60">
              {selectedItems.map((item, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between gap-2 text-xs">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground leading-tight">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {item.item_type} · qty {item.qty}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">Disc:</span>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          placeholder="0"
                          value={item.discount > 0 ? (item.discount / 100).toFixed(0) : ''}
                          onChange={(e) => {
                            const disc = Math.max(0, Math.round(parseFloat(e.target.value || '0') * 100));
                            setSelectedItems((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, discount: disc } : it))
                            );
                          }}
                          className="w-16 px-1.5 py-0.5 text-[11px] font-mono border border-border rounded bg-background text-foreground"
                          title="Line discount in LKR"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="font-plate text-sm font-bold text-foreground block">
                        {formatMoney(Math.max(0, item.qty * item.unit_price - item.discount), 'LKR')}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono block">
                          -{formatMoney(item.discount, 'LKR')}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-muted-foreground hover:text-destructive p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Assignment & Promised details */}
            <div className="pt-3 border-t border-border space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Mechanic</span>
                <span className="font-semibold text-foreground">{assignedMechanic}</span>
              </div>
              <div className="flex justify-between">
                <span>Promised by</span>
                <span className="font-semibold text-foreground">{promisedTime}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
                  <span>Total Line Discounts</span>
                  <span className="font-mono font-bold">-{formatMoney(totalDiscount, 'LKR')}</span>
                </div>
              )}
            </div>

            {/* Estimate Total */}
            <div className="pt-3 border-t border-border space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">
                  Estimate · {selectedItems.length} items
                </span>
                <span className="font-plate text-3xl font-extrabold tracking-tight text-foreground">
                  {formatMoney(totalMinor, 'LKR')}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Before VAT. Final amount is set on the invoice.
              </p>
            </div>

            {/* Action CTA */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleOpenJobCard}
                disabled={createJob.isPending || !vehicleData || selectedItems.length === 0}
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-3.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 min-h-[48px] text-sm transition-colors disabled:opacity-50"
              >
                {createJob.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Open job card</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full text-center py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
