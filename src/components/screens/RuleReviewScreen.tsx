import React, { useState } from 'react';
import { 
  CheckSquare, 
  XSquare, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  Clock, 
  TrendingDown, 
  Calendar,
  AlertCircle,
  ChevronRight,
  Filter
} from 'lucide-react';
import { User, CandidateRule, RuleStatus } from '../../types';
import { PolicyOSApiClient } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { StatusBadge, ComparatorTag } from '../ui/StatusBadge';
import { useToast } from '../ui/Toast';

interface RuleReviewScreenProps {
  currentUser: User;
  ruleId?: string;
  onNavigate: (screen: string, params?: any) => void;
}

export const RuleReviewScreen: React.FC<RuleReviewScreenProps> = ({ currentUser, ruleId, onNavigate }) => {
  const [rules, setRules] = useState<CandidateRule[]>(PolicyOSApiClient.getRules());
  const [selectedRuleId, setSelectedRuleId] = useState<string>(ruleId || rules[0]?.id || '');
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('CANDIDATE');

  // Modal states for single action
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('AMBIGUOUS_SYNTAX');
  const [rejectionNote, setRejectionNote] = useState('');

  // Bulk modal state
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');

  const toast = useToast();

  const isFC = currentUser.role === 'FC' || currentUser.role === 'ADMIN';

  const filteredRules = rules.filter(r => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const activeRule = rules.find(r => r.id === selectedRuleId) || filteredRules[0] || rules[0];

  const handleApprove = () => {
    if (!isFC) {
      toast.error('Maker-Checker Violation', 'Only Finance Controllers are authorized to approve candidate rules.');
      return;
    }

    try {
      const updated = PolicyOSApiClient.approveRule(activeRule.id, effectiveDate);
      setRules(PolicyOSApiClient.getRules());
      setApproveModalOpen(false);
      toast.success('Rule Approved & Activated', `${updated.ruleCode} is now active in deterministic claims evaluation.`);
    } catch (err: any) {
      toast.error('Approval Failed', err.message);
    }
  };

  const handleReject = () => {
    if (!isFC) {
      toast.error('Maker-Checker Violation', 'Only Finance Controllers are authorized to reject candidate rules.');
      return;
    }

    try {
      const updated = PolicyOSApiClient.rejectRule(activeRule.id, rejectionReason, rejectionNote);
      setRules(PolicyOSApiClient.getRules());
      setRejectModalOpen(false);
      toast.info('Rule Rejected', `${updated.ruleCode} rejected: ${rejectionReason}`);
    } catch (err: any) {
      toast.error('Rejection Failed', err.message);
    }
  };

  const handleBulkAction = () => {
    if (!isFC) {
      toast.error('Maker-Checker Violation', 'Only Finance Controllers can perform bulk approvals.');
      return;
    }

    try {
      const { updatedCount, skippedCount } = PolicyOSApiClient.bulkReviewRules(
        selectedRuleIds,
        bulkAction,
        {
          effectiveDate,
          reason: rejectionReason,
          note: rejectionNote
        }
      );
      setRules(PolicyOSApiClient.getRules());
      setSelectedRuleIds([]);
      setBulkModalOpen(false);
      toast.success(
        `Bulk ${bulkAction} Completed`,
        `Processed ${updatedCount} rules. ${skippedCount > 0 ? `${skippedCount} skipped due to blocking conflicts.` : ''}`
      );
    } catch (err: any) {
      toast.error('Bulk Action Failed', err.message);
    }
  };

  const toggleSelectRule = (id: string) => {
    setSelectedRuleIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#F8F9FA]">
      {/* Top Header & Bulk Controls */}
      <div className="h-14 bg-white border-b border-[#E5E5E3] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
              Maker-Checker Rule Review Console
            </h1>
            <p className="text-[11px] text-neutral-500">
              AI mines candidates · Finance Controllers adjudicate · Approved rules become immutable
            </p>
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1 p-0.5 bg-neutral-200/60 rounded-[3px] text-xs font-medium">
            <button
              onClick={() => setFilterStatus('CANDIDATE')}
              className={`px-2.5 py-1 rounded-[2px] transition-colors ${
                filterStatus === 'CANDIDATE' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Candidate Queue ({rules.filter(r => r.status === 'CANDIDATE').length})
            </button>
            <button
              onClick={() => setFilterStatus('APPROVED')}
              className={`px-2.5 py-1 rounded-[2px] transition-colors ${
                filterStatus === 'APPROVED' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Approved ({rules.filter(r => r.status === 'APPROVED').length})
            </button>
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded-[2px] transition-colors ${
                filterStatus === 'ALL' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All Rules
            </button>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedRuleIds.length > 0 && isFC && (
          <div className="flex items-center gap-2 animate-in fade-in">
            <span className="text-xs font-mono text-neutral-600">
              {selectedRuleIds.length} rules selected
            </span>
            <button
              onClick={() => {
                setBulkAction('APPROVE');
                setBulkModalOpen(true);
              }}
              className="px-2.5 py-1.5 bg-[#111315] text-white text-xs font-semibold rounded-[4px] hover:bg-[#202326] transition-colors"
            >
              Bulk Approve
            </button>
            <button
              onClick={() => {
                setBulkAction('REJECT');
                setBulkModalOpen(true);
              }}
              className="px-2.5 py-1.5 bg-white border border-rose-300 text-rose-700 text-xs font-semibold rounded-[4px] hover:bg-rose-50 transition-colors"
            >
              Bulk Reject
            </button>
          </div>
        )}
      </div>

      {/* Maker-Checker Separation Notice for Policy Owners */}
      {!isFC && (
        <div className="px-6 py-2 bg-blue-50 border-b border-blue-200 text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>
              <strong>Maker-Checker Governance Active:</strong> As Policy Owner, you can view AI candidate rule extractions and natural language syntax. Final approvals and activations are restricted to Finance Controllers.
            </span>
          </div>
          <span className="font-mono text-[10px] text-blue-700">READ-ONLY AUDIT MODE</span>
        </div>
      )}

      {/* Main 3-Panel Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left Panel: Rule Queue & Source Clause (3.5 cols) */}
        <div className="lg:col-span-4 border-r border-[#E5E5E3] bg-[#FDFDFD] flex flex-col min-h-0 overflow-hidden">
          {/* Rule selector list */}
          <div className="p-3 border-b border-[#E5E5E3] bg-white">
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
              Select Rule to Review
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredRules.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRuleId(r.id)}
                  className={`p-2.5 rounded-[4px] border transition-colors cursor-pointer flex items-start gap-2 ${
                    activeRule?.id === r.id
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800'
                  }`}
                >
                  {isFC && r.status === 'CANDIDATE' && (
                    <input
                      type="checkbox"
                      checked={selectedRuleIds.includes(r.id)}
                      onChange={e => {
                        e.stopPropagation();
                        toggleSelectRule(r.id);
                      }}
                      className="mt-1 cursor-pointer"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold truncate">{r.ruleCode}</span>
                      <StatusBadge status={r.status} type="rule" />
                    </div>
                    <div className="text-xs font-semibold truncate mt-0.5">{r.title}</div>
                    <div className="text-[10px] font-mono opacity-70 mt-0.5">{r.policyCode}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Source Clause Details */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
                Source Document Citation
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                AI Confidence: <strong className="text-emerald-700">{(activeRule.sourceClause.confidence * 100).toFixed(0)}%</strong>
              </span>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-[4px] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-amber-900">
                <span className="font-bold">{activeRule.sourceClause.section}</span>
                <span>Page {activeRule.sourceClause.page}</span>
              </div>
              <p className="text-xs text-neutral-900 font-serif leading-relaxed italic border-l-2 border-amber-400 pl-3 py-1">
                "{activeRule.sourceClause.text}"
              </p>
              <div className="pt-2 text-[10px] font-mono text-neutral-500 flex items-center justify-between">
                <span>Origin: {activeRule.policyTitle}</span>
                <span>{activeRule.policyVersion}</span>
              </div>
            </div>

            {/* Document AST Clause Properties */}
            <div className="space-y-2 text-xs">
              <div className="text-[11px] font-mono uppercase text-neutral-400">
                AST Node Extraction Attributes
              </div>
              <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-[4px] space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Comparator Category:</span>
                  <span className="font-semibold text-neutral-900">{activeRule.comparator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Extraction Model:</span>
                  <span className="text-neutral-800">AST Clause Parser v2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Ambiguity Score:</span>
                  <span className="text-emerald-700 font-bold">0.02 (Low)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: Candidate Rule Logic & Parameters (5 cols) */}
        <div className="lg:col-span-5 bg-white border-r border-[#E5E5E3] flex flex-col min-h-0 overflow-y-auto p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-neutral-900">
                  {activeRule.ruleCode}
                </span>
                <ComparatorTag comparator={activeRule.comparator} />
              </div>
              <StatusBadge status={activeRule.status} type="rule" />
            </div>
            <h2 className="text-base font-bold text-neutral-900">
              {activeRule.title}
            </h2>
          </div>

          {/* Natural Language Summary */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
              Natural Language Deterministic Specification
            </label>
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-[4px] text-xs text-neutral-800 leading-relaxed font-medium">
              {activeRule.naturalLanguageSummary}
            </div>
          </div>

          {/* Formal Deterministic Logic Expression */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                Formal Deterministic Logic (AST Runtime)
              </label>
              <span className="text-[10px] font-mono text-neutral-400">Non-Turing Complete</span>
            </div>
            <div className="p-3.5 bg-[#111315] text-[#A3E635] border border-[#2B2D31] rounded-[4px] font-mono text-xs overflow-x-auto leading-relaxed">
              <code>{activeRule.formalLogic}</code>
            </div>
          </div>

          {/* Extracted Parameters Matrix */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
              Engine Parameters Matrix
            </label>
            <div className="bg-neutral-50 border border-neutral-200 rounded-[4px] p-3 text-xs space-y-2 font-mono">
              {activeRule.parameters.capAmount && (
                <div className="flex justify-between py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500">Cap Limit:</span>
                  <span className="font-bold text-neutral-900">
                    {formatCurrency(activeRule.parameters.capAmount, activeRule.parameters.currency || 'USD')}
                  </span>
                </div>
              )}
              {activeRule.parameters.period && (
                <div className="flex justify-between py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500">Evaluation Window:</span>
                  <span className="font-semibold text-neutral-900">{activeRule.parameters.period}</span>
                </div>
              )}
              {activeRule.parameters.entitlementLevel && (
                <div className="flex justify-between py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500">Authorized Entitlement:</span>
                  <span className="font-semibold text-neutral-900">{activeRule.parameters.entitlementLevel}</span>
                </div>
              )}
              {activeRule.parameters.mandatoryAboveAmount && (
                <div className="flex justify-between py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500">Mandatory Above Amount:</span>
                  <span className="font-bold text-neutral-900">${activeRule.parameters.mandatoryAboveAmount}</span>
                </div>
              )}
              {activeRule.parameters.maxFilingDays && (
                <div className="flex justify-between py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500">Submission Window:</span>
                  <span className="font-bold text-neutral-900">{activeRule.parameters.maxFilingDays} Days</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-neutral-500">Configured Effective Date:</span>
                <span className="font-semibold text-neutral-900">{formatDate(activeRule.effectiveDate)}</span>
              </div>
            </div>
          </div>

          {/* Action Footer for FC */}
          {isFC && activeRule.status === 'CANDIDATE' && (
            <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setRejectModalOpen(true)}
                className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-[4px] transition-colors"
              >
                Reject Rule
              </button>
              <button
                onClick={() => setApproveModalOpen(true)}
                className="px-4 py-2 bg-[#111315] hover:bg-[#202326] text-white text-xs font-semibold rounded-[4px] flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-[#9EF01A]" />
                Approve & Activate Rule
              </button>
            </div>
          )}

          {activeRule.status === 'APPROVED' && (
            <div className="p-3 bg-[#E8F8CE]/50 border border-[#BCE87E] rounded-[4px] text-xs text-[#235805] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#65A30D]" />
                <span>Approved by <strong>{activeRule.approvedBy}</strong></span>
              </div>
              <span className="font-mono text-[10px]">Active in Engine</span>
            </div>
          )}

          {activeRule.status === 'REJECTED' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-[4px] text-xs text-rose-900">
              <div className="font-semibold flex items-center gap-1.5">
                <XSquare className="w-4 h-4 text-rose-600" />
                Rejected by {activeRule.rejectedBy}
              </div>
              <div className="text-[11px] text-rose-700 mt-1 font-mono">
                Reason: {activeRule.rejectionReason} · {activeRule.rejectionNote || 'No additional note'}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Impact Analysis & Conflict Warnings (3.5 cols) */}
        <div className="lg:col-span-3 bg-[#FDFDFD] flex flex-col min-h-0 overflow-y-auto p-5 space-y-6">
          {/* Impact Analysis */}
          <div>
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono mb-3">
              Impact Analysis (Simulation)
            </h3>
            <div className="bg-white border border-neutral-200 rounded-[4px] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Historical Claims Affected</span>
                <span className="text-base font-bold font-mono text-neutral-900 tabular-nums">
                  {activeRule.impactAnalysis.historicalClaimsAffected}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Annual Spend Variance</span>
                <span className="text-sm font-bold font-mono text-emerald-700 tabular-nums">
                  {formatCurrency(activeRule.impactAnalysis.projectedAnnualVariance, 'USD')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Risk Assessment</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[2px] ${
                  activeRule.impactAnalysis.riskLevel === 'HIGH' 
                    ? 'bg-rose-100 text-rose-800' 
                    : activeRule.impactAnalysis.riskLevel === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {activeRule.impactAnalysis.riskLevel} RISK
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-600 leading-relaxed">
                {activeRule.impactAnalysis.notes}
              </div>
            </div>
          </div>

          {/* Conflict Warnings */}
          <div>
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono mb-3">
              Conflict & Overlap Matrix
            </h3>

            {activeRule.conflicts.length === 0 ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Zero Invariants Violated:</strong> No blocking overlaps with approved policy rules detected.
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeRule.conflicts.map((conf, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-[4px] border text-xs ${
                      conf.severity === 'BLOCKING'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] font-bold mb-1">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {conf.severity} CONFLICT
                      </span>
                      <span>{conf.conflictingPolicy}</span>
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      {conf.issue}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Scenario Replay trigger */}
          <div className="p-3.5 bg-neutral-100 border border-neutral-200 rounded-[4px] text-xs space-y-2">
            <span className="font-semibold text-neutral-900 block">
              Test in Replay Lab
            </span>
            <p className="text-[11px] text-neutral-600">
              Run this candidate parameter against 420 historical expense submissions before approving.
            </p>
            <button
              onClick={() => onNavigate('replay', { ruleId: activeRule.id })}
              className="w-full py-1.5 px-2.5 bg-white border border-neutral-300 text-neutral-800 text-xs font-semibold rounded-[3px] hover:bg-neutral-50 transition-colors"
            >
              Launch Replay Scenario
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal: Controller Approval */}
      {approveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-neutral-300 rounded-md shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-[#E8F8CE] rounded-[4px] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#235805]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Approve Candidate Rule & Activate
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Maker-Checker Signoff: Approving will make {activeRule.ruleCode} active and immutable in deterministic claim evaluation.
                </p>
              </div>
            </div>

            <div className="bg-neutral-50 p-3 rounded-[4px] border border-neutral-200 text-xs space-y-1 font-mono">
              <div className="text-neutral-500">{activeRule.title}</div>
              <div className="font-semibold text-neutral-900">{activeRule.ruleCode}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Effective Incurrence Date *
              </label>
              <input
                type="date"
                required
                value={effectiveDate}
                onChange={e => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono text-neutral-900 border border-neutral-300 rounded-[4px] outline-none focus:border-neutral-900"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Rule will evaluate claims whose incurred date is on or after this date.
              </span>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setApproveModalOpen(false)}
                className="px-3.5 py-2 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-[4px] hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-[#111315] hover:bg-[#202326] text-white text-xs font-semibold rounded-[4px] flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#9EF01A]" />
                Confirm & Activate Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Controller Rejection */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-neutral-300 rounded-md shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-rose-100 rounded-[4px] flex items-center justify-center shrink-0">
                <XSquare className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Reject Candidate Rule
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Maker-Checker Signoff: Provide a reason for the Policy Owner before rejecting {activeRule.ruleCode}.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Rejection Reason *
              </label>
              <select
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs text-neutral-900 border border-neutral-300 rounded-[4px] outline-none focus:border-neutral-900 bg-white"
              >
                <option value="AMBIGUOUS_SYNTAX">Ambiguous Syntax in Clause</option>
                <option value="BLOCKING_POLICY_CONFLICT">Blocking Precedence Conflict with Existing Policy</option>
                <option value="HIGH_FINANCIAL_VARIANCE">Excessive Financial Variance in Replay</option>
                <option value="INCORRECT_COMPARATOR">Incorrect Comparator Type Assigned</option>
                <option value="OTHER">Other Technical Non-Compliance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Controller Audit Note
              </label>
              <textarea
                rows={2}
                placeholder="Specific guidance for Policy Owner revisions..."
                value={rejectionNote}
                onChange={e => setRejectionNote(e.target.value)}
                className="w-full px-3 py-2 text-xs text-neutral-900 border border-neutral-300 rounded-[4px] outline-none focus:border-neutral-900 resize-none"
              />
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-3.5 py-2 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-[4px] hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-[4px]"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Review Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-neutral-300 rounded-md shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">
              Bulk {bulkAction === 'APPROVE' ? 'Approve' : 'Reject'} {selectedRuleIds.length} Rules
            </h3>
            <p className="text-xs text-neutral-500">
              {bulkAction === 'APPROVE' 
                ? 'Rules with blocking conflict warnings will be automatically skipped to prevent invariant corruption.'
                : 'All selected candidate rules will be marked as rejected.'}
            </p>

            {bulkAction === 'APPROVE' ? (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Effective Incurrence Date
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={e => setEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono text-neutral-900 border border-neutral-300 rounded-[4px]"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Rejection Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bulk batch rejection"
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-neutral-900 border border-neutral-300 rounded-[4px]"
                />
              </div>
            )}

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setBulkModalOpen(false)}
                className="px-3.5 py-2 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-[4px] hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                className="px-4 py-2 bg-[#111315] hover:bg-[#202326] text-white text-xs font-semibold rounded-[4px]"
              >
                Confirm Bulk {bulkAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
