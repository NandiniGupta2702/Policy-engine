import React, { useState } from 'react';
import { 
  History, 
  GitBranch, 
  GitCommit, 
  ArrowRight, 
  CheckCircle2, 
  Archive, 
  ChevronRight, 
  Layers, 
  FileText,
  ShieldCheck
} from 'lucide-react';
import { User, Policy } from '../../types';
import { PolicyOSApiClient } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { StatusBadge, ComparatorTag } from '../ui/StatusBadge';

interface VersionHistoryScreenProps {
  currentUser: User;
  policyId?: string;
  onNavigate: (screen: string, params?: any) => void;
}

export const VersionHistoryScreen: React.FC<VersionHistoryScreenProps> = ({ currentUser, policyId, onNavigate }) => {
  const policies = PolicyOSApiClient.getPolicies();
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(policyId || policies[0]?.id || '');

  const policy = policies.find(p => p.id === selectedPolicyId) || policies[0];

  // Simulated version timeline history
  const versions = [
    {
      version: 'v2.4',
      status: 'LIVE',
      effectiveDate: '2026-01-01',
      author: 'Sarah Jenkins (FC)',
      changeSummary: 'Lodging cap calibrated to $220. Mandatory VAT itemization enforced.',
      ruleDeltas: [
        { code: 'RUL-TRV-101', title: 'Global Lodging Cap', type: 'MODIFIED', detail: 'Increased cap from $200 to $220/night' },
        { code: 'RUL-TRV-104', title: 'Tax Invoice Itemization Requirement', type: 'ADDED', detail: 'Missing receipts trigger CLARIFY state instead of reject' }
      ]
    },
    {
      version: 'v2.0',
      status: 'ARCHIVED',
      effectiveDate: '2025-06-01',
      author: 'Alex Chen (PO)',
      changeSummary: 'Flight class entitlement revised to Premium Economy over 6 hours.',
      ruleDeltas: [
        { code: 'RUL-TRV-102', title: 'Flight Cabin Entitlement', type: 'MODIFIED', detail: 'Flight entitlement strictly Economy unless duration > 6.0h' }
      ]
    },
    {
      version: 'v1.0',
      status: 'ARCHIVED',
      effectiveDate: '2024-01-01',
      author: 'System Initial Seed',
      changeSummary: 'Initial policy baseline extraction into deterministic AST.',
      ruleDeltas: [
        { code: 'RUL-TRV-090', title: 'Initial Corporate Travel Standard', type: 'ADDED', detail: 'Initial 6 baseline rules' }
      ]
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E3]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Policy Version Lineage & Immutability Ledger
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Approved policies are cryptographically immutable. Creating or approving a newer policy version archives the predecessor—historical evaluations remain permanently locked to their incurrence version.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPolicyId}
            onChange={e => setSelectedPolicyId(e.target.value)}
            className="px-3 py-1.5 text-xs text-neutral-900 border border-neutral-300 rounded-[4px] bg-white font-mono"
          >
            {policies.map(p => (
              <option key={p.id} value={p.id}>
                {p.code}: {p.title} ({p.version})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Timeline & Diff */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Version Timeline (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E5E5E3] rounded-[4px] p-5 space-y-6">
          <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
            Lineage Timeline
          </h2>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
            {versions.map((ver, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-white ${
                  ver.status === 'LIVE' ? 'border-[#65A30D] text-[#65A30D]' : 'border-neutral-400 text-neutral-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${ver.status === 'LIVE' ? 'bg-[#65A30D]' : 'bg-neutral-400'}`} />
                </div>

                <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-[4px] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-neutral-900">{ver.version}</span>
                    <StatusBadge status={ver.status} type="policy" />
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    Effective: {ver.effectiveDate}
                  </div>
                  <div className="text-neutral-800 font-medium pt-1">
                    {ver.changeSummary}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono pt-1 border-t border-neutral-200">
                    Adjudicated by {ver.author}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-neutral-100 rounded-[4px] border border-neutral-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-neutral-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Immutable Ledger Principle</span>
            </div>
            <p className="text-[11px] text-neutral-600">
              Past claims filed during v1.0 will FOREVER evaluate against v1.0 rules, ensuring 100% legal audit reproducibility.
            </p>
          </div>
        </div>

        {/* Right: Side-by-Side Version Diff (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E5E5E3] rounded-[4px] p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
                Side-by-Side Rule AST Diff: v2.0 vs v2.4 (Current Live)
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Exact delta of extracted deterministic comparators between policy revisions.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#E8F8CE] text-[#235805] rounded-[2px]">
              +1 Rule Added · 1 Rule Modified
            </span>
          </div>

          {/* Diff Grid */}
          <div className="space-y-4">
            {/* Diff 1 */}
            <div className="border border-neutral-200 rounded-[4px] overflow-hidden text-xs">
              <div className="p-2.5 bg-[#FDFDFD] border-b border-neutral-200 flex items-center justify-between font-mono">
                <span className="font-bold text-neutral-900">RUL-TRV-101: Global Lodging Cap</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-900 rounded-[2px] font-bold">
                  MODIFIED
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 font-mono text-[11px]">
                <div className="p-3.5 bg-rose-50/40 text-neutral-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-rose-800">v2.0 (Archived)</div>
                  <div className="line-through text-rose-900 font-medium">Cap: $200.00 USD / night</div>
                  <div className="text-[10px] text-neutral-500">
                    AST: ASSERT line_item.amount_per_night &lt;= 200.00
                  </div>
                </div>
                <div className="p-3.5 bg-emerald-50/40 text-neutral-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-emerald-800">v2.4 (Live Engine)</div>
                  <div className="text-emerald-900 font-bold">Cap: $220.00 USD / night</div>
                  <div className="text-[10px] text-neutral-500">
                    AST: ASSERT line_item.amount_per_night &lt;= 220.00
                  </div>
                </div>
              </div>
            </div>

            {/* Diff 2 */}
            <div className="border border-neutral-200 rounded-[4px] overflow-hidden text-xs">
              <div className="p-2.5 bg-[#FDFDFD] border-b border-neutral-200 flex items-center justify-between font-mono">
                <span className="font-bold text-neutral-900">RUL-TRV-104: Tax Invoice Itemization</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-900 rounded-[2px] font-bold">
                  NEW IN v2.4
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 font-mono text-[11px]">
                <div className="p-3.5 bg-neutral-50 text-neutral-400 italic">
                  Not present in v2.0
                </div>
                <div className="p-3.5 bg-emerald-50/40 text-neutral-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-emerald-800">v2.4 (Live Engine)</div>
                  <div className="text-neutral-900 font-medium">Comparator: DOC_REQUIREMENT</div>
                  <div className="text-[10px] text-neutral-500">
                    Missing invoice returns CLARIFY status; prevents unfair rejection.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
