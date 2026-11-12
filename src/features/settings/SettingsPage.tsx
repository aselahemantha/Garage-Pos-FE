import React, { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings } from './api';
import { Save, CheckCircle2, Loader2, DollarSign, Building } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [currencyCode, setCurrencyCode] = useState('LKR');
  const [currencySymbol, setCurrencySymbol] = useState('LKR');
  const [taxRateBp, setTaxRateBp] = useState('0');
  const [invoiceFooter, setInvoiceFooter] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setBusinessName(settings.business_name || 'Auto Care Garage');
      setAddress(settings.address || '123 Main Street');
      setPhone(settings.phone || '+94 11 234 5678');
      setCurrencyCode(settings.currency_code || 'LKR');
      setCurrencySymbol(settings.currency_symbol || 'LKR');
      setTaxRateBp(settings.tax_rate_bp || '0');
      setInvoiceFooter(settings.invoice_footer || 'Thank you for your business!');
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync({
        business_name: businessName,
        address,
        phone,
        currency_code: currencyCode,
        currency_symbol: currencySymbol,
        tax_rate_bp: taxRateBp,
        invoice_footer: invoiceFooter,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-condensed font-bold tracking-tight text-foreground">
          Garage Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          General business identity, billing currency, VAT / tax rate and receipt details
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Identity */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Building className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
              Business Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Garage / Business Name
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Phone</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
              />
            </div>
          </div>
        </div>

        {/* Financial & Tax Configuration */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <DollarSign className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
              Currency & Tax Rates
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Currency Code
              </label>
              <input
                type="text"
                required
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                placeholder="LKR"
                className="w-full px-3 py-2 text-sm uppercase bg-background border border-border rounded-lg min-h-[40px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                required
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="LKR or $"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Tax Rate (Basis Points)
              </label>
              <input
                type="number"
                value={taxRateBp}
                onChange={(e) => setTaxRateBp(e.target.value)}
                placeholder="0 (e.g. 1800 = 18%)"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
              />
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                {parseInt(taxRateBp || '0', 10) / 100}% VAT applied to invoices
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Invoice & Receipt Footer Note
            </label>
            <input
              type="text"
              value={invoiceFooter}
              onChange={(e) => setInvoiceFooter(e.target.value)}
              placeholder="e.g. Thank you for your business!"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg min-h-[40px]"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateSettings.isPending}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-6 py-2.5 rounded-lg shadow-sm text-xs min-h-[44px] transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{updateSettings.isPending ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
