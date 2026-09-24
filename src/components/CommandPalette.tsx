import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  CheckSquare, 
  SlidersHorizontal, 
  FileCheck, 
  RotateCcw, 
  ShieldAlert, 
  Settings, 
  UserCheck, 
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';
import { PolicyOSApiClient } from '../lib/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string, params?: any) => void;
  onSwitchRole: (role: 'FC' | 'PO' | 'ADMIN') => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSwitchRole
}) => {
  const [query, setQuery] = useState('');
  const [policies, setPolicies] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPolicies(PolicyOSApiClient.getPolicies());
      setRules(PolicyOSApiClient.getRules());
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPolicies = policies.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    p.code.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredRules = rules.filter(r => 
    r.title.toLowerCase().includes(query.toLowerCase()) || 
    r.ruleCode.toLowerCase().includes(query.toLowerCase()) ||
    r.naturalLanguageSummary.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const handleAction = (cb: () => void) => {
    cb();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#FFFFFF] border border-[#E5E5E3] rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-[#E5E5E3] gap-3 bg-[#FDFDFD]">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search policies, rules, claims..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-sm text-[#191919] placeholder:text-neutral-400 bg-transparent outline-none font-medium"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-mono font-medium text-neutral-400 bg-neutral-100 border border-neutral-200 rounded-[3px]">
            ESC
          </kbd>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          <div>
            <div className="px-3 py-1 text-[11px] font-mono tracking-wider uppercase text-neutral-400">
              Quick Navigation
            </div>
            <div className="mt-1 space-y-0.5">
              <button
                onClick={() => handleAction(() => onNavigate('dashboard'))}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-xs text-neutral-700 hover:bg-[#F3F4F6] rounded-[4px] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
                  <span className="font-medium text-neutral-900">Dashboard & Metrics</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                onClick={() => handleAction(() => onNavigate('rule_review'))}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-xs text-neutral-700 hover:bg-[#F3F4F6] rounded-[4px] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-neutral-900">Maker-Checker Rule Review</span>
                </div>
                <span className="text-[11px] text-amber-700 font-mono">Candidate Queue</span>
              </button>

              <button
                onClick={() => handleAction(() => onNavigate('upload'))}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-xs text-neutral-700 hover:bg-[#F3F4F6] rounded-[4px] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-neutral-500" />
                  <span className="font-medium text-neutral-900">Upload New Policy (PDF / Doc)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                onClick={() => handleAction(() => onNavigate('claims'))}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-xs text-neutral-700 hover:bg-[#F3F4F6] rounded-[4px] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-lime-700" />
                  <span className="font-medium text-neutral-900">Evaluate Claim Deterministically</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                onClick={() => handleAction(() => onNavigate('replay'))}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-xs text-neutral-700 hover:bg-[#F3F4F6] rounded-[4px] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-neutral-500" />
                  <span className="font-medium text-neutral-900">Replay Lab (Corpus Simulation)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>
          </div>

          {/* Search Results - Policies */}
          {filteredPolicies.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-mono tracking-wider uppercase text-neutral-400">
                Policies ({filteredPolicies.length})
              </div>
              <div className="mt-1 space-y-0.5">
                {filteredPolicies.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleAction(() => onNavigate('policy_detail', { policyId: p.id }))}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-[#F3F4F6] rounded-[4px] transition-colors"
                  >
                    <div>
                      <div className="font-medium text-neutral-900">{p.title}</div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        {p.code} · {p.version} · {p.jurisdiction}
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">View Doc & Rules</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results - Rules */}
          {filteredRules.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-mono tracking-wider uppercase text-neutral-400">
                Candidate & Approved Rules ({filteredRules.length})
              </div>
              <div className="mt-1 space-y-0.5">
                {filteredRules.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleAction(() => onNavigate('rule_review', { ruleId: r.id }))}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-[#F3F4F6] rounded-[4px] transition-colors"
                  >
                    <div>
                      <div className="font-medium text-neutral-900">{r.title}</div>
                      <div className="text-[11px] text-neutral-500 truncate max-w-md mt-0.5">
                        {r.naturalLanguageSummary}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">{r.ruleCode}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Role Switching */}
          <div>
            <div className="px-3 py-1 text-[11px] font-mono tracking-wider uppercase text-neutral-400">
              Switch Test Role (Interactive Governance)
            </div>
            <div className="mt-1 grid grid-cols-3 gap-1.5 px-2">
              <button
                onClick={() => handleAction(() => onSwitchRole('FC'))}
                className="flex items-center gap-2 p-2 border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 rounded-[4px] text-left transition-colors"
              >
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-neutral-900">Finance Controller</div>
                  <div className="text-[10px] text-neutral-500">Approve / Reject</div>
                </div>
              </button>

              <button
                onClick={() => handleAction(() => onSwitchRole('PO'))}
                className="flex items-center gap-2 p-2 border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 rounded-[4px] text-left transition-colors"
              >
                <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-neutral-900">Policy Owner</div>
                  <div className="text-[10px] text-neutral-500">Upload & Propose</div>
                </div>
              </button>

              <button
                onClick={() => handleAction(() => onSwitchRole('ADMIN'))}
                className="flex items-center gap-2 p-2 border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 rounded-[4px] text-left transition-colors"
              >
                <Settings className="w-4 h-4 text-neutral-700 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-neutral-900">System Admin</div>
                  <div className="text-[10px] text-neutral-500">Limits & Users</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#F8F9FA] border-t border-[#E5E5E3] text-[11px] text-neutral-500 flex items-center justify-between">
          <span>AI extracts rules · Finance Controllers decide · Engine deterministically executes</span>
          <span className="font-mono">PolicyOS v2.4</span>
        </div>
      </div>
    </div>
  );
};
