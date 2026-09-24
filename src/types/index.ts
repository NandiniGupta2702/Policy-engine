export type UserRole = 'PO' | 'FC' | 'ADMIN';

export type UserStatus = 'active' | 'revoked';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  status: UserStatus;
  lastLogin: string;
}

export type PolicyStatus = 'LIVE' | 'PROPOSED' | 'ARCHIVED' | 'FAILED';

export interface Policy {
  id: string;
  title: string;
  code: string;
  version: string;
  ownerId: string;
  ownerName: string;
  jurisdiction: string; // e.g., 'GLOBAL', 'IN' (India), 'US', 'EMEA', 'APAC'
  department: string; // e.g., 'Sales', 'Engineering', 'Executive', 'All'
  effectiveFrom: string;
  effectiveTo?: string;
  status: PolicyStatus;
  sourceFileName: string;
  sourceFileSize: string;
  sourceFilePages: number;
  extractedRulesCount: number;
  approvedRulesCount: number;
  candidateRulesCount: number;
  summary: string;
  documentClauses: DocumentClause[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentClause {
  id: string;
  pageNumber: number;
  sectionCode: string;
  heading: string;
  text: string;
  linkedRuleId?: string;
  highlightCategory?: string;
}

export type ComparatorType = 
  | 'MONETARY_CAP' 
  | 'ORDINAL_ENTITLEMENT' 
  | 'ELIGIBILITY' 
  | 'QUOTA' 
  | 'DOC_REQUIREMENT' 
  | 'TEMPORAL';

export type RuleStatus = 'CANDIDATE' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

export interface RuleConflict {
  conflictingRuleId: string;
  conflictingPolicy: string;
  conflictingVersion: string;
  issue: string;
  severity: 'WARNING' | 'BLOCKING';
}

export interface CandidateRule {
  id: string;
  policyId: string;
  policyTitle: string;
  policyCode: string;
  policyVersion: string;
  ruleCode: string;
  title: string;
  comparator: ComparatorType;
  status: RuleStatus;
  naturalLanguageSummary: string;
  formalLogic: string;
  parameters: {
    capAmount?: number;
    currency?: string;
    period?: 'PER_DAY' | 'PER_TRANSACTION' | 'PER_MONTH' | 'PER_NIGHT';
    entitlementLevel?: string;
    eligibleRoles?: string[];
    allowedCategories?: string[];
    quotaLimit?: number;
    quotaWindowDays?: number;
    requiredReceiptTypes?: string[];
    mandatoryAboveAmount?: number;
    maxFilingDays?: number;
  };
  sourceClause: {
    page: number;
    section: string;
    text: string;
    confidence: number;
  };
  impactAnalysis: {
    historicalClaimsAffected: number;
    projectedAnnualVariance: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    notes: string;
  };
  conflicts: RuleConflict[];
  effectiveDate: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  rejectionNote?: string;
}

export type AsyncJobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface AsyncJob {
  id: string;
  type: 'POLICY_MINING' | 'REPLAY_SIMULATION' | 'BATCH_EVALUATION';
  title: string;
  status: AsyncJobStatus;
  progress: number;
  currentStage: string;
  totalStages: number;
  stages: string[];
  estimatedRemainingSeconds: number;
  policyId?: string;
  policyName?: string;
  startedAt: string;
  completedAt?: string;
  resultSummary?: string;
}

export type ClaimOutcome = 'PASS' | 'PART_APPROVE' | 'CLARIFY' | 'AUTO_REJECT';

export interface ClaimLineItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  receiptAttached: boolean;
  receiptType?: 'ITEMIZED_TAX_INVOICE' | 'SUMMARY_SLIP' | 'E_TICKET' | 'BOARDING_PASS' | 'NONE';
  vendor: string;
  adjudication: {
    outcome: 'APPROVED' | 'CAPPED' | 'DISALLOWED' | 'CLARIFY';
    approvedAmount: number;
    disallowedAmount: number;
    reason: string;
    appliedRuleCode?: string;
  };
}

export interface EvaluatedRuleRecord {
  ruleId: string;
  ruleCode: string;
  ruleTitle: string;
  policyTitle: string;
  policyVersion: string;
  comparator: ComparatorType;
  result: 'PASSED' | 'FAILED' | 'SUPPRESSED';
  rationale: string;
  sourceCitation: string;
  capAmount?: number;
  currency?: string;
}

export interface SuppressedRuleRecord {
  ruleId: string;
  ruleCode: string;
  ruleTitle: string;
  policyTitle: string;
  suppressedByRuleCode: string;
  suppressedByPolicy: string;
  precedenceRationale: string;
}

export interface Claim {
  id: string;
  claimNumber: string;
  claimantName: string;
  claimantRole: string;
  claimantEmail: string;
  department: string;
  jurisdiction: string;
  submissionDate: string;
  incurredDate: string;
  totalClaimed: number;
  approvedAmount: number;
  disallowedAmount: number;
  cappedAmount: number;
  currency: string;
  primaryCategory: string;
  description: string;
  outcome: ClaimOutcome;
  outcomeReason: string;
  isCompliantDowngrade?: boolean;
  downgradeDetails?: string;
  lineItems: ClaimLineItem[];
  evaluatedRules: EvaluatedRuleRecord[];
  suppressedRules: SuppressedRuleRecord[];
  decisionSignature: string;
  immutableTimestamp: string;
}

export interface ReplayDiff {
  claimNumber: string;
  claimant: string;
  category: string;
  beforeOutcome: ClaimOutcome;
  afterOutcome: ClaimOutcome;
  beforePayout: number;
  afterPayout: number;
  delta: number;
  rationale: string;
}

export interface ReplaySimulation {
  id: string;
  ruleId: string;
  ruleTitle: string;
  ruleCode: string;
  comparator: ComparatorType;
  proposedChangeSummary: string;
  sampleSize: number;
  evaluatedAt: string;
  beforeStats: {
    pass: number;
    partApprove: number;
    clarify: number;
    autoReject: number;
    totalPayout: number;
  };
  afterStats: {
    pass: number;
    partApprove: number;
    clarify: number;
    autoReject: number;
    totalPayout: number;
  };
  netFinancialDelta: number;
  outcomeShifts: number;
  sampleDiffs: ReplayDiff[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  entityType: 'POLICY' | 'RULE' | 'CLAIM' | 'USER' | 'SYSTEM_LIMITS';
  entityId: string;
  description: string;
  previousValue?: string;
  newValue?: string;
}

export interface SystemLimits {
  maxPdfSizeMb: number;
  miningConcurrency: number;
  autoExtractConfidenceThreshold: number;
  replaySampleSize: number;
  claimFilingWindowDays: number;
  precedenceHierarchy: string[];
}
