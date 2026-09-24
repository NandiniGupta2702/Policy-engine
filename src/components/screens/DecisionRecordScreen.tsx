import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Copy, 
  Check, 
  FileCode, 
  ShieldCheck, 
  ArrowLeft, 
  Download, 
  ChevronRight,
  ExternalLink,
  Layers
} from 'lucide-react';
import { User, Claim, EvaluatedRuleRecord, SuppressedRuleRecord } from '../../types';
import { PolicyOSApiClient } from '../../lib/api';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/utils';
import { StatusBadge, ComparatorTag } from '../ui/StatusBadge';
import { useToast } from '../ui/Toast';

interface DecisionRecordScreenProps {
  currentUser: User;
  claimId?: string;
  onNavigate: (screen: string, params?: any) => void;
}

export const DecisionRecordScreen: React.FC<DecisionRecordScreenProps> = ({ currentUser, claimId, onNavigate }) => {
  const claims = PolicyOSApiClient.getClaims();
  const [selectedClaimId, setSelectedClaimId] = useState<string>(claimId || claims[0]?.id || '');
  const [jsonDrawerOpen, setJsonDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const claim = claims.find(c => c.id === selectedClaimId) || claims[0];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyJson = () => {
    if (!claim) return;
    navigator.clipboard.writeText(JSON.stringify(claim, null, 2));
    setCopied(true);
    toast.success('JSON Copied to Clipboard', 'Full audit decision record serialized.');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!claim) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-base font-semibold text-neutral-800">Decision Record Not Found</h2>
        <button
          onClick={() => onNavigate('claims')}
          className="mt-3 px-3 py-1.5 bg-[#111315] text-white text-xs rounded-[4px]"
        >
          Return to Claims
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E3] print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('claims')}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-[3px] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-neutral-900">
                Decision Audit Record: {claim.claimNumber}
              </h1>
              <StatusBadge status={claim.outcome} type="claim" />
            </div>
            <p className="text-xs text-neutral-500 font-mono mt-0.5">
              Immutable SHA-256 Digest: {claim.decisionSignature}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setJsonDrawerOpen(true)}
            className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold rounded-[4px] flex items-center gap-1.5 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-neutral-500" />
            Inspect Machine JSON
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-[#111315] hover:bg-[#202326] text-white text-xs font-semibold rounded-[4px] flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Export Audit PDF
          </button>
        </div>
      </div>

      {/* Printable Certificate / Audit Sheet */}
      <div className="bg-white border border-[#E5E5E3] rounded-[4px] p-8 space-y-8 shadow-xs print:border-none print:p-0">
        {/* Certificate Header */}
        <div className="flex items-start justify-between border-b border-neutral-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-[#9EF01A] rounded-[3px] flex items-center justify-center font-mono font-bold text-black text-[10px]">
                P
              </span>
              <span className="font-bold text-sm text-neutral-900">PolicyOS Deterministic Engine</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mt-2">
              Official Expense Adjudication Record
            </h2>
            <div className="text-xs text-neutral-500 font-mono mt-1">
              Generated: {formatDateTime(claim.immutableTimestamp)} · Evaluated under Engine v2.4
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">Decision Status</span>
            <div className="mt-1">
              <StatusBadge status={claim.outcome} type="claim" />
            </div>
          </div>
        </div>

        {/* Claim & Employee Details Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-neutral-50 border border-neutral-200 rounded-[4px] text-xs font-mono">
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase">Claimant</span>
            <strong className="text-neutral-900 block mt-0.5">{claim.claimantName}</strong>
            <span className="text-neutral-500 text-[11px]">{claim.claimantRole}</span>
          </div>

          <div>
            <span className="text-neutral-400 block text-[10px] uppercase">Jurisdiction</span>
            <strong className="text-neutral-900 block mt-0.5">{claim.jurisdiction}</strong>
            <span className="text-neutral-500 text-[11px]">{claim.primaryCategory}</span>
          </div>

          <div>
            <span className="text-neutral-400 block text-[10px] uppercase">Claim Date</span>
            <strong className="text-neutral-900 block mt-0.5">{formatDate(claim.incurredDate)}</strong>
            <span className="text-neutral-500 text-[11px]">Submitted {formatDate(claim.submissionDate)}</span>
          </div>

          <div>
            <span className="text-neutral-400 block text-[10px] uppercase">Adjudication Outcome</span>
            <strong className="text-neutral-900 block mt-0.5">{claim.outcome}</strong>
            <span className="text-emerald-800 font-bold text-[11px]">
              {formatCurrency(claim.approvedAmount, claim.currency)}
            </span>
          </div>
        </div>

        {/* Financial Accounting Reconciliation */}
        <div>
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono mb-3">
            Financial Adjudication Breakdown
          </h3>
          <div className="border border-neutral-200 rounded-[4px] overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-[10px] font-mono uppercase text-neutral-400">
                <tr>
                  <th className="py-2.5 px-4">Line Item Description</th>
                  <th className="py-2.5 px-3">Receipt Attached</th>
                  <th className="py-2.5 px-3">Claimed</th>
                  <th className="py-2.5 px-3">Approved</th>
                  <th className="py-2.5 px-3">Disallowed</th>
                  <th className="py-2.5 px-4 text-right">Adjudication State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono">
                {claim.lineItems.map(item => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-4 font-sans font-medium text-neutral-900">
                      {item.description}
                    </td>
                    <td className="py-2.5 px-3">
                      {item.receiptAttached ? (
                        <span className="text-emerald-700">Yes ({item.receiptType || 'PDF'})</span>
                      ) : (
                        <span className="text-amber-700 font-bold">MISSING RECEIPT</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-800">
                      {formatCurrency(item.amount, item.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-[#235805] font-bold">
                      {formatCurrency(item.adjudication?.approvedAmount ?? item.amount, item.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-rose-700">
                      {(item.adjudication?.disallowedAmount ?? 0) > 0 ? formatCurrency(item.adjudication.disallowedAmount, item.currency) : '$0.00'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded-[2px] ${
                        item.adjudication?.outcome === 'APPROVED' ? 'bg-[#E8F8CE] text-[#235805]' : item.adjudication?.outcome === 'CLARIFY' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                      }`}>
                        {item.adjudication?.outcome || 'APPROVED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-neutral-50 border-t border-neutral-200 font-mono font-bold text-neutral-900">
                <tr>
                  <td colSpan={2} className="py-2.5 px-4 font-sans">Total Accounting Sum</td>
                  <td className="py-2.5 px-3">{formatCurrency(claim.totalClaimed, claim.currency)}</td>
                  <td className="py-2.5 px-3 text-[#235805]">{formatCurrency(claim.approvedAmount, claim.currency)}</td>
                  <td className="py-2.5 px-3 text-rose-700">{formatCurrency(claim.disallowedAmount, claim.currency)}</td>
                  <td className="py-2.5 px-4 text-right text-xs">
                    Capped: {formatCurrency(claim.cappedAmount, claim.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Evaluated Rules Matrix */}
        <div>
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono mb-3">
            Evaluated Policy Constraints (Active on Claim Incurred Date)
          </h3>
          <div className="space-y-3">
            {claim.evaluatedRules.map((er: EvaluatedRuleRecord, idx: number) => (
              <div key={idx} className="p-3.5 border border-neutral-200 rounded-[4px] text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900">{er.ruleCode}</span>
                    <span className="font-semibold text-neutral-800">{er.ruleTitle}</span>
                    <ComparatorTag comparator={er.comparator} />
                  </div>
                  <span className={`font-mono text-[11px] font-bold ${
                    er.result === 'PASSED' ? 'text-[#235805]' : 'text-rose-800'
                  }`}>
                    {er.result}
                  </span>
                </div>

                <div className="text-neutral-600 leading-relaxed font-mono text-[11px]">
                  Reasoning: {er.rationale}
                </div>

                <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span>Source Clause Citation: {er.sourceCitation}</span>
                  <span>
                    {er.capAmount 
                      ? `Cap Parameter: ${formatCurrency(er.capAmount, er.currency || claim.currency)}` 
                      : 'Zero variance (Compliant)'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Precedence Hierarchy & Suppressed Rules */}
        {claim.suppressedRules && claim.suppressedRules.length > 0 && (
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-[4px] space-y-2 text-xs">
            <h4 className="font-mono font-bold uppercase text-[11px] text-neutral-700">
              Precedence Suppressions
            </h4>
            {claim.suppressedRules.map((sr: SuppressedRuleRecord, idx: number) => (
              <div key={idx} className="font-mono text-[11px] text-neutral-600">
                • <strong>{sr.ruleCode}</strong> ({sr.ruleTitle}) suppressed by priority rule <strong>{sr.suppressedByRuleCode}</strong>: {sr.precedenceRationale}
              </div>
            ))}
          </div>
        )}

        {/* Cryptographic Proof & Signature */}
        <div className="pt-6 border-t border-neutral-200 text-xs font-mono text-neutral-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographically Verified Audit Signature:</span>
          </div>
          <span className="font-bold text-neutral-800 truncate max-w-md">
            {claim.decisionSignature}
          </span>
        </div>
      </div>

      {/* Machine-Readable JSON Drawer */}
      {jsonDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl h-full bg-[#111315] text-white flex flex-col p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#2B2D31]">
              <div>
                <h3 className="text-sm font-mono font-bold text-white">
                  Audit Decision Record JSON (FIPS Schema)
                </h3>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {claim.claimNumber} · Immutable Record
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 bg-[#202326] hover:bg-[#2B2D31] text-xs font-mono text-white rounded-[4px] flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
                <button
                  onClick={() => setJsonDrawerOpen(false)}
                  className="text-neutral-400 hover:text-white p-1 text-xs"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mt-4">
              <pre className="font-mono text-xs text-[#A3E635] leading-relaxed p-4 bg-[#0E1012] border border-[#2B2D31] rounded-[4px] overflow-x-auto">
                {JSON.stringify(claim, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
