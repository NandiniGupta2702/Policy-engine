import React, { useState } from 'react';
import { 
  RotateCcw, 
  Play, 
  Sliders, 
  Layers, 
  TrendingDown, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  DollarSign,
  PieChart as PieIcon
} from 'lucide-react';
import { User, CandidateRule, ReplaySimulation, ReplayDiff } from '../../types';
import { PolicyOSApiClient } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { StatusBadge, ComparatorTag } from '../ui/StatusBadge';
import { useToast } from '../ui/Toast';

interface ReplayLabScreenProps {
  currentUser: User;
  ruleId?: string;
  onNavigate: (screen: string, params?: any) => void;
}

export const ReplayLabScreen: React.FC<ReplayLabScreenProps> = ({ currentUser, ruleId, onNavigate }) => {
  const rules = PolicyOSApiClient.getRules();
  const [selectedRuleId, setSelectedRuleId] = useState<string>(ruleId || rules[0]?.id || '');
  const [testCapAmount, setTestCapAmount] = useState<number>(190);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState<ReplaySimulation | null>(null);
  const toast = useToast();

  const activeRule = rules.find(r => r.id === selectedRuleId) || rules[0];

  const handleRunReplay = () => {
    setIsRunning(true);
    setTimeout(() => {
      try {
        const result = PolicyOSApiClient.runReplaySimulation(
          activeRule.id,
          testCapAmount
        );
        setSimulationResult(result);
        setIsRunning(false);
        toast.success(
          'Replay Simulation Completed',
          `Evaluated ${result.sampleSize} claims. Net financial delta: ${formatCurrency(result.netFinancialDelta, 'USD')}`
        );
      } catch (err: any) {
        setIsRunning(false);
        toast.error('Simulation Failed', err.message);
      }
    }, 600);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-[#E5E5E3]">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Replay Lab: Scenario & Invariant Tester
          </h1>
          <span className="text-xs px-2 py-0.5 bg-neutral-200 text-neutral-700 font-mono rounded-[3px]">
            Corpus N=420
          </span>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Simulate rule parameter changes and new candidate policies against the entire historical corpus of audited expense claims without modifying live production rules.
        </p>
      </div>

      {/* Grid: Scenario Configuration & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E5E5E3] rounded-[4px] p-5 space-y-5">
          <div>
            <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono mb-2">
              Select Rule for Counter-Factual Testing
            </h2>
            <select
              value={selectedRuleId}
              onChange={e => {
                setSelectedRuleId(e.target.value);
                setSimulationResult(null);
              }}
              className="w-full px-3 py-2 text-xs text-neutral-900 border border-neutral-300 rounded-[4px] outline-none focus:border-neutral-900 font-mono bg-white"
            >
              {rules.map(r => (
                <option key={r.id} value={r.id}>
                  {r.ruleCode}: {r.title}
                </option>
              ))}
            </select>
          </div>

          {/* Current Parameter Baseline */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-[4px] space-y-2 text-xs font-mono">
            <span className="text-[10px] uppercase text-neutral-400 block font-bold">
              Current Production Baseline
            </span>
            <div className="flex justify-between">
              <span className="text-neutral-500">Current Parameter:</span>
              <span className="font-bold text-neutral-900">
                {activeRule.parameters.capAmount 
                  ? `$${activeRule.parameters.capAmount} / night` 
                  : activeRule.parameters.entitlementLevel || 'Configured'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Comparator Type:</span>
              <span className="text-neutral-800">{activeRule.comparator}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Status in Engine:</span>
              <StatusBadge status={activeRule.status} type="rule" />
            </div>
          </div>

          {/* Scenario Parameter Slider / Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-neutral-800">
                Counter-Factual Cap Parameter ($)
              </label>
              <span className="font-mono font-bold text-neutral-900 text-sm">
                ${testCapAmount}
              </span>
            </div>

            <input
              type="range"
              min={120}
              max={300}
              step={5}
              value={testCapAmount}
              onChange={e => setTestCapAmount(Number(e.target.value))}
              className="w-full accent-neutral-900 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-mono text-neutral-400">
              <span>$120 (Strictest)</span>
              <span>$220 (Baseline)</span>
              <span>$300 (Generous)</span>
            </div>
          </div>

          {/* Execution Button */}
          <button
            onClick={handleRunReplay}
            disabled={isRunning}
            className="w-full py-2.5 px-4 bg-[#111315] hover:bg-[#202326] text-white text-xs font-semibold rounded-[4px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Simulating Historical Submissions...' : 'Run Replay Scenario (N=420)'}
          </button>
        </div>

        {/* Right: Simulation Output & Financial Impact (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {!simulationResult ? (
            <div className="bg-white border border-[#E5E5E3] rounded-[4px] p-12 text-center text-neutral-500">
              <RotateCcw className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <div className="font-semibold text-neutral-800">No Simulation Run Yet</div>
              <div className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Configure your counter-factual parameter in the left panel and click "Run Replay Scenario" to project financial variance and claim shifts.
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              {/* Financial Variance Header Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-[#E5E5E3] p-4 rounded-[4px]">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                    Net Projected Financial Impact
                  </span>
                  <div className={`text-2xl font-bold font-mono mt-1 tabular-nums ${
                    simulationResult.netFinancialDelta <= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {simulationResult.netFinancialDelta < 0 ? '-' : '+'}
                    {formatCurrency(Math.abs(simulationResult.netFinancialDelta), 'USD')}
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Across {simulationResult.sampleSize} historical filings
                  </span>
                </div>

                <div className="bg-white border border-[#E5E5E3] p-4 rounded-[4px]">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                    Claims Altered in Outcome
                  </span>
                  <div className="text-2xl font-bold font-mono text-neutral-900 mt-1 tabular-nums">
                    {simulationResult.outcomeShifts}
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    {((simulationResult.outcomeShifts / simulationResult.sampleSize) * 100).toFixed(1)}% of total corpus
                  </span>
                </div>

                <div className="bg-white border border-[#E5E5E3] p-4 rounded-[4px]">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                    Counter-Factual Pass Count
                  </span>
                  <div className="text-2xl font-bold font-mono text-neutral-900 mt-1 tabular-nums">
                    {simulationResult.afterStats.pass}
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Baseline was {simulationResult.beforeStats.pass}
                  </span>
                </div>
              </div>

              {/* Before vs After Outcome Comparison */}
              <div className="bg-white border border-[#E5E5E3] rounded-[4px] p-5">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono mb-4">
                  Before vs Counter-Factual Outcome Shifts
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-[4px]">
                    <span className="text-[10px] font-mono font-bold text-[#235805]">PASS</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-mono font-bold text-neutral-400 line-through">
                        {simulationResult.beforeStats.pass}
                      </span>
                      <ArrowRight className="w-3 h-3 text-neutral-400" />
                      <span className="text-lg font-mono font-bold text-[#235805]">
                        {simulationResult.afterStats.pass}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-[4px]">
                    <span className="text-[10px] font-mono font-bold text-slate-800">PART-APPROVE</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-mono font-bold text-neutral-400 line-through">
                        {simulationResult.beforeStats.partApprove}
                      </span>
                      <ArrowRight className="w-3 h-3 text-neutral-400" />
                      <span className="text-lg font-mono font-bold text-slate-900">
                        {simulationResult.afterStats.partApprove}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-[4px]">
                    <span className="text-[10px] font-mono font-bold text-amber-800">CLARIFY</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-mono font-bold text-neutral-400">
                        {simulationResult.beforeStats.clarify}
                      </span>
                      <ArrowRight className="w-3 h-3 text-neutral-400" />
                      <span className="text-lg font-mono font-bold text-amber-900">
                        {simulationResult.afterStats.clarify}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-[4px]">
                    <span className="text-[10px] font-mono font-bold text-rose-800">AUTO-REJECT</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-mono font-bold text-neutral-400">
                        {simulationResult.beforeStats.autoReject}
                      </span>
                      <ArrowRight className="w-3 h-3 text-neutral-400" />
                      <span className="text-lg font-mono font-bold text-rose-900">
                        {simulationResult.afterStats.autoReject}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Shifted Claims Table */}
              <div className="bg-white border border-[#E5E5E3] rounded-[4px] overflow-hidden">
                <div className="px-4 py-3 bg-[#FDFDFD] border-b border-[#E5E5E3] flex justify-between items-center">
                  <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
                    Sample Impacted Claim Filings
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Live diff against production database
                  </span>
                </div>

                <div className="divide-y divide-neutral-100 text-xs">
                  {simulationResult.sampleDiffs.map((item: ReplayDiff, idx: number) => (
                    <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-mono font-bold text-neutral-900">{item.claimNumber}</div>
                        <div className="text-neutral-600 mt-0.5">{item.claimant} · {item.category}</div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={item.beforeOutcome} type="claim" />
                          <ArrowRight className="w-3 h-3 text-neutral-400" />
                          <StatusBadge status={item.afterOutcome} type="claim" />
                        </div>

                        <div className="font-mono text-right min-w-[100px]">
                          <div className={`font-bold ${item.delta <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {item.delta < 0 ? '-' : '+'}
                            {formatCurrency(Math.abs(item.delta), 'USD')}
                          </div>
                          <div className="text-[10px] text-neutral-400">Financial Delta</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
