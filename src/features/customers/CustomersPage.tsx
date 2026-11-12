import React, { useState } from 'react';
import { useCustomers, useCreateCustomer, useCreateVehicle } from './api';
import { Plate } from '@/components/ui/Plate';
import { CustomerDetailModal } from './CustomerDetailModal';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Car,
  X,
  Loader2,
  Calendar,
} from 'lucide-react';
import { formatDate } from '@/lib/format';

export const CustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  // Form state for creating customer + vehicle
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  // Vehicle fields (optional on customer creation)
  const [plateNo, setPlateNo] = useState('');
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2017');

  const { data, isLoading } = useCustomers(searchTerm);
  const createCustomer = useCreateCustomer();
  const createVehicle = useCreateVehicle();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    try {
      const newCust = await createCustomer.mutateAsync({
        name,
        phone,
        email: email || undefined,
        address: address || undefined,
      });

      // If vehicle plate is provided, link vehicle
      if (plateNo.trim() && model.trim()) {
        await createVehicle.mutateAsync({
          customer_id: newCust.id,
          plate_no: plateNo.trim().toUpperCase(),
          make,
          model,
          year: year ? parseInt(year, 10) : undefined,
        });
      }

      setIsAddOpen(false);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setPlateNo('');
      setModel('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save customer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-condensed font-bold tracking-tight text-foreground">
            Customers & Vehicles
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage garage client directory and registered vehicle fleet
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 py-2.5 rounded-lg shadow-sm min-h-[44px] transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by customer name or phone..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
        />
      </div>

      {/* Customer Directory List */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCustomerId(c.id)}
              className="bg-card rounded-xl border border-border p-5 shadow-soft flex flex-col justify-between hover:border-primary/50 transition-colors cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{c.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{c.phone}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    #{c.id}
                  </span>
                </div>

                {c.email && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}

                {c.address && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </div>
                )}

                {c.vehicles && c.vehicles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {c.vehicles.map((v) => (
                      <Plate key={v.id} plate={v.plate_no} size="sm" />
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {formatDate(c.created_at).split(',')[0]}</span>
                </div>
                <span className="font-semibold text-foreground">Active client</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-card rounded-xl border border-border">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-lg text-foreground">No customers found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `No customer matching "${searchTerm}". Try a different name or phone.`
              : 'Start by creating your first garage customer.'}
          </p>
        </div>
      )}

      {/* Add Customer Modal Drawer */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-modal p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <h2 className="text-xl font-condensed font-bold text-foreground">New Customer & Vehicle</h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Customer details */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                  Customer Info
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Shehan Wickramasinghe"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 077 412 3398"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary min-h-[40px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="City or Area"
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary min-h-[40px]"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle details */}
              <div className="space-y-3 pt-3 border-t border-border">
                <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-primary" />
                  <span>Primary Vehicle (Optional)</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Registration Plate
                    </label>
                    <input
                      type="text"
                      value={plateNo}
                      onChange={(e) => setPlateNo(e.target.value)}
                      placeholder="CAB-4521"
                      className="w-full px-3 py-2 text-sm uppercase bg-background border border-border rounded-lg font-plate tracking-wider min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Make</label>
                    <select
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                    >
                      <option value="Toyota">Toyota</option>
                      <option value="Honda">Honda</option>
                      <option value="Nissan">Nissan</option>
                      <option value="Suzuki">Suzuki</option>
                      <option value="Mitsubishi">Mitsubishi</option>
                      <option value="Hyundai">Hyundai</option>
                      <option value="Kia">Kia</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Model</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. Aqua, Vezel"
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Year</label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="2017"
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCustomer.isPending}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs rounded-lg shadow-sm min-h-[40px] transition-colors disabled:opacity-50"
                >
                  {createCustomer.isPending ? 'Saving...' : 'Save & Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Customer Detail & History Modal */}
      {selectedCustomerId && (
        <CustomerDetailModal
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </div>
  );
};
