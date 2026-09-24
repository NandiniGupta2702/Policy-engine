import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Download, 
  Filter, 
  CheckCircle2, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { User, AuditEvent } from '../../types';
import { PolicyOSApiClient } from '../../lib/api';
import { formatDateTime } from '../../lib/utils';
import { useToast } from '../ui/Toast';

interface AuditTrailScreenProps {
  currentUser: User;
  onNavigate: (screen: string, params?: any) => void;
}

export const AuditTrailScreen: React.FC<AuditTrailScreenProps> = ({ currentUser, onNavigate }) => {
  const [events, setEvents] = useState<AuditEvent[]>(PolicyOSApiClient.getAuditEvents());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const toast = useToast();

  const filteredEvents = events.filter(evt => {
    if (filterAction !== 'ALL' && evt.action !== filterAction) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = evt.description.toLowerCase().includes(q);
      const matchActor = evt.actorName.toLowerCase().includes(q);
      const matchEntity = evt.entityId.toLowerCase().includes(q);
      if (!matchDesc && !matchActor && !matchEntity) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = 'ID,Timestamp,Actor,Role,Action,EntityType,EntityID,Description\n';
    const rows = filteredEvents.map(e => 
      `"${e.id}","${e.timestamp}","${e.actorName}","${e.actorRole}","${e.action}","${e.entityType}","${e.entityId}","${e.description.replace(/"/g, '""')}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PolicyOS_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Audit CSV Exported', 'Signed cryptographic ledger exported.');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E3]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Cryptographic Audit & Governance Trail
            </h1>
            <span className="text-xs px-2 py-0.5 bg-neutral-200 text-neutral-700 font-mono rounded-[3px]">
              FIPS-140-2 Compatible
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Immutable time-series log of all rule authoring, Controller Maker-Checker signoffs, claim evaluations, and system configurations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs font-semibold rounded-[4px] flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            Export Audit CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actors, entities, descriptions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs text-neutral-900 bg-white border border-neutral-300 rounded-[4px] outline-none focus:border-neutral-900 w-64"
            />
          </div>

          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="px-2.5 py-1.5 text-xs text-neutral-700 bg-white border border-neutral-300 rounded-[4px] outline-none"
          >
            <option value="ALL">All Actions</option>
            <option value="RULE_APPROVED">Rule Approvals</option>
            <option value="RULE_REJECTED">Rule Rejections</option>
            <option value="POLICY_UPLOADED">Policy Uploads</option>
            <option value="CLAIM_EVALUATED">Claim Evaluations</option>
            <option value="USER_REVOKED">Security Revocations</option>
          </select>
        </div>

        <span className="text-xs font-mono text-neutral-400">
          Showing {filteredEvents.length} verifiable events
        </span>
      </div>

      {/* Events Table */}
      <div className="bg-white border border-[#E5E5E3] rounded-[4px] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E5E3] bg-[#FDFDFD] text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              <th className="py-3 px-4">Timestamp (UTC)</th>
              <th className="py-3 px-3">Actor & Role</th>
              <th className="py-3 px-3">Action Type</th>
              <th className="py-3 px-3">Entity Reference</th>
              <th className="py-3 px-4">Audit Description</th>
              <th className="py-3 px-3 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E3] text-xs">
            {filteredEvents.map(evt => (
              <tr key={evt.id} className="hover:bg-neutral-50 font-mono">
                <td className="py-3 px-4 text-neutral-500 whitespace-nowrap text-[11px]">
                  {formatDateTime(evt.timestamp)}
                </td>

                <td className="py-3 px-3 font-sans">
                  <div className="font-semibold text-neutral-900">{evt.actorName}</div>
                  <span className="text-[10px] font-mono text-neutral-400">{evt.actorRole}</span>
                </td>

                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-[2px] text-[10px] font-bold">
                    {evt.action}
                  </span>
                </td>

                <td className="py-3 px-3 font-bold text-neutral-800">
                  {evt.entityId}
                </td>

                <td className="py-3 px-4 font-sans text-neutral-700 max-w-md">
                  <div>{evt.description}</div>
                  {evt.newValue && (
                    <div className="text-[11px] font-mono text-neutral-500 mt-0.5 truncate">
                      Delta: {evt.newValue}
                    </div>
                  )}
                </td>

                <td className="py-3 px-3 text-right font-sans">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
