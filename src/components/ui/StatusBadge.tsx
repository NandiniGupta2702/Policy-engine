import React from 'react';
import { ClaimOutcome, RuleStatus, PolicyStatus, ComparatorType } from '../../types';

interface StatusBadgeProps {
  status: ClaimOutcome | RuleStatus | PolicyStatus | string;
  type?: 'claim' | 'rule' | 'policy' | 'comparator';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'claim', className = '' }) => {
  // Claim Outcomes
  if (type === 'claim' || ['PASS', 'PART_APPROVE', 'CLARIFY', 'AUTO_REJECT'].includes(status)) {
    switch (status) {
      case 'PASS':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold tracking-tight text-[#235805] bg-[#E8F8CE] border border-[#BCE87E] rounded-[4px] ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#65A30D]" />
            PASS
          </span>
        );
      case 'PART_APPROVE':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold tracking-tight text-slate-800 bg-slate-100 border border-slate-300 rounded-[4px] ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            PART-APPROVE
          </span>
        );
      case 'CLARIFY':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold tracking-tight text-[#92400E] bg-[#FEF3C7] border border-[#FCD34D] rounded-[4px] ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
            CLARIFY
          </span>
        );
      case 'AUTO_REJECT':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold tracking-tight text-[#9F1239] bg-[#FFE4E6] border border-[#FDA4AF] rounded-[4px] ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
            AUTO-REJECT
          </span>
        );
    }
  }

  // Rule Statuses
  if (type === 'rule' || ['CANDIDATE', 'APPROVED', 'REJECTED', 'ARCHIVED'].includes(status)) {
    switch (status) {
      case 'CANDIDATE':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold tracking-tight text-amber-800 bg-amber-50 border border-amber-200 rounded-[4px] ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            CANDIDATE (NEEDS FC)
          </span>
        );
      case 'APPROVED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold tracking-tight text-[#235805] bg-[#E8F8CE] border border-[#BCE87E] rounded-[4px] ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#65A30D]" />
            APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold tracking-tight text-rose-800 bg-rose-50 border border-rose-200 rounded-[4px] ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            REJECTED
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium tracking-tight text-neutral-600 bg-neutral-100 border border-neutral-200 rounded-[4px] ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            ARCHIVED
          </span>
        );
    }
  }

  // Policy Statuses
  if (type === 'policy') {
    switch (status) {
      case 'LIVE':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold tracking-tight text-[#235805] bg-[#E8F8CE] border border-[#BCE87E] rounded-[4px] ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#65A30D]" />
            LIVE
          </span>
        );
      case 'PROPOSED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold tracking-tight text-blue-800 bg-blue-50 border border-blue-200 rounded-[4px] ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            PROPOSED
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium tracking-tight text-neutral-600 bg-neutral-100 border border-neutral-200 rounded-[4px] ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            ARCHIVED
          </span>
        );
      case 'FAILED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold tracking-tight text-rose-800 bg-rose-50 border border-rose-200 rounded-[4px] ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            FAILED
          </span>
        );
    }
  }

  // Comparators
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-medium tracking-tight text-neutral-700 bg-neutral-100 border border-neutral-200 rounded-[4px] ${className}`}>
      {status}
    </span>
  );
};

export const ComparatorTag: React.FC<{ comparator: ComparatorType | string; className?: string }> = ({ comparator, className = '' }) => {
  const getLabel = () => {
    switch (comparator) {
      case 'MONETARY_CAP': return 'MONETARY CAP';
      case 'ORDINAL_ENTITLEMENT': return 'ORDINAL ENTITLEMENT';
      case 'ELIGIBILITY': return 'ELIGIBILITY';
      case 'QUOTA': return 'QUOTA';
      case 'DOC_REQUIREMENT': return 'DOC REQUIREMENT';
      case 'TEMPORAL': return 'TEMPORAL';
      default: return comparator;
    }
  };

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wider uppercase text-neutral-800 bg-neutral-100 border border-neutral-300 rounded-[3px] ${className}`}>
      {getLabel()}
    </span>
  );
};
