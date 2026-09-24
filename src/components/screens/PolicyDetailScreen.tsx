import React, { useState } from 'react';
import { 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Download, 
  CheckSquare, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  ArrowRight,
  ExternalLink,
  Layers,
  ShieldCheck,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { User, Policy, CandidateRule } from '../../types';
import { PolicyOSApiClient } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { StatusBadge, ComparatorTag } from '../ui/StatusBadge';
import { useToast } from '../ui/Toast';

interface PolicyDetailScreenProps {
  currentUser: User;
  policyId?: string;
  onNavigate: (screen: string, params?: any) => void;
}

export const PolicyDetailScreen: React.FC<PolicyDetailScreenProps> = ({ currentUser, policyId, onNavigate }) => {
  const policies = PolicyOSApiClient.getPolicies();
  const rules = PolicyOSApiClient.getRules();
  const toast = useToast();

  const policy = policies.find(p => p.id === policyId) || policies[0];
  const policyRules = rules.filter(r => r.policyId === policy?.id);

  const [activePage, setActivePage] = useState(3);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(null);

  if (!policy) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-base font-semibold text-neutral-800">Policy Not Found</h2>
        <button
          onClick={() => onNavigate('policies')}
          className="mt-3 px-3 py-1.5 bg-[#111315] text-white text-xs rounded-[4px]"
        >
          Return to Policies
        </button>
      </div>
    );
  }

  const activeClause = policy.documentClauses.find(c => c.pageNumber === activePage) || policy.documentClauses[0];

  return (
    <div className="h-full flex flex-col bg-[#F8F9FA]">
      {/* Top Action Bar */}
      <div className="h-14 bg-white border-b border-[#E5E5E3] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('policies')}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-[3px] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-neutral-900">{policy.title}</span>
              <span className="font-mono text-[11px] text-neutral-500">{policy.code}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-neutral-100 text-neutral-600 rounded-[2px]">
                {policy.version}
              </span>
              <StatusBadge status={policy.status} type="policy" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('rule_review', { policyId: policy.id })}
            className="px-3 py-1.5 bg-[#111315] hover:bg-[#202326] text-white text-xs font-semibold rounded-[4px] flex items-center gap-1.5 transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
            Review Mined Rules ({policyRules.filter(r => r.status === 'CANDIDATE').length} Pending)
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Doc Preview / Right Metadata & Extracted Rules */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left: Source Document AST Preview (7 cols) */}
        <div className="lg:col-span-7 border-r border-[#E5E5E3] flex flex-col bg-[#F1F3F5] overflow-hidden">
          {/* Document Toolbar */}
          <div className="h-10 bg-white border-b border-[#E5E5E3] px-4 flex items-center justify-between text-xs text-neutral-600 shrink-0">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-neutral-400">{policy.sourceFileName}</span>
              <span>·</span>
              <span>Page {activePage} of {policy.sourceFilePages}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActivePage(prev => Math.max(1, prev - 1))}
                disabled={activePage <= 1}
                className="p-1 hover:bg-neutral-100 rounded disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActivePage(prev => Math.min(policy.sourceFilePages, prev + 1))}
                disabled={activePage >= policy.sourceFilePages}
                className="p-1 hover:bg-neutral-100 rounded disabled:opacity-30"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="h-3 w-px bg-neutral-200 mx-1" />

              <button
                onClick={() => setZoomLevel(prev => Math.max(80, prev - 10))}
                className="p-1 hover:bg-neutral-100 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono w-10 text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(140, prev + 10))}
                className="p-1 hover:bg-neutral-100 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Document Page Viewport */}
          <div className="flex-1 overflow-y-auto p-6 flex justify-center">
            <div 
              className="bg-white border border-[#D1D5DB] rounded-[3px] shadow-sm p-10 max-w-2xl w-full min-h-[680px] transition-transform duration-150 origin-top"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              <div className="border-b border-neutral-200 pb-3 mb-6 flex justify-between items-center text-xs font-mono text-neutral-400">
                <span>{policy.code} · OFFICIAL CORPORATE POLICY</span>
                <span>PAGE {activePage}</span>
              </div>

              {/* Document Header */}
              <div className="mb-6">
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  {policy.jurisdiction} JURISDICTION · {policy.department}
                </div>
                <h2 className="text-base font-bold text-neutral-900 mt-1">
                  {policy.title}
                </h2>
                <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                  Effective Date: {formatDate(policy.effectiveFrom)} · Version {policy.version}
                </div>
              </div>

              {/* Render Document Clauses */}
              <div className="space-y-6 text-xs text-neutral-700 leading-relaxed font-sans">
                {policy.documentClauses.map(clause => {
                  const isHighlighted = clause.pageNumber === activePage || selectedClauseId === clause.id;

                  return (
                    <div
                      key={clause.id}
                      onClick={() => {
                        setSelectedClauseId(clause.id);
                        setActivePage(clause.pageNumber);
                      }}
                      className={`p-3.5 rounded-[4px] border transition-all cursor-pointer ${
                        isHighlighted 
                          ? 'bg-[#FEFCE8] border-[#FDE047] shadow-xs' 
                          : 'border-transparent hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-bold text-neutral-900 text-[11px]">
                          {clause.sectionCode}: {clause.heading}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-neutral-400">
                            Page {clause.pageNumber}
                          </span>
                          {clause.highlightCategory && (
                            <ComparatorTag comparator={clause.highlightCategory} />
                          )}
                        </div>
                      </div>
                      <p className="text-neutral-800 leading-relaxed">
                        {clause.text}
                      </p>
                      {clause.linkedRuleId && (
                        <div className="mt-2 pt-1.5 border-t border-amber-200/60 flex items-center justify-between text-[10px] font-mono text-amber-800">
                          <span>Synthesized into Rule: {clause.linkedRuleId}</span>
                          <span className="font-semibold text-neutral-900">Click to inspect</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Simulated boilerplate text */}
                <div className="pt-6 border-t border-neutral-100 text-[11px] text-neutral-400 space-y-2">
                  <p>
                    Non-compliance with established policy thresholds will necessitate escalation to the Corporate Controller. Reimbursements claimed outside the designated expense window are subject to forfeiture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Metadata, Extracted Rules, Impact Summary (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-white overflow-y-auto p-6 space-y-6">
          {/* Metadata Card */}
          <div>
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono mb-3">
              Policy Architecture Metadata
            </h3>
            <div className="bg-neutral-50 border border-neutral-200 p-3.5 rounded-[4px] space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-200/60">
                <span className="text-neutral-500 font-mono">Owner / Department</span>
                <span className="font-semibold text-neutral-900">{policy.ownerName} ({policy.department})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200/60">
                <span className="text-neutral-500 font-mono">Territory / Jurisdiction</span>
                <span className="font-mono font-semibold text-neutral-900">{policy.jurisdiction}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200/60">
                <span className="text-neutral-500 font-mono">Precedence Level</span>
                <span className="font-mono font-semibold text-neutral-900">
                  {policy.jurisdiction === 'IN' ? 'REGIONAL_ANNEXURE (Priority)' : 'GLOBAL_ENTERPRISE_STANDARD'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-500 font-mono">Source Ingestion</span>
                <span className="font-mono text-neutral-700">{formatDate(policy.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Extracted Rules List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
                Extracted Deterministic Rules ({policyRules.length})
              </h3>
              <span className="text-[11px] font-mono text-neutral-400">
                Maker-Checker Separation
              </span>
            </div>

            <div className="space-y-3">
              {policyRules.map(rule => (
                <div
                  key={rule.id}
                  onClick={() => onNavigate('rule_review', { ruleId: rule.id })}
                  className="p-3.5 border border-neutral-200 hover:border-neutral-400 rounded-[4px] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-900 group-hover:text-neutral-950">
                        {rule.ruleCode}
                      </span>
                      <ComparatorTag comparator={rule.comparator} />
                    </div>
                    <StatusBadge status={rule.status} type="rule" />
                  </div>

                  <div className="text-xs font-semibold text-neutral-800">
                    {rule.title}
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-1 line-clamp-2">
                    {rule.naturalLanguageSummary}
                  </p>

                  <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                    <span>Source: {rule.sourceClause.section} (p. {rule.sourceClause.page})</span>
                    <span className="flex items-center gap-1 font-semibold text-neutral-800">
                      Inspect Rule
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conflict Warnings Summary */}
          <div>
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono mb-3">
              Conflict & Precedence Analysis
            </h3>
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-[4px] text-xs space-y-2">
              <div className="flex items-start gap-2 text-neutral-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900">Precedence Engine Active:</strong> Local jurisdiction rules (e.g. India INR Ceilings) suppress broader Global USD standards automatically during claim evaluation.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
