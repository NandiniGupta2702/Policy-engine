import React from 'react';
import { 
  FileText, 
  CheckSquare, 
  FileCheck, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { User, Policy, CandidateRule, Claim, AsyncJob } from '../../types';
import { PolicyOSApiClient } from '../../lib/api';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { StatusBadge } from '../ui/StatusBadge';

interface DashboardScreenProps {
  currentUser: User;
  onNavigate: (screen: string, params?: any) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ currentUser, onNavigate }) => {
  const policies = PolicyOSApiClient.getPolicies();
  const rules = PolicyOSApiClient.getRules();
  const claims = PolicyOSApiClient.getClaims();
  const jobs = PolicyOSApiClient.getJobs();
  const auditEvents = PolicyOSApiClient.getAuditEvents().slice(0, 5);

  // Role-filtered metrics
  const livePolicies = policies.filter(p => p.status === 'LIVE').length;
  const candidateRules = rules.filter(r => r.status === 'CANDIDATE').length;
  const approvedRules = rules.filter(r => r.status === 'APPROVED').length;
  const myPolicies = policies.filter(p => p.ownerId === currentUser.id).length;

  const runningJob = jobs.find(j => j.status === 'RUNNING');

  // Claim outcome statistics
  const totalClaims = claims.length;
  const passCount = claims.filter(c => c.outcome === 'PASS').length;
  const partApproveCount = claims.filter(c => c.outcome === 'PART_APPROVE').length;
  const clarifyCount = claims.filter(c => c.outcome === 'CLARIFY').length;
  const rejectCount = claims.filter(c => c.outcome === 'AUTO_REJECT').length;

  const totalClaimedDollars = claims.reduce((acc, c) => acc + (c.currency === 'USD' ? c.totalClaimed : c.totalClaimed * 0.012), 0);
  const totalApprovedDollars = claims.reduce((acc, c) => acc + (c.currency === 'USD' ? c.approvedAmount : c.approvedAmount * 0.012), 0);
  const adherenceRate = totalClaimedDollars > 0 ? ((totalApprovedDollars / totalClaimedDollars) * 100).toFixed(1) : '100';

  const outcomeChartData = [
    { name: 'PASS', count: passCount, color: '#84CC16' },
    { name: 'PART-APPROVE', count: partApproveCount, color: '#334155' },
    { name: 'CLARIFY', count: clarifyCount, color: '#D97706' },
    { name: 'AUTO-REJECT', count: rejectCount, color: '#E11D48' }
  ];

  // Category breakdown
  const categoryData = [
    { category: 'Airfare', count: claims.filter(c => c.primaryCategory === 'AIRFARE').length, amount: 1232 },
    { category: 'Lodging', count: claims.filter(c => c.primaryCategory === 'LODGING').length, amount: 890 },
    { category: 'Meals & Ent', count: claims.filter(c => c.primaryCategory === 'MEALS').length, amount: 280 }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E3]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Deterministic Governance Console
            </h1>
            <span className="text-xs px-2 py-0.5 bg-neutral-200 text-neutral-700 font-mono rounded-[3px]">
              Engine v2.4 Active
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Active Workspace: <strong className="text-neutral-700">Acme Corp Global</strong> · Logged in as{' '}
            <strong className="text-neutral-800">{currentUser.name}</strong> ({currentUser.role === 'FC' ? 'Finance Controller' : currentUser.role === 'PO' ? 'Policy Owner' : 'Administrator'})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {currentUser.role === 'PO' ? (
            <button
              onClick={() => onNavigate('upload')}
              className="px-3.5 py-2 bg-[#111315] hover:bg-[#202326] text-white text-xs font-semibold rounded-[4px] flex items-center gap-2 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[#9EF01A]" />
              Upload Source Policy
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigate('rule_review')}
                className="px-3.5 py-2 bg-[#111315] hover:bg-[#202326] text-white text-xs font-semibold rounded-[4px] flex items-center gap-2 transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                Review Candidate Rules ({candidateRules})
              </button>
              <button
                onClick={() => onNavigate('claims')}
                className="px-3.5 py-2 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs font-semibold rounded-[4px] flex items-center gap-2 transition-colors"
              >
                <FileCheck className="w-3.5 h-3.5 text-neutral-600" />
                Evaluate Claim
              </button>
            </>
          )}
        </div>
      </div>

      {/* Role-Aware Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-[#E5E5E3] p-4 rounded-[4px]">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-medium">Active Live Policies</span>
            <FileText className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
              {livePolicies}
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              of {policies.length} total docs
            </span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500 flex items-center gap-1">
            <span>{approvedRules} immutable rules executing</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#E5E5E3] p-4 rounded-[4px]">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-medium">Candidate Rules Awaiting FC</span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {candidateRules}
            </span>
            <span className="text-[11px] text-amber-600 font-mono">
              Maker-Checker queue
            </span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            {currentUser.role === 'PO' ? 'Submitted for controller review' : 'Actionable in Rule Review'}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#E5E5E3] p-4 rounded-[4px]">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-medium">Claims Evaluated (Q3)</span>
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
              {totalClaims}
            </span>
            <span className="text-[11px] text-emerald-600 font-mono">
              100% deterministic
            </span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            Evaluated strictly on incurred date
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-[#E5E5E3] p-4 rounded-[4px]">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-medium">Spend Adherence</span>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
              {adherenceRate}%
            </span>
            <span className="text-[11px] text-neutral-500 font-mono">
              normalized
            </span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500 font-mono truncate">
            Approved: ${Math.round(totalApprovedDollars).toLocaleString()} / Claimed: ${Math.round(totalClaimedDollars).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Async Mining Jobs In-Flight Banner */}
      {runningJob && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-spin" />
            <div>
              <div className="text-xs font-semibold text-neutral-900">
                In-Flight Policy Mining AST Pipeline: {runningJob.policyName}
              </div>
              <div className="text-[11px] text-neutral-600 mt-0.5">
                Current Stage: <strong className="font-mono">{runningJob.currentStage}</strong> (~{runningJob.estimatedRemainingSeconds}s remaining)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-32 bg-amber-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-600 h-2 transition-all duration-300"
                style={{ width: `${runningJob.progress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-amber-800">{runningJob.progress}%</span>
          </div>
        </div>
      )}

      {/* Policy Lifecycle Funnel */}
      <div className="bg-white border border-[#E5E5E3] p-5 rounded-[4px]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
              Deterministic Governance Funnel
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Maker-Checker separation: AI extracts clauses · Finance Controllers approve rules · Claims evaluate deterministically
            </p>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">Zero Hallucination Guarantee</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Stage 1 */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-[4px]">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
              <span>01. Ingestion</span>
              <FileText className="w-3.5 h-3.5 text-neutral-400" />
            </div>
            <div className="mt-2 text-lg font-bold font-mono text-neutral-900 tabular-nums">
              {policies.length} Docs
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              Source PDF / DOCX contracts
            </div>
          </div>

          {/* Stage 2 */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-[4px]">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
              <span>02. Extraction</span>
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
            </div>
            <div className="mt-2 text-lg font-bold font-mono text-neutral-900 tabular-nums">
              {rules.length} Rules Mined
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              AST parsing into 6 comparators
            </div>
          </div>

          {/* Stage 3 */}
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-[4px]">
            <div className="flex items-center justify-between text-[11px] text-amber-800 font-mono">
              <span>03. Controller Review</span>
              <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="mt-2 text-lg font-bold font-mono text-amber-800 tabular-nums">
              {candidateRules} Pending
            </div>
            <div className="text-[11px] text-amber-700 mt-1">
              Mandatory FC sign-off
            </div>
          </div>

          {/* Stage 4 */}
          <div className="p-3 bg-[#E8F8CE]/50 border border-[#BCE87E] rounded-[4px]">
            <div className="flex items-center justify-between text-[11px] text-[#235805] font-mono">
              <span>04. Active Execution</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#235805]" />
            </div>
            <div className="mt-2 text-lg font-bold font-mono text-[#235805] tabular-nums">
              {approvedRules} Immutable
            </div>
            <div className="text-[11px] text-[#235805] mt-1">
              Evaluates against claim date
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: Claim Outcomes & Recent Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Claim Outcome Breakdown (Recharts) */}
        <div className="lg:col-span-2 bg-white border border-[#E5E5E3] p-5 rounded-[4px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
                  Adjudication Outcome Distribution
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  4 Deterministic states: PASS · PART-APPROVE (mixed bill) · CLARIFY (missing doc) · AUTO-REJECT
                </p>
              </div>
              <button
                onClick={() => onNavigate('claims')}
                className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 flex items-center gap-1"
              >
                View all claims
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Outcome cards summary */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              <div className="p-2.5 bg-[#E8F8CE]/40 border border-[#BCE87E] rounded-[4px] text-center">
                <span className="text-[10px] font-mono font-bold text-[#235805]">PASS</span>
                <div className="text-lg font-mono font-bold text-[#235805] mt-0.5">{passCount}</div>
                <span className="text-[10px] text-neutral-500">100% compliant</span>
              </div>

              <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-[4px] text-center">
                <span className="text-[10px] font-mono font-bold text-slate-800">PART-APPROVE</span>
                <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">{partApproveCount}</div>
                <span className="text-[10px] text-neutral-500">Mixed bill capped</span>
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-[4px] text-center">
                <span className="text-[10px] font-mono font-bold text-amber-800">CLARIFY</span>
                <div className="text-lg font-mono font-bold text-amber-900 mt-0.5">{clarifyCount}</div>
                <span className="text-[10px] text-neutral-500">Missing tax invoice</span>
              </div>

              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-[4px] text-center">
                <span className="text-[10px] font-mono font-bold text-rose-800">AUTO-REJECT</span>
                <div className="text-lg font-mono font-bold text-rose-900 mt-0.5">{rejectCount}</div>
                <span className="text-[10px] text-neutral-500">Hard constraint breach</span>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outcomeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0EE" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111315', border: '1px solid #2B2D31', borderRadius: '4px', fontSize: '11px', color: '#FFF' }}
                    cursor={{ fill: '#F9FAFB' }}
                  />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {outcomeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
            <span>Missing receipts = CLARIFY (Never auto-reject)</span>
            <span>Compliant downgrades pass automatically</span>
          </div>
        </div>

        {/* Right: Immutable Activity & Audit Feed */}
        <div className="bg-white border border-[#E5E5E3] p-5 rounded-[4px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
                Recent Audit Trail
              </h3>
              <button
                onClick={() => onNavigate('audit')}
                className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 flex items-center gap-1"
              >
                Full audit
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {auditEvents.map(evt => (
                <div key={evt.id} className="text-xs pb-3 border-b border-neutral-100 last:border-none">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                    <span className="font-semibold text-neutral-800">{evt.actorName}</span>
                    <span>{formatDateTime(evt.timestamp)}</span>
                  </div>
                  <div className="font-medium text-neutral-900 mt-1 line-clamp-2">
                    {evt.description}
                  </div>
                  {evt.newValue && (
                    <div className="mt-1 text-[11px] font-mono text-neutral-600 bg-neutral-50 p-1 rounded-[2px] border border-neutral-200">
                      {evt.newValue}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100">
            <button
              onClick={() => onNavigate('replay')}
              className="w-full py-2 px-3 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold rounded-[4px] flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Open Replay Lab (Scenario Tester)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
