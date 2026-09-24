import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  UserCheck, 
  Lock, 
  Unlock,
  Activity,
  Layers
} from 'lucide-react';
import { User, SystemLimits } from '../../types';
import { PolicyOSApiClient } from '../../lib/api';
import { formatDateTime } from '../../lib/utils';
import { useToast } from '../ui/Toast';

interface AdminScreenProps {
  currentUser: User;
  onNavigate: (screen: string, params?: any) => void;
  onLogout: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ currentUser, onNavigate, onLogout }) => {
  const [users, setUsers] = useState<User[]>(PolicyOSApiClient.getUsers());
  const [limits, setLimits] = useState<SystemLimits>(PolicyOSApiClient.getSystemLimits());
  const [activeTab, setActiveTab] = useState<'USERS' | 'LIMITS' | 'HEALTH'>('USERS');
  const toast = useToast();

  const handleToggleUserStatus = (targetUser: User) => {
    const newStatus = targetUser.status === 'active' ? 'revoked' : 'active';
    try {
      PolicyOSApiClient.updateUserStatus(targetUser.id, newStatus);
      const updatedList = PolicyOSApiClient.getUsers();
      setUsers(updatedList);

      if (targetUser.id === currentUser.id && newStatus === 'revoked') {
        toast.error('Session Revoked', 'You have revoked your own user access.');
        setTimeout(onLogout, 500);
        return;
      }

      toast.info(
        `User ${targetUser.name} ${newStatus === 'revoked' ? 'Revoked' : 'Reinstated'}`,
        `Access permissions updated in enterprise directory.`
      );
    } catch (err: any) {
      toast.error('Update Failed', err.message);
    }
  };

  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = PolicyOSApiClient.updateSystemLimits(limits);
      setLimits(updated);
      toast.success('System Limits Updated', 'Engine governance boundaries re-calibrated.');
    } catch (err: any) {
      toast.error('Save Failed', err.message);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E3]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              System Administration & Engine Boundaries
            </h1>
            <span className="text-xs px-2 py-0.5 bg-neutral-200 text-neutral-700 font-mono rounded-[3px]">
              Admin Tier Required
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Manage enterprise role directory, access revocations, AST extraction concurrency, and deterministic precedence hierarchies.
          </p>
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-neutral-200/60 rounded-[3px] text-xs font-medium">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3 py-1.5 rounded-[2px] transition-colors ${
              activeTab === 'USERS' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Access & Directory ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('LIMITS')}
            className={`px-3 py-1.5 rounded-[2px] transition-colors ${
              activeTab === 'LIMITS' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Engine Limits & Config
          </button>
          <button
            onClick={() => setActiveTab('HEALTH')}
            className={`px-3 py-1.5 rounded-[2px] transition-colors ${
              activeTab === 'HEALTH' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Engine Health
          </button>
        </div>
      </div>

      {/* Tab: Users Management */}
      {activeTab === 'USERS' && (
        <div className="bg-white border border-[#E5E5E3] rounded-[4px] overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
                Enterprise Personnel & Governance Roles
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Revoking an account terminates the SAML session immediately and redirects the user to the login screen.
              </p>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E3] bg-[#FDFDFD] text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-3">Role Tier</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Directory Status</th>
                <th className="py-2.5 px-3">Last Active</th>
                <th className="py-2.5 px-4 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E3] text-xs">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-neutral-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-7 h-7 rounded-[3px] border border-neutral-200"
                      />
                      <div>
                        <div className="font-semibold text-neutral-900">{u.name}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-[2px] ${
                      u.role === 'FC' 
                        ? 'bg-emerald-100 text-emerald-900' 
                        : u.role === 'PO'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-neutral-200 text-neutral-800'
                    }`}>
                      {u.role === 'FC' ? 'Finance Controller (FC)' : u.role === 'PO' ? 'Policy Owner (PO)' : 'System Admin'}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-neutral-600 font-medium">
                    {u.department}
                  </td>

                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                      u.status === 'active' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                      {u.status === 'active' ? 'Active' : 'REVOKED'}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px] text-neutral-500">
                    {formatDateTime(u.lastLogin)}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleUserStatus(u)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-[3px] transition-colors ${
                        u.status === 'active'
                          ? 'border border-rose-300 text-rose-700 hover:bg-rose-50'
                          : 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {u.status === 'active' ? 'Revoke Access' : 'Reinstate User'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: System Limits & Config */}
      {activeTab === 'LIMITS' && (
        <form onSubmit={handleSaveLimits} className="bg-white border border-[#E5E5E3] rounded-[4px] p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
                Deterministic Engine Parameters & Constraints
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Calibrate ingestion file sizes, confidence thresholds, and precedence hierarchies.
              </p>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-[#111315] hover:bg-[#202326] text-white text-xs font-semibold rounded-[4px] flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save Limits Configuration
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Maximum Policy PDF Document Size (MB)
              </label>
              <input
                type="number"
                min={5}
                max={100}
                value={limits.maxPdfSizeMb}
                onChange={e => setLimits({ ...limits, maxPdfSizeMb: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono text-neutral-900 border border-neutral-300 rounded-[4px]"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Prevents denial-of-service through oversized contract documents.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                AST Auto-Extraction Confidence Threshold (%)
              </label>
              <input
                type="number"
                min={50}
                max={99}
                value={limits.autoExtractConfidenceThreshold * 100}
                onChange={e => setLimits({ ...limits, autoExtractConfidenceThreshold: Number(e.target.value) / 100 })}
                className="w-full px-3 py-2 text-xs font-mono text-neutral-900 border border-neutral-300 rounded-[4px]"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Clauses below this confidence are flagged with ambiguity warnings in Maker-Checker queue.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Historical Replay Simulation Sample Size
              </label>
              <input
                type="number"
                min={50}
                max={5000}
                value={limits.replaySampleSize}
                onChange={e => setLimits({ ...limits, replaySampleSize: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono text-neutral-900 border border-neutral-300 rounded-[4px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Claim Incurrence Filing Window (Days)
              </label>
              <input
                type="number"
                min={30}
                max={365}
                value={limits.claimFilingWindowDays}
                onChange={e => setLimits({ ...limits, claimFilingWindowDays: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono text-neutral-900 border border-neutral-300 rounded-[4px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              Deterministic Precedence Hierarchy Resolution Sequence
            </label>
            <div className="space-y-1.5 font-mono text-xs">
              {limits.precedenceHierarchy.map((tier: string, idx: number) => (
                <div key={idx} className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-[3px] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-[10px] text-neutral-700">
                      0{idx + 1}
                    </span>
                    <span className="font-semibold text-neutral-900">{tier}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 uppercase">
                    {idx === 0 ? 'Highest Priority (Suppresses all)' : idx === limits.precedenceHierarchy.length - 1 ? 'Default Fallback' : 'Mid Tier'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* Tab: Engine Health */}
      {activeTab === 'HEALTH' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-[#E5E5E3] p-5 rounded-[4px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono uppercase text-neutral-500">Adjudication Engine</span>
              <span className="w-2 h-2 rounded-full bg-[#65A30D] animate-ping" />
            </div>
            <div className="text-2xl font-bold font-mono text-neutral-900">HEALTHY</div>
            <div className="text-[11px] text-neutral-500 font-mono space-y-1">
              <div>AST Runtime Latency: <strong>14ms</strong></div>
              <div>Deterministic Uptime: <strong>99.99%</strong></div>
            </div>
          </div>

          <div className="bg-white border border-[#E5E5E3] p-5 rounded-[4px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono uppercase text-neutral-500">Audit Vault Ledger</span>
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-neutral-900">VERIFIED</div>
            <div className="text-[11px] text-neutral-500 font-mono space-y-1">
              <div>Cryptographic Checksum: OK</div>
              <div>FIPS 140-2 Invariants: OK</div>
            </div>
          </div>

          <div className="bg-white border border-[#E5E5E3] p-5 rounded-[4px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono uppercase text-neutral-500">NLP AST Mining Pipeline</span>
              <Activity className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-neutral-900">ONLINE</div>
            <div className="text-[11px] text-neutral-500 font-mono space-y-1">
              <div>Active Queues: 1 Running</div>
              <div>Token Processing: Normal</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
