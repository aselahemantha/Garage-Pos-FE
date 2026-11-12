import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import {
  Wrench,
  FileText,
  Users,
  Boxes,
  Banknote,
  BarChart3,
  Settings,
  LogOut,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Jobs', to: '/', icon: Wrench, roles: ['owner', 'advisor', 'mechanic'] },
    { label: 'Invoices', to: '/invoices', icon: FileText, roles: ['owner', 'advisor'] },
    { label: 'Customers', to: '/customers', icon: Users, roles: ['owner', 'advisor'] },
    { label: 'Inventory', to: '/inventory', icon: Boxes, badge: '3', roles: ['owner', 'advisor'] },
    { label: 'Cash', to: '/cash', icon: Banknote, roles: ['owner', 'advisor'] },
    { label: 'Reports', to: '/reports', icon: BarChart3, roles: ['owner'] },
    { label: 'Settings', to: '/settings', icon: Settings, roles: ['owner'] },
  ];

  const filteredNav = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : true
  );

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors">
      {/* Sidebar */}
      <aside className="w-60 bg-[#16171A] text-slate-200 flex flex-col justify-between border-r border-[#26282D] shrink-0">
        <div>
          {/* Logo & Garage Header */}
          <div className="h-16 flex items-center px-4 gap-3 border-b border-[#26282D]">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm tracking-wide text-white truncate">[Garage Name]</h1>
              <span className="text-xs text-slate-400 block truncate">Auto care</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1">
            {filteredNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                    isActive
                      ? 'bg-[#26282D] text-white font-semibold'
                      : 'text-slate-400 hover:bg-[#202226] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-[#26282D]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#2A2D33] text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : 'DW'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Dilani W.'}</p>
                <p className="text-[11px] text-slate-400 capitalize truncate">{user?.role || 'Service advisor'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-destructive hover:bg-[#202226] rounded transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between gap-4 shrink-0 shadow-xs">
          {/* Universal Search */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search plate, phone, customer, job or invoice no."
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted/60 border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[40px]"
            />
          </div>

          {/* Right Header Controls: Drawer Status + Theme Switcher */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-xs font-medium text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Drawer open · 08:05</span>
            </div>

            {/* Theme & Style Switcher */}
            <ThemeSwitcher />
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
