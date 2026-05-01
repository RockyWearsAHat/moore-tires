import { useState, useEffect, type FormEvent } from 'react';
import { useDashboardApi } from '../hooks/useDashboardApi';
import { useDashboardAuth } from '../context/DashboardAuthContext';
import type { UserRole } from '@moore-tires/shared';
import { parseJson, type ApiResponse } from '../utils/http';

interface UserEntry {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  wholesaleAccountId?: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  district_manager: 'District Manager',
  store_employee: 'Store Employee',
  retail_customer: 'Customer',
};

const ROLE_CLASSES: Record<string, string> = {
  admin: 'bg-red-500/10 text-red-400',
  district_manager: 'bg-blue-500/10 text-blue-400',
  store_employee: 'bg-violet-500/10 text-violet-400',
  retail_customer: 'bg-gray-500/10 text-gray-400',
};

export function UsersPage() {
  const apiFetch = useDashboardApi();
  const { hasRole } = useDashboardAuth();
  const isAdmin = hasRole('admin');

  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'admin' as UserRole,
  });
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/auth/users');
      const json = await parseJson<ApiResponse<UserEntry[]>>(res);
      if (json.success) setUsers(json.data);
    } catch {
      // Network error
    } finally {
      setLoading(false);
    }
  }

  async function deactivateUser(userId: string) {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await apiFetch(`/api/v1/auth/users/${userId}/deactivate`, { method: 'POST' });
      void loadUsers();
    } catch {
      // Error
    }
  }

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    setInviting(true);

    try {
      const res = await apiFetch('/api/v1/auth/invite', {
        method: 'POST',
        body: JSON.stringify(inviteForm),
      });
      const json = await parseJson<ApiResponse<unknown>>(res);
      if (!res.ok) {
        const message = !json.success ? json.error?.message : undefined;
        throw new Error(message ?? 'Invite failed');
      }
      if (!json.success) {
        throw new Error(json.error?.message ?? 'Invite failed');
      }

      setInviteSuccess(
        `Invitation sent to ${inviteForm.email}. They will receive an email with login credentials.`
      );
      setInviteForm({ email: '', firstName: '', lastName: '', role: 'admin' });
      void loadUsers();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Invite failed');
    } finally {
      setInviting(false);
    }
  }

  const inputClass =
    'theme-input mt-1 block w-full rounded-lg px-3 py-2 text-sm';

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display theme-text-strong text-2xl font-bold uppercase tracking-wide">
            Users
          </h1>
          <p className="theme-text-faint text-sm">{users.length} users</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="theme-button-primary flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wider"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Invite User
          </button>
        )}
      </div>

      {/* Invite Form */}
      {showInvite && isAdmin && (
        <div className="card mb-6 p-5">
          <h2 className="font-display theme-text-strong text-lg font-semibold uppercase tracking-wide">
            Invite New User
          </h2>
          <p className="theme-text-faint mt-1 text-sm">
            Send an invitation email with temporary login credentials.
          </p>

          {inviteError && (
            <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {inviteError}
            </div>
          )}
          {inviteSuccess && (
            <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
              {inviteSuccess}
            </div>
          )}

          <form onSubmit={handleInvite} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="theme-text-muted block text-xs font-medium">Email</label>
              <input
                type="email"
                required
                value={inviteForm.email}
                onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                className={inputClass}
                placeholder="user@company.com"
              />
            </div>
            <div>
              <label className="theme-text-muted block text-xs font-medium">Role</label>
              <select
                value={inviteForm.role}
                onChange={(e) =>
                  setInviteForm((f) => ({ ...f, role: e.target.value as UserRole }))
                }
                className={inputClass}
              >
                <option value="admin">Admin</option>
                <option value="district_manager">District Manager</option>
                <option value="store_employee">Store Employee</option>
              </select>
            </div>
            <div>
              <label className="theme-text-muted block text-xs font-medium">First Name</label>
              <input
                required
                value={inviteForm.firstName}
                onChange={(e) => setInviteForm((f) => ({ ...f, firstName: e.target.value }))}
                className={inputClass}
                placeholder="John"
              />
            </div>
            <div>
              <label className="theme-text-muted block text-xs font-medium">Last Name</label>
              <input
                required
                value={inviteForm.lastName}
                onChange={(e) => setInviteForm((f) => ({ ...f, lastName: e.target.value }))}
                className={inputClass}
                placeholder="Doe"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="theme-button-secondary rounded-lg px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviting}
                className="theme-button-primary flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {inviting ? 'Sending…' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : users.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No users found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left">
                <th className="theme-text-faint px-3 py-3 font-medium">Name</th>
                <th className="theme-text-faint px-3 py-3 font-medium">Email</th>
                <th className="theme-text-faint px-3 py-3 font-medium">Role</th>
                {isAdmin && (
                  <th className="theme-text-faint px-3 py-3 text-right font-medium">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-surface-border/50 hover:bg-surface-elevated/50"
                >
                  <td className="theme-text-body px-3 py-3">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="theme-text-muted px-3 py-3">{u.email}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_CLASSES[u.role] ?? 'bg-gray-500/10 text-gray-400'}`}
                    >
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-3 py-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => {
                            void deactivateUser(u.id);
                          }}
                          className="theme-text-faint text-xs transition hover:text-red-400"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
