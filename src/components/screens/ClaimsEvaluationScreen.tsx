import React, { useState } from 'react';
import { 
  FileCheck, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  FileSpreadsheet, 
  Printer, 
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { User, Claim, EvaluatedRuleRecord, SuppressedRuleRecord } from '../../types';
import { PolicyOSApiClient } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { StatusBadge, ComparatorTag } from '../ui/StatusBadge';
import { useToast } from '../ui/Toast';

interface ClaimsEvaluationScreenProps {
  currentUser: User;
  onNavigate: (screen: string, params?: any) => void;
}

export const ClaimsEvaluationScreen: React.FC<ClaimsEvaluationScreenProps> = ({ currentUser, onNavigate }) => {
  const claims = PolicyOSApiClient.getClaims();
  const [selectedClaimId, setSelectedClaimId] = useState<string>(claims[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'RUNNER' | 'ALL_CLAIMS'>('RUNNER');
  const [evalResult, setEvalResult] = useState<Claim | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const toast = useToast();

  const selectedClaim = claims.find(c => c.id === selectedClaimId) || claims[0];

  const handleRunEvaluation = (claimToRun: Claim) => {
    setIsEvaluating(true);
    setTimeout(() => {
      try {
        const res = PolicyOSApiClient.evaluateClaim({
          claimantName: claimToRun.claimantName,
          claimantRole: claimToRun.claimantRole,
          claimantEmail: claimToRun.claimantEmail,
          department: claimToRun.department,
          jurisdiction: claimToRun.jurisdiction,
          incurredDate: claimToRun.incurredDate,
          submissionDate: claimToRun.submissionDate,
          currency: claimToRun.currency,
          category: claimToRun.primaryCategory,
          description: claimToRun.description,
          isDowngrade: claimToRun.isCompliantDowngrade,
          downgradeDetails: claimToRun.downgradeDetails,
          lineItems: claimToRun.lineItems.map(li => ({
            category: li.category,
            description: li.description,
            amount: li.amount,
            currency: li.currency,
            date: li.date,
            receiptAttached: li.receiptAttached,
            receiptType: li.receiptType,
            vendor: li.vendor
          }))
        });
        setEvalResult(res);
        setIsEvaluating(false);
        toast.success(
          'Claim Evaluated Deterministically',
          `Outcome: ${res.outcome} · Approved: ${formatCurrency(res.approvedAmount, res.currency)}`
        );
      } catch (err: any) {
        setIsEvaluating(false);
        toast.error('Evaluation Failed', err.message);
      }
    }, 450);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E3]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Deterministic Claim Adjudication Engine
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Zero-hallucination execution against approved rules active on claim incurrence date. Line-level itemization, mixed-bill partial approvals, and precedence tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-neutral-200/60 rounded-[3px] text-xs font-medium">
            <button
              onClick={() => setActiveTab('RUNNER')}
              className={`px-3 py-1.5 rounded-[2px] transition-colors ${
                activeTab === 'RUNNER' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Interactive Adjudicator
            </button>
            <button
              onClick={() => setActiveTab('ALL_CLAIMS')}
              className={`px-3 py-1.5 rounded-[2px] transition-colors ${
                activeTab === 'ALL_CLAIMS' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Claim Records Vault ({claims.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'RUNNER' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Claim Selector & Input Details (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-[#E5E5E3] p-4 rounded-[4px]">
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                Select Benchmark Claim Preset
              </div>
              <div className="space-y-2">
                {claims.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedClaimId(c.id);
                      setEvalResult(null);
                    }}
                    className={`p-3 rounded-[4px] border transition-colors cursor-pointer ${
                      selectedClaim?.id === c.id
                        ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-neutral-900">{c.claimNumber}</span>
                      <StatusBadge status={c.outcome} type="claim" />
                    </div>
                    <div className="text-xs font-semibold text-neutral-800 mt-1">{c.claimantName}</div>
                    <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                      {formatCurrency(c.totalClaimed, c.currency)} · {c.primaryCategory} · {formatDate(c.incurredDate)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Claim Profile Details */}
            {selectedClaim && (
              <div className="bg-white border border-[#E5E5E3] p-4 rounded-[4px] space-y-3 text-xs">
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  Claim Incurrence Profile
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-500">Claimant:</span>
                    <span className="font-semibold text-neutral-900">{selectedClaim.claimantName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-500">Employee Tier:</span>
                    <span className="font-semibold text-neutral-900">{selectedClaim.claimantRole}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-500">Jurisdiction / Location:</span>
                    <span className="font-semibold text-neutral-900">{selectedClaim.jurisdiction}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-500">Claim Incurred Date:</span>
                    <span className="font-bold text-neutral-900">{formatDate(selectedClaim.incurredDate)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-500">Filing Date:</span>
                    <span className="text-neutral-700">{formatDate(selectedClaim.submissionDate)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Total Claimed:</span>
                    <span className="font-bold text-neutral-900">
                      {formatCurrency(selectedClaim.totalClaimed, selectedClaim.currency)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRunEvaluation(selectedClaim)}
                  disabled={isEvaluating}
                  className="w-full mt-2 py-2 px-3 bg-[#111315] hover:bg-[#202326] text-white text-xs font-semibold rounded-[4px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <FileCheck className="w-4 h-4 text-[#9EF01A]" />
                  {isEvaluating ? 'Executing AST Rules...' : 'Execute Deterministic Adjudication'}
                </button>
              </div>
            )}
          </div>

          {/* Right: Line Items & Live Adjudication Output (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Line Items Breakdown */}
            <div className="bg-white border border-[#E5E5E3] rounded-[4px] overflow-hidden">
              <div className="px-4 py-3 bg-[#FDFDFD] border-b border-[#E5E5E3] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
                    Submitted Invoice Line Items ({selectedClaim?.lineItems.length || 0})
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Items are evaluated individually to support mixed-bill partial approvals.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-neutral-900">
                  {formatCurrency(selectedClaim?.totalClaimed || 0, selectedClaim?.currency || 'USD')}
                </span>
              </div>

              <div className="divide-y divide-neutral-100">
                {selectedClaim?.lineItems.map(item => (
                  <div key={item.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-900">{item.description}</span>
                        <ComparatorTag comparator={item.category} />
                      </div>
                      <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
                        Incurred: {formatDate(item.date)} · Receipt: {item.receiptAttached ? 'Verified PDF attached' : 'NO RECEIPT FOUND'}
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="font-bold text-neutral-900 text-sm">
                        {formatCurrency(item.amount, item.currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Adjudication Outcome Dashboard */}
            {(evalResult || selectedClaim) && (
              <div className="bg-white border border-[#E5E5E3] rounded-[4px] p-6 space-y-6">
                {/* Result Hero Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                        Adjudication Outcome
                      </span>
                      <StatusBadge status={evalResult ? evalResult.outcome : selectedClaim.outcome} type="claim" />
                    </div>
                    <div className="text-sm font-semibold text-neutral-800 mt-1">
                      {evalResult ? evalResult.outcomeReason : selectedClaim.outcomeReason}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('decision_detail', { claimId: selectedClaim.id, claimNumber: selectedClaim.claimNumber })}
                      className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold rounded-[4px] flex items-center gap-1.5 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-500" />
                      View Immutable Audit Record
                    </button>
                  </div>
                </div>

                {/* Financial Adjudication Math */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-[4px]">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase">Total Incurred</div>
                    <div className="text-base font-bold font-mono text-neutral-900 mt-0.5">
                      {formatCurrency(selectedClaim.totalClaimed, selectedClaim.currency)}
                    </div>
                  </div>

                  <div className="p-3 bg-[#E8F8CE]/50 border border-[#BCE87E] rounded-[4px]">
                    <div className="text-[10px] font-mono text-[#235805] uppercase">Approved Amount</div>
                    <div className="text-base font-bold font-mono text-[#235805] mt-0.5">
                      {formatCurrency(evalResult ? evalResult.approvedAmount : selectedClaim.approvedAmount, selectedClaim.currency)}
                    </div>
                  </div>

                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-[4px]">
                    <div className="text-[10px] font-mono text-rose-800 uppercase">Disallowed Amount</div>
                    <div className="text-base font-bold font-mono text-rose-900 mt-0.5">
                      {formatCurrency(evalResult ? evalResult.disallowedAmount : selectedClaim.disallowedAmount, selectedClaim.currency)}
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-[4px]">
                    <div className="text-[10px] font-mono text-amber-800 uppercase">Capped Difference</div>
                    <div className="text-base font-bold font-mono text-amber-900 mt-0.5">
                      {formatCurrency(evalResult ? evalResult.cappedAmount : selectedClaim.cappedAmount, selectedClaim.currency)}
                    </div>
                  </div>
                </div>

                {/* Evaluated Rules Table */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
                      Rules Evaluated (Active on Incurred Date)
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      Evaluates all rules, including passed constraints
                    </span>
                  </div>

                  <div className="border border-neutral-200 rounded-[4px] overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-[#FDFDFD] border-b border-neutral-200 text-[10px] font-mono uppercase text-neutral-400">
                        <tr>
                          <th className="py-2 px-3">Rule Code & Comparator</th>
                          <th className="py-2 px-3">Constraint & Scope</th>
                          <th className="py-2 px-3">Evaluation Result</th>
                          <th className="py-2 px-3 text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {(evalResult ? evalResult.evaluatedRules : selectedClaim.evaluatedRules).map((er: EvaluatedRuleRecord, idx: number) => (
                          <tr key={idx} className="hover:bg-neutral-50">
                            <td className="py-2.5 px-3">
                              <span className="font-mono font-bold text-neutral-900">{er.ruleCode}</span>
                              <div className="text-[10px] font-mono text-neutral-500 mt-0.5">{er.comparator}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-medium text-neutral-800">{er.ruleTitle}</div>
                              <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{er.sourceCitation}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold ${
                                er.result === 'PASSED' 
                                  ? 'text-[#235805]' 
                                  : 'text-rose-800'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  er.result === 'PASSED' ? 'bg-[#65A30D]' : 'bg-rose-500'
                                }`} />
                                {er.result}
                              </span>
                              <div className="text-[10px] text-neutral-500">{er.rationale}</div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-medium">
                              {er.capAmount ? (
                                <span className="text-neutral-700">Cap: ${er.capAmount}</span>
                              ) : (
                                <span className="text-emerald-700">Passed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Precedence Hierarchy & Suppressed Rules */}
                {((evalResult ? evalResult.suppressedRules : selectedClaim.suppressedRules) || []).length > 0 && (
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-[4px] text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-blue-950 uppercase text-[11px]">
                      <Info className="w-3.5 h-3.5 text-blue-600" />
                      <span>Deterministic Precedence Resolution Active</span>
                    </div>
                    <div className="space-y-1.5 text-neutral-700">
                      {(evalResult ? evalResult.suppressedRules : selectedClaim.suppressedRules).map((sr: SuppressedRuleRecord, idx: number) => (
                        <div key={idx} className="p-2 bg-white rounded border border-blue-100 flex items-start justify-between font-mono text-[11px]">
                          <div>
                            <span className="font-semibold text-neutral-900">{sr.ruleCode}</span> ({sr.ruleTitle})
                            <div className="text-neutral-500 mt-0.5">{sr.precedenceRationale}</div>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-[2px]">
                            SUPPRESSED BY {sr.suppressedByRuleCode}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* All Claims Vault Table */
        <div className="bg-white border border-[#E5E5E3] rounded-[4px] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E3] bg-[#FDFDFD] text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                <th className="py-3 px-4">Claim Reference</th>
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-3">Date Incurred</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Total Claimed</th>
                <th className="py-3 px-3">Adjudicated</th>
                <th className="py-3 px-3">Deterministic Outcome</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E3] text-xs">
              {claims.map(c => (
                <tr key={c.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => onNavigate('decision_detail', { claimId: c.id, claimNumber: c.claimNumber })}>
                  <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                    {c.claimNumber}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-neutral-900">{c.claimantName}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">{c.claimantRole}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-neutral-600">
                    {formatDate(c.incurredDate)}
                  </td>
                  <td className="py-3 px-3">
                    <ComparatorTag comparator={c.primaryCategory} />
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-neutral-900">
                    {formatCurrency(c.totalClaimed, c.currency)}
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-800">
                    {formatCurrency(c.approvedAmount, c.currency)}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={c.outcome} type="claim" />
                  </td>
                  <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onNavigate('decision_detail', { claimId: c.id, claimNumber: c.claimNumber })}
                      className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-semibold rounded-[3px] transition-colors"
                    >
                      Audit Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
