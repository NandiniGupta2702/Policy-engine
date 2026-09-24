import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  History, 
  Eye, 
  CheckSquare, 
  Clock, 
  ChevronRight, 
  SlidersHorizontal,
  ArrowUpDown,
  Building,
  Globe
} from 'lucide-react';
import { User, Policy, PolicyStatus } from '../../types';
import { PolicyOSApiClient } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { StatusBadge } from '../ui/StatusBadge';
import { useToast } from '../ui/Toast';

interface PoliciesScreenProps {
  currentUser: User;
  onNavigate: (screen: string, params?: any) => void;
}

export const PoliciesScreen: React.FC<PoliciesScreenProps> = ({ currentUser, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY' | 'LIVE' | 'PROPOSED' | 'ARCHIVED' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'title' | 'version' | 'updatedAt'>('updatedAt');
  const [sortAsc, setSortAsc] = useState(false);
  const toast = useToast();

  const allPolicies = PolicyOSApiClient.getPolicies();

  // Filter policies based on tab, role, jurisdiction, search
  const filteredPolicies = allPolicies.filter(policy => {
    // If PO role and tab is 'MY', show own
    if (currentUser.role === 'PO' && activeTab === 'MY' && policy.ownerId !== currentUser.id) {
      return false;
    }
    // Status tab filter
    if (activeTab === 'LIVE' && policy.status !== 'LIVE') return false;
    if (activeTab === 'PROPOSED' && policy.status !== 'PROPOSED') return false;
    if (activeTab === 'ARCHIVED' && policy.status !== 'ARCHIVED') return false;
    if (activeTab === 'FAILED' && policy.status !== 'FAILED') return false;

    // Jurisdiction filter
    if (jurisdictionFilter !== 'ALL' && policy.jurisdiction !== jurisdictionFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = policy.title.toLowerCase().includes(q);
      const matchCode = policy.code.toLowerCase().includes(q);
      const matchOwner = policy.ownerName.toLowerCase().includes(q);
      const matchSummary = policy.summary.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchOwner && !matchSummary) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortField === 'title') {
      return sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    }
    if (sortField === 'version') {
      return sortAsc ? a.version.localeCompare(b.version) : b.version.localeCompare(a.version);
    }
    return sortAsc ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime() : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleDownload = (policy: Policy) => {
    toast.success('Download Initiated', `Downloading ${policy.sourceFileName}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E3]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Policy Source Documents & AST Registry
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Enterprise policy documents ingested for deterministic extraction, clause segmentation, and version control.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('upload')}
            className="px-3.5 py-2 bg-[#111315] hover:bg-[#202326] text-white text-xs font-semibold rounded-[4px] flex items-center gap-2 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#9EF01A]" />
            Upload New Policy
          </button>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Interactive Segmented Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-200/60 rounded-[4px] text-xs font-medium text-neutral-600">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-[3px] transition-colors ${
              activeTab === 'ALL' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            All ({allPolicies.length})
          </button>
          <button
            onClick={() => setActiveTab('MY')}
            className={`px-3 py-1.5 rounded-[3px] transition-colors ${
              activeTab === 'MY' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            My Policies
          </button>
          <button
            onClick={() => setActiveTab('LIVE')}
            className={`px-3 py-1.5 rounded-[3px] transition-colors ${
              activeTab === 'LIVE' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            Live ({allPolicies.filter(p => p.status === 'LIVE').length})
          </button>
          <button
            onClick={() => setActiveTab('PROPOSED')}
            className={`px-3 py-1.5 rounded-[3px] transition-colors ${
              activeTab === 'PROPOSED' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            Proposed ({allPolicies.filter(p => p.status === 'PROPOSED').length})
          </button>
          <button
            onClick={() => setActiveTab('ARCHIVED')}
            className={`px-3 py-1.5 rounded-[3px] transition-colors ${
              activeTab === 'ARCHIVED' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            Archived
          </button>
          <button
            onClick={() => setActiveTab('FAILED')}
            className={`px-3 py-1.5 rounded-[3px] transition-colors ${
              activeTab === 'FAILED' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            Failed ({allPolicies.filter(p => p.status === 'FAILED').length})
          </button>
        </div>

        {/* Search & Jurisdiction Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter policies, codes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs text-neutral-900 bg-white border border-neutral-300 rounded-[4px] outline-none focus:border-neutral-900 w-48 sm:w-60"
            />
          </div>

          <select
            value={jurisdictionFilter}
            onChange={e => setJurisdictionFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs text-neutral-700 bg-white border border-neutral-300 rounded-[4px] outline-none focus:border-neutral-900"
          >
            <option value="ALL">All Jurisdictions</option>
            <option value="GLOBAL">Global</option>
            <option value="IN">India (IN)</option>
            <option value="APAC">APAC</option>
            <option value="US">United States</option>
          </select>
        </div>
      </div>

      {/* Policies Data Table */}
      <div className="bg-white border border-[#E5E5E3] rounded-[4px] overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E5E3] bg-[#FDFDFD] text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              <th className="py-3 px-4 font-semibold">Policy Name & Code</th>
              <th className="py-3 px-3 font-semibold">Version</th>
              <th className="py-3 px-3 font-semibold">Owner</th>
              <th className="py-3 px-3 font-semibold">Jurisdiction / Scope</th>
              <th className="py-3 px-3 font-semibold">Rules Mined</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold">Effective Date</th>
              <th className="py-3 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E3] text-xs">
            {filteredPolicies.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-neutral-500">
                  <FileText className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <div className="font-semibold text-neutral-800">No policy documents found</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Try adjusting your filters or upload a new policy.</div>
                </td>
              </tr>
            ) : (
              filteredPolicies.map(p => (
                <tr 
                  key={p.id}
                  className="hover:bg-[#F9FAFB] transition-colors group cursor-pointer"
                  onClick={() => onNavigate('policy_detail', { policyId: p.id, policyCode: p.code })}
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-neutral-900 group-hover:text-neutral-950 flex items-center gap-2">
                      <span>{p.title}</span>
                    </div>
                    <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
                      {p.code} · {p.sourceFileName} ({p.sourceFileSize})
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono font-medium text-neutral-700">
                    {p.version}
                  </td>

                  <td className="py-3 px-3 text-neutral-700">
                    <div className="font-medium text-neutral-900">{p.ownerName}</div>
                    <div className="text-[11px] text-neutral-500 truncate max-w-[140px]">{p.department}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono text-xs font-semibold text-neutral-800">
                      {p.jurisdiction}
                    </span>
                    <div className="text-[11px] text-neutral-500 truncate max-w-[120px]">{p.department}</div>
                  </td>

                  <td className="py-3 px-3 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-neutral-900 tabular-nums">{p.extractedRulesCount}</span>
                      <span className="text-[11px] text-neutral-500">
                        ({p.approvedRulesCount} appv / {p.candidateRulesCount} cand)
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <StatusBadge status={p.status} type="policy" />
                  </td>

                  <td className="py-3 px-3 font-mono text-neutral-600">
                    {formatDate(p.effectiveFrom)}
                  </td>

                  <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onNavigate('policy_detail', { policyId: p.id, policyCode: p.code })}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-[3px] transition-colors"
                        title="View Document & AST Clauses"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onNavigate('version_history', { policyId: p.id })}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-[3px] transition-colors"
                        title="View Version Lineage & Diff"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDownload(p)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-[3px] transition-colors"
                        title="Download Source Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Table Footer */}
        <div className="py-2.5 px-4 bg-[#FDFDFD] border-t border-[#E5E5E3] flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span>Showing {filteredPolicies.length} of {allPolicies.length} policy documents</span>
          <span>Only approved rules execute in claims evaluation</span>
        </div>
      </div>
    </div>
  );
};
