import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUsers, useCreateUser, useUpdateUser, useChangePassword } from './api';
import { User, UserRole } from './types';
import { formatDate } from '@/lib/format';
import { useAuthStore } from '@/features/auth/store';
import {
  Users,
  UserPlus,
  KeyRound,
  Edit2,
  ShieldCheck,
  Wrench,
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Building,
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const changePassword = useChangePassword();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);

  // Add User Form State
  const [addName, setAddName] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<UserRole>('mechanic');
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit User Form State
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('mechanic');
  const [editIsActive, setEditIsActive] = useState(true);

  // Reset Password State
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const filteredUsers = (users || []).filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalCount = users?.length || 0;
  const activeCount = users?.filter((u) => u.is_active).length || 0;
  const ownersCount = users?.filter((u) => u.role === 'owner').length || 0;
  const advisorsCount = users?.filter((u) => u.role === 'advisor').length || 0;
  const mechanicsCount = users?.filter((u) => u.role === 'mechanic').length || 0;

  const handleOpenAddModal = () => {
    setAddName('');
    setAddUsername('');
    setAddPassword('');
    setAddRole('mechanic');
    setFormError(null);
    setShowAddPassword(false);
    setShowAddModal(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (addPassword.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    try {
      await createUser.mutateAsync({
        name: addName.trim(),
        username: addUsername.trim().toLowerCase(),
        password: addPassword,
        role: addRole,
      });
      setShowAddModal(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditRole(u.role);
    setEditIsActive(u.is_active);
    setFormError(null);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError(null);

    try {
      await updateUser.mutateAsync({
        id: editingUser.id,
        input: {
          name: editName.trim(),
          role: editRole,
          is_active: editIsActive,
        },
      });
      setEditingUser(null);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleOpenResetModal = (u: User) => {
    setResettingUser(u);
    setNewPassword('');
    setFormError(null);
    setResetSuccess(false);
    setShowNewPassword(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    setFormError(null);

    if (newPassword.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    try {
      await changePassword.mutateAsync({
        id: resettingUser.id,
        input: {
          new_password: newPassword,
        },
      });
      setResetSuccess(true);
      setTimeout(() => {
        setResettingUser(null);
        setResetSuccess(false);
      }, 1500);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to update password');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Owner / Admin
          </span>
        );
      case 'advisor':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
            <UserCheck className="w-3.5 h-3.5" />
            Service Advisor
          </span>
        );
      case 'mechanic':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Wrench className="w-3.5 h-3.5" />
            Workshop Mechanic
          </span>
        );
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'Full access to financial analytics, end-of-day reports, user permissions, and voiding invoices';
      case 'advisor':
        return 'Customer reception, vehicle intake, job card estimates, POS billing, and cash register shifts';
      case 'mechanic':
        return 'Workshop floor job cards, parts usage recording, and technician inspection tracking';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-condensed font-bold tracking-tight text-foreground">
              Staff & User Accounts
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage garage personnel, shop floor mechanics, access roles and credentials
          </p>
        </div>

        {currentUser?.role === 'owner' && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs shadow-sm transition-colors min-h-[40px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Building className="w-4 h-4" />
          General Profile
        </Link>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary border-b-2 border-primary">
          <Users className="w-4 h-4" />
          Staff & User Accounts
        </span>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-card rounded-xl p-3 border border-border">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Staff
          </span>
          <span className="text-2xl font-bold font-condensed text-foreground mt-1 block">
            {totalCount}
          </span>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Active Accounts
          </span>
          <span className="text-2xl font-bold font-condensed text-foreground mt-1 block">
            {activeCount}
          </span>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border">
          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
            Owners
          </span>
          <span className="text-2xl font-bold font-condensed text-foreground mt-1 block">
            {ownersCount}
          </span>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border">
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
            Service Advisors
          </span>
          <span className="text-2xl font-bold font-condensed text-foreground mt-1 block">
            {advisorsCount}
          </span>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Mechanics
          </span>
          <span className="text-2xl font-bold font-condensed text-foreground mt-1 block">
            {mechanicsCount}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg min-h-[36px]"
          />
        </div>

        {/* Role Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'owner', 'advisor', 'mechanic'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap min-h-[36px] ${
                roleFilter === r
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'bg-background hover:bg-muted text-muted-foreground'
              }`}
            >
              {r === 'all' ? 'All Roles' : r === 'advisor' ? 'Advisors' : `${r}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-soft">
        {isLoading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-sm">No staff members found</p>
            <p className="text-xs mt-1">Try adjusting your filters or add a new team member.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Staff Member</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  {currentUser?.role === 'owner' && (
                    <th className="px-4 py-3 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => {
                  const initials = u.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                  const isCurrent = currentUser?.id === u.id;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground text-sm">
                                {u.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium border border-primary/20">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              @{u.username}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getRoleBadge(u.role)}</td>
                      <td className="px-4 py-3">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(u.created_at)}
                      </td>
                      {currentUser?.role === 'owner' && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenResetModal(u)}
                              title="Reset Password"
                              className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              title="Edit Member"
                              className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 relative space-y-5">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <h3 className="font-condensed font-bold text-xl text-foreground">
                  Add Staff Member
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create new user credentials and assign workshop role
              </p>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kamal Perera"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[38px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. kamalp"
                  value={addUsername}
                  onChange={(e) => setAddUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[38px]"
                />
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  Lowercase alphanumeric handle used for login
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Initial Password *
                </label>
                <div className="relative">
                  <input
                    type={showAddPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 text-xs bg-background border border-border rounded-lg min-h-[38px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showAddPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  System Role & Permissions *
                </label>
                <div className="space-y-2">
                  {(['mechanic', 'advisor', 'owner'] as const).map((r) => (
                    <label
                      key={r}
                      onClick={() => setAddRole(r)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        addRole === r
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border bg-background hover:bg-muted/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="addRole"
                        checked={addRole === r}
                        onChange={() => setAddRole(r)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs uppercase tracking-wide text-foreground">
                            {r === 'owner' ? 'Owner / Admin' : r === 'advisor' ? 'Service Advisor' : 'Workshop Mechanic'}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {getRoleDescription(r)}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg min-h-[38px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUser.isPending}
                  className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-5 py-2 text-xs rounded-lg min-h-[38px] transition-colors disabled:opacity-50"
                >
                  {createUser.isPending ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 relative space-y-5">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary" />
                <h3 className="font-condensed font-bold text-xl text-foreground">
                  Edit Staff Member
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Updating profile for @{editingUser.username}
              </p>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg min-h-[38px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  System Role & Permissions *
                </label>
                <div className="space-y-2">
                  {(['mechanic', 'advisor', 'owner'] as const).map((r) => (
                    <label
                      key={r}
                      onClick={() => setEditRole(r)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        editRole === r
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border bg-background hover:bg-muted/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="editRole"
                        checked={editRole === r}
                        onChange={() => setEditRole(r)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs uppercase tracking-wide text-foreground">
                            {r === 'owner' ? 'Owner / Admin' : r === 'advisor' ? 'Service Advisor' : 'Workshop Mechanic'}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {getRoleDescription(r)}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="p-3 bg-muted/30 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-foreground block">
                    Account Status
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {editIsActive
                      ? 'Account is active and can log in'
                      : 'Deactivated accounts cannot log in and will be signed out'}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={currentUser?.id === editingUser.id}
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    editIsActive
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                  } disabled:opacity-50`}
                >
                  {editIsActive ? 'Active' : 'Deactivated'}
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg min-h-[38px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateUser.isPending}
                  className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-5 py-2 text-xs rounded-lg min-h-[38px] transition-colors disabled:opacity-50"
                >
                  {updateUser.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 relative space-y-5">
            <button
              onClick={() => setResettingUser(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                <h3 className="font-condensed font-bold text-xl text-foreground">
                  Reset Password
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set a new password for <span className="font-semibold text-foreground">{resettingUser.name}</span> (@{resettingUser.username})
              </p>
            </div>

            {resetSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Password changed successfully! User logged out of other sessions.</span>
              </div>
            )}

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 text-xs bg-background border border-border rounded-lg min-h-[38px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  All active sessions for this user will be revoked immediately upon reset.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg min-h-[38px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changePassword.isPending || resetSuccess}
                  className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-5 py-2 text-xs rounded-lg min-h-[38px] transition-colors disabled:opacity-50"
                >
                  {changePassword.isPending ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
