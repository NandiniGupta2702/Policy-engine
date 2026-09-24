import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Layers,
  ShieldCheck,
  X
} from 'lucide-react';
import { User, AsyncJob } from '../../types';
import { PolicyOSApiClient } from '../../lib/api';
import { useToast } from '../ui/Toast';

interface UploadPolicyScreenProps {
  currentUser: User;
  onNavigate: (screen: string, params?: any) => void;
}

export const UploadPolicyScreen: React.FC<UploadPolicyScreenProps> = ({ currentUser, onNavigate }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [jurisdiction, setJurisdiction] = useState('GLOBAL');
  const [department, setDepartment] = useState('All Departments');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [precedenceTier, setPrecedenceTier] = useState('REGIONAL_ANNEXURE');
  const [summary, setSummary] = useState('');

  // Async Job State
  const [currentJob, setCurrentJob] = useState<AsyncJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobStage, setJobStage] = useState('');

  const toast = useToast();
  const limits = PolicyOSApiClient.getSystemLimits();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSelectFile = (file: File) => {
    setValidationError('');

    // Validate file size
    const maxBytes = limits.maxPdfSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setValidationError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed limit (${limits.maxPdfSizeMb} MB).`);
      return;
    }

    // Check duplicate name
    const existing = PolicyOSApiClient.getPolicies();
    if (existing.some(p => p.sourceFileName.toLowerCase() === file.name.toLowerCase())) {
      setValidationError(`A policy document with the filename "${file.name}" already exists. Please version or rename your file.`);
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
    if (!code) {
      setCode(`POL-${jurisdiction}-${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setValidationError('Please select or drag a policy document file.');
      return;
    }

    setIsSubmitting(true);
    setValidationError('');

    try {
      const { policy, job } = PolicyOSApiClient.uploadPolicy({
        title,
        code: code || `POL-${jurisdiction}-${Math.floor(100 + Math.random() * 900)}`,
        version: 'v1.0',
        jurisdiction,
        department,
        effectiveFrom,
        sourceFileName: selectedFile.name,
        sourceFileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        sourceFilePages: 8,
        summary: summary || 'Ingested policy documentation for extraction.',
        rawText: `Clause 1.1 Scope & Caps: Employees authorized for international travel may claim lodging up to standard thresholds. Reimbursable only upon submission of itemized VAT tax receipt.`
      });

      setCurrentJob(job);
      toast.success('Document Ingested', `Extraction pipeline dispatched for ${policy.title}`);

      // Run live simulated progress animation
      let p = 25;
      const stages = [
        'Document Ingestion & AST Tree Construction',
        'Clause Segmentation & NLP Tokenization',
        'Comparator Synthesis & Deterministic Formal Logic',
        'Precedence & Multi-Policy Conflict Analysis'
      ];
      setJobProgress(p);
      setJobStage(stages[0]);

      const interval = setInterval(() => {
        p += 25;
        setJobProgress(p);
        const stageIdx = Math.min(stages.length - 1, Math.floor(p / 25));
        setJobStage(stages[stageIdx]);

        if (p >= 100) {
          clearInterval(interval);
          setIsSubmitting(false);
          toast.success('Rule Extraction Complete', 'Candidate rules synthesized into Maker-Checker queue.');
        }
      }, 900);

    } catch (err: any) {
      setIsSubmitting(false);
      setValidationError(err.message || 'Failed to dispatch mining job');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="pb-4 border-b border-[#E5E5E3]">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">
          Ingest Policy Document & Dispatch Mining AST
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Upload commercial policies (PDF/DOCX). The engine segments clauses, extracts candidate rules into deterministic comparators, and queues them for Finance Controller review.
        </p>
      </div>

      {validationError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-[4px] flex items-start gap-2 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>{validationError}</div>
        </div>
      )}

      {/* Async Mining Progress Display */}
      {currentJob && (
        <div className="p-5 bg-white border border-[#E5E5E3] rounded-[4px] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-neutral-900">
                Job ID: {currentJob.id}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-100 text-amber-800 rounded-[2px]">
                {jobProgress < 100 ? 'PIPELINE RUNNING' : 'EXTRACTION COMPLETED'}
              </span>
            </div>

            <span className="text-xs font-mono font-bold text-neutral-900">
              {jobProgress}%
            </span>
          </div>

          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-neutral-200">
            <div 
              className={`h-2 transition-all duration-300 ${jobProgress === 100 ? 'bg-[#84CC16]' : 'bg-[#111315]'}`}
              style={{ width: `${jobProgress}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] font-mono">
            {currentJob.stages.map((stage, idx) => {
              const isDone = jobProgress >= (idx + 1) * 25;
              const isCurrent = jobProgress >= idx * 25 && jobProgress < (idx + 1) * 25;

              return (
                <div 
                  key={idx}
                  className={`p-2 border rounded-[3px] ${
                    isDone 
                      ? 'bg-[#E8F8CE]/40 border-[#BCE87E] text-[#235805]' 
                      : isCurrent
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-[#65A30D]" /> : <span>0{idx + 1}.</span>}
                    <span className="truncate">Stage 0{idx + 1}</span>
                  </div>
                  <div className="text-[10px] line-clamp-2">{stage}</div>
                </div>
              );
            })}
          </div>

          {jobProgress === 100 && (
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-600">
                Extracted 2 candidate rules. Awaiting Maker-Checker authorization.
              </span>
              <button
                onClick={() => onNavigate('rule_review')}
                className="px-3 py-1.5 bg-[#111315] hover:bg-[#202326] text-white text-xs font-semibold rounded-[4px] flex items-center gap-1.5 transition-colors"
              >
                Go to Rule Review
                <ArrowRight className="w-3.5 h-3.5 text-[#9EF01A]" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#E5E5E3] p-6 rounded-[4px] space-y-6">
        {/* Dropzone */}
        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-2">
            Source Policy Document (PDF / DOCX)
          </label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-[4px] p-8 text-center transition-colors cursor-pointer ${
              dragActive 
                ? 'border-neutral-900 bg-neutral-50' 
                : selectedFile
                ? 'border-emerald-500 bg-emerald-50/20'
                : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/50'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileInput}
              className="hidden"
              id="policy-file-upload"
            />
            <label htmlFor="policy-file-upload" className="cursor-pointer">
              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 text-emerald-600" />
                  <div className="font-semibold text-xs text-neutral-900">{selectedFile.name}</div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for AST extraction
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <UploadCloud className="w-8 h-8 text-neutral-400" />
                  <div className="font-semibold text-xs text-neutral-800">
                    Click to browse or drag & drop policy files
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    Supported: PDF, DOCX (Max {limits.maxPdfSizeMb} MB) · Duplicate detection active
                  </div>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Policy Formal Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Global Corporate Travel Standard 2026"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs text-neutral-900 border border-neutral-300 rounded-[4px] outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Policy Reference Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., POL-TRV-008"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono text-neutral-900 border border-neutral-300 rounded-[4px] outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Jurisdiction / Territory
            </label>
            <select
              value={jurisdiction}
              onChange={e => setJurisdiction(e.target.value)}
              className="w-full px-3 py-2 text-xs text-neutral-900 border border-neutral-300 rounded-[4px] outline-none focus:border-neutral-900 bg-white"
            >
              <option value="GLOBAL">GLOBAL (Worldwide Standard)</option>
              <option value="IN">IN (India Domestic Annexure)</option>
              <option value="APAC">APAC (Asia-Pacific)</option>
              <option value="US">US (United States Federal & State)</option>
              <option value="EMEA">EMEA (Europe, Middle East, Africa)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Target Department / Audience
            </label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs text-neutral-900 border border-neutral-300 rounded-[4px] outline-none focus:border-neutral-900 bg-white"
            >
              <option value="All Departments">All Enterprise Departments</option>
              <option value="Sales, Marketing & BD">Sales, Marketing & BD</option>
              <option value="Engineering & Product">Engineering & Product</option>
              <option value="HR & People Operations">HR & People Operations</option>
              <option value="Executive & Board">Executive & Board</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Effective Incurrence Date *
            </label>
            <input
              type="date"
              required
              value={effectiveFrom}
              onChange={e => setEffectiveFrom(e.target.value)}
              className="w-full px-3 py-2 text-xs text-neutral-900 border border-neutral-300 rounded-[4px] outline-none focus:border-neutral-900 font-mono"
            />
            <span className="text-[10px] text-neutral-400 mt-1 block">
              Claims evaluate against rules active on claim incurred date.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Precedence Hierarchy Tier
            </label>
            <select
              value={precedenceTier}
              onChange={e => setPrecedenceTier(e.target.value)}
              className="w-full px-3 py-2 text-xs text-neutral-900 border border-neutral-300 rounded-[4px] outline-none focus:border-neutral-900 bg-white"
            >
              <option value="LOCAL_MANDATE">1. Local Legal / Tax Mandate</option>
              <option value="REGIONAL_ANNEXURE">2. Regional Annexure (Suppresses Global)</option>
              <option value="DEPARTMENT_SPECIFIC">3. Department Specific Standard</option>
              <option value="GLOBAL_ENTERPRISE_STANDARD">4. Global Enterprise Standard (Default)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Executive Summary / Intent
          </label>
          <textarea
            rows={3}
            placeholder="Brief description of policy revisions or scope..."
            value={summary}
            onChange={e => setSummary(e.target.value)}
            className="w-full px-3 py-2 text-xs text-neutral-900 border border-neutral-300 rounded-[4px] outline-none focus:border-neutral-900 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
          <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
            <span>Maker-Checker: Mined rules require Controller approval</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('policies')}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-[4px] hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className="px-4 py-2 bg-[#111315] hover:bg-[#202326] text-white text-xs font-semibold rounded-[4px] flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9EF01A]" />
                  <span>Processing AST Pipeline...</span>
                </>
              ) : (
                <>
                  <span>Ingest & Dispatch AST Mining</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#9EF01A]" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
