import {
  User,
  Policy,
  CandidateRule,
  AsyncJob,
  Claim,
  ReplaySimulation,
  AuditEvent,
  SystemLimits,
  ClaimOutcome,
  ClaimLineItem,
  RuleStatus
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_POLICIES,
  INITIAL_RULES,
  INITIAL_CLAIMS,
  INITIAL_JOBS,
  INITIAL_REPLAY_SIMULATION,
  INITIAL_AUDIT_EVENTS,
  INITIAL_SYSTEM_LIMITS
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'policyos_users',
  POLICIES: 'policyos_policies',
  RULES: 'policyos_rules',
  CLAIMS: 'policyos_claims',
  JOBS: 'policyos_jobs',
  REPLAY: 'policyos_replay',
  AUDIT: 'policyos_audit',
  LIMITS: 'policyos_limits',
  CURRENT_USER: 'policyos_current_user'
};

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultVal;
    return JSON.parse(item);
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Storage quota or serialization error', err);
  }
}

export class PolicyOSApiClient {
  // Authentication & Current User
  static getCurrentUser(): User | null {
    const stored = getStored<User | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    if (!stored) return null;
    
    // Check if the user is revoked in the live users database
    const users = this.getUsers();
    const live = users.find(u => u.id === stored.id);
    if (live && live.status === 'revoked') {
      this.logout();
      return null;
    }
    return live || stored;
  }

  static setCurrentUser(user: User | null): void {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
  }

  static logout(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  static loginAs(role: 'FC' | 'PO' | 'ADMIN'): User {
    const users = this.getUsers();
    const found = users.find(u => u.role === role && u.status === 'active') || INITIAL_USERS.find(u => u.role === role)!;
    this.setCurrentUser(found);
    this.recordAudit({
      actorName: found.name,
      actorEmail: found.email,
      actorRole: found.role,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: found.id,
      description: `Logged in as ${found.name} (${found.role})`
    });
    return found;
  }

  // Users Management
  static getUsers(): User[] {
    return getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static updateUserStatus(userId: string, status: 'active' | 'revoked'): User {
    const users = this.getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, status } : u);
    setStored(STORAGE_KEYS.USERS, updated);
    
    const user = updated.find(u => u.id === userId)!;
    const actor = this.getCurrentUser();
    this.recordAudit({
      actorName: actor?.name || 'Admin',
      actorEmail: actor?.email || 'admin@policyos.internal',
      actorRole: actor?.role || 'ADMIN',
      action: 'USER_STATUS_CHANGE',
      entityType: 'USER',
      entityId: userId,
      description: `User ${user.name} status updated to ${status}.`,
      newValue: status
    });

    return user;
  }

  // Policies
  static getPolicies(): Policy[] {
    return getStored<Policy[]>(STORAGE_KEYS.POLICIES, INITIAL_POLICIES);
  }

  static getPolicyById(id: string): Policy | undefined {
    return this.getPolicies().find(p => p.id === id);
  }

  static uploadPolicy(payload: {
    title: string;
    code: string;
    version: string;
    jurisdiction: string;
    department: string;
    effectiveFrom: string;
    sourceFileName: string;
    sourceFileSize: string;
    sourceFilePages: number;
    summary: string;
    rawText?: string;
  }): { policy: Policy; job: AsyncJob } {
    const actor = this.getCurrentUser()!;
    const policies = this.getPolicies();
    const newPolicyId = `pol-${Date.now().toString().slice(-4)}`;
    
    const newPolicy: Policy = {
      id: newPolicyId,
      title: payload.title,
      code: payload.code || `POL-${payload.jurisdiction}-${Math.floor(100 + Math.random() * 900)}`,
      version: payload.version || 'v1.0',
      ownerId: actor.id,
      ownerName: actor.name,
      jurisdiction: payload.jurisdiction,
      department: payload.department,
      effectiveFrom: payload.effectiveFrom || new Date().toISOString().split('T')[0],
      status: 'PROPOSED',
      sourceFileName: payload.sourceFileName,
      sourceFileSize: payload.sourceFileSize,
      sourceFilePages: payload.sourceFilePages,
      extractedRulesCount: 2,
      approvedRulesCount: 0,
      candidateRulesCount: 2,
      summary: payload.summary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documentClauses: [
        {
          id: `cls-${Date.now()}-1`,
          pageNumber: 2,
          sectionCode: 'Section 2.1',
          heading: 'Expense Limits & Approvals',
          text: payload.rawText || 'Employees must obtain written director level approval for any individual expenditure in excess of USD 250.00.',
          highlightCategory: 'MONETARY_CAP'
        }
      ]
    };

    setStored(STORAGE_KEYS.POLICIES, [newPolicy, ...policies]);

    // Create Candidate Rules extracted from the policy
    const newRuleId1 = `rul-${Date.now().toString().slice(-4)}-1`;
    const candidateRule: CandidateRule = {
      id: newRuleId1,
      policyId: newPolicy.id,
      policyTitle: newPolicy.title,
      policyCode: newPolicy.code,
      policyVersion: newPolicy.version,
      ruleCode: `RUL-${newPolicy.code.replace('POL-', '')}-01`,
      title: `${newPolicy.title} Primary Cap`,
      comparator: 'MONETARY_CAP',
      status: 'CANDIDATE',
      naturalLanguageSummary: 'Ceiling cap of $250.00 USD per transaction without director level approval.',
      formalLogic: 'ASSERT claim.amount <= 250.00 USD || claim.has_director_approval == true',
      parameters: {
        capAmount: 250.0,
        currency: 'USD',
        period: 'PER_TRANSACTION'
      },
      sourceClause: {
        page: 2,
        section: 'Section 2.1',
        text: 'Employees must obtain written director level approval for any individual expenditure in excess of USD 250.00.',
        confidence: 0.94
      },
      impactAnalysis: {
        historicalClaimsAffected: 24,
        projectedAnnualVariance: -8500,
        riskLevel: 'LOW',
        notes: 'AI candidate extraction based on uploaded document syntax.'
      },
      conflicts: [],
      effectiveDate: newPolicy.effectiveFrom
    };

    const rules = this.getRules();
    setStored(STORAGE_KEYS.RULES, [candidateRule, ...rules]);

    // Create Async Job
    const jobId = `job-${Date.now().toString().slice(-4)}`;
    const job: AsyncJob = {
      id: jobId,
      type: 'POLICY_MINING',
      title: `Mining Candidate Rules: ${newPolicy.title}`,
      status: 'RUNNING',
      progress: 25,
      currentStage: 'Document Ingestion & AST Tree Construction',
      totalStages: 4,
      stages: [
        'Document Ingestion & AST Tree Construction',
        'Clause Segmentation & NLP Tokenization',
        'Comparator Synthesis & Deterministic Formal Logic',
        'Precedence & Multi-Policy Conflict Analysis'
      ],
      estimatedRemainingSeconds: 8,
      policyId: newPolicy.id,
      policyName: newPolicy.title,
      startedAt: new Date().toISOString()
    };

    const jobs = this.getJobs();
    setStored(STORAGE_KEYS.JOBS, [job, ...jobs]);

    this.recordAudit({
      actorName: actor.name,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'POLICY_UPLOAD',
      entityType: 'POLICY',
      entityId: newPolicy.id,
      description: `Uploaded policy document ${payload.sourceFileName} (${payload.title}) and dispatched mining job ${job.id}.`
    });

    return { policy: newPolicy, job };
  }

  // Rules (Maker-Checker)
  static getRules(): CandidateRule[] {
    return getStored<CandidateRule[]>(STORAGE_KEYS.RULES, INITIAL_RULES);
  }

  static getRuleById(id: string): CandidateRule | undefined {
    return this.getRules().find(r => r.id === id);
  }

  static approveRule(ruleId: string, effectiveDate: string): CandidateRule {
    const actor = this.getCurrentUser();
    if (actor?.role !== 'FC' && actor?.role !== 'ADMIN') {
      throw new Error('Maker-Checker Violation: Only Finance Controllers can approve candidate rules.');
    }

    const rules = this.getRules();
    const updated = rules.map(r => {
      if (r.id === ruleId) {
        return {
          ...r,
          status: 'APPROVED' as RuleStatus,
          effectiveDate: effectiveDate || r.effectiveDate,
          approvedBy: `${actor.name} (${actor.role})`,
          approvedAt: new Date().toISOString(),
          rejectionReason: undefined,
          rejectionNote: undefined
        };
      }
      return r;
    });

    setStored(STORAGE_KEYS.RULES, updated);
    const rule = updated.find(r => r.id === ruleId)!;

    // Also update policy counts
    const policies = this.getPolicies();
    const updatedPolicies = policies.map(p => {
      if (p.id === rule.policyId) {
        const pRules = updated.filter(r => r.policyId === p.id);
        const approvedCount = pRules.filter(r => r.status === 'APPROVED').length;
        const candidateCount = pRules.filter(r => r.status === 'CANDIDATE').length;
        return {
          ...p,
          approvedRulesCount: approvedCount,
          candidateRulesCount: candidateCount,
          status: approvedCount > 0 ? ('LIVE' as const) : p.status
        };
      }
      return p;
    });
    setStored(STORAGE_KEYS.POLICIES, updatedPolicies);

    this.recordAudit({
      actorName: actor.name,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'RULE_APPROVE',
      entityType: 'RULE',
      entityId: rule.id,
      description: `Approved rule ${rule.ruleCode} (${rule.title}) with effective date ${rule.effectiveDate}.`,
      previousValue: 'CANDIDATE',
      newValue: 'APPROVED'
    });

    return rule;
  }

  static rejectRule(ruleId: string, reason: string, note?: string): CandidateRule {
    const actor = this.getCurrentUser();
    if (actor?.role !== 'FC' && actor?.role !== 'ADMIN') {
      throw new Error('Maker-Checker Violation: Only Finance Controllers can reject candidate rules.');
    }

    const rules = this.getRules();
    const updated = rules.map(r => {
      if (r.id === ruleId) {
        return {
          ...r,
          status: 'REJECTED' as RuleStatus,
          rejectedBy: `${actor.name} (${actor.role})`,
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason,
          rejectionNote: note
        };
      }
      return r;
    });

    setStored(STORAGE_KEYS.RULES, updated);
    const rule = updated.find(r => r.id === ruleId)!;

    this.recordAudit({
      actorName: actor.name,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'RULE_REJECT',
      entityType: 'RULE',
      entityId: rule.id,
      description: `Rejected candidate rule ${rule.ruleCode}: Reason: ${reason}. Note: ${note || 'None'}.`,
      previousValue: 'CANDIDATE',
      newValue: 'REJECTED'
    });

    return rule;
  }

  static bulkReviewRules(ruleIds: string[], action: 'APPROVE' | 'REJECT', payload: { effectiveDate?: string; reason?: string; note?: string }): { updatedCount: number; skippedCount: number } {
    const actor = this.getCurrentUser();
    if (actor?.role !== 'FC' && actor?.role !== 'ADMIN') {
      throw new Error('Maker-Checker Violation: Only Finance Controllers can perform rule reviews.');
    }

    const rules = this.getRules();
    let updatedCount = 0;
    let skippedCount = 0;

    const updated = rules.map(r => {
      if (ruleIds.includes(r.id)) {
        // Auto-skip rules with blocking conflict warnings if approving
        if (action === 'APPROVE' && r.conflicts.some(c => c.severity === 'BLOCKING')) {
          skippedCount++;
          return r;
        }

        updatedCount++;
        if (action === 'APPROVE') {
          return {
            ...r,
            status: 'APPROVED' as RuleStatus,
            effectiveDate: payload.effectiveDate || r.effectiveDate,
            approvedBy: `${actor.name} (${actor.role})`,
            approvedAt: new Date().toISOString()
          };
        } else {
          return {
            ...r,
            status: 'REJECTED' as RuleStatus,
            rejectedBy: `${actor.name} (${actor.role})`,
            rejectedAt: new Date().toISOString(),
            rejectionReason: payload.reason || 'Bulk controller rejection',
            rejectionNote: payload.note
          };
        }
      }
      return r;
    });

    setStored(STORAGE_KEYS.RULES, updated);

    this.recordAudit({
      actorName: actor.name,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: action === 'APPROVE' ? 'BULK_RULE_APPROVE' : 'BULK_RULE_REJECT',
      entityType: 'RULE',
      entityId: 'multiple',
      description: `Bulk ${action.toLowerCase()}d ${updatedCount} rules (${skippedCount} skipped due to blocking conflicts).`
    });

    return { updatedCount, skippedCount };
  }

  // Claims & Deterministic Evaluation
  static getClaims(): Claim[] {
    return getStored<Claim[]>(STORAGE_KEYS.CLAIMS, INITIAL_CLAIMS);
  }

  static getClaimById(id: string): Claim | undefined {
    return this.getClaims().find(c => c.id === id);
  }

  static evaluateClaim(claimData: {
    claimantName: string;
    claimantRole: string;
    claimantEmail: string;
    department: string;
    jurisdiction: string;
    incurredDate: string;
    submissionDate?: string;
    currency: string;
    category: string;
    description: string;
    isDowngrade?: boolean;
    downgradeDetails?: string;
    lineItems: Array<{
      category: string;
      description: string;
      amount: number;
      currency: string;
      date: string;
      receiptAttached: boolean;
      receiptType?: 'ITEMIZED_TAX_INVOICE' | 'SUMMARY_SLIP' | 'E_TICKET' | 'BOARDING_PASS' | 'NONE';
      vendor: string;
      flightHours?: number;
      cabinClass?: string;
    }>;
  }): Claim {
    const claims = this.getClaims();
    const rules = this.getRules();
    const claimDate = claimData.incurredDate;
    const subDate = claimData.submissionDate || new Date().toISOString().split('T')[0];

    // CRITICAL: Only rules APPROVED and with effectiveDate <= claimDate are applicable!
    const applicableRules = rules.filter(r => 
      r.status === 'APPROVED' && 
      new Date(r.effectiveDate) <= new Date(claimDate)
    );

    // Precedence and suppression resolution
    // If claim jurisdiction is 'IN', India rule RUL-IND-102 suppresses global lodging RUL-TRV-101
    const isIndiaClaim = claimData.jurisdiction === 'IN';
    const suppressedRules: any[] = [];

    if (isIndiaClaim) {
      const hasIndiaLodging = applicableRules.some(r => r.ruleCode === 'RUL-IND-102');
      if (hasIndiaLodging) {
        suppressedRules.push({
          ruleId: 'rul-trv-101',
          ruleCode: 'RUL-TRV-101',
          ruleTitle: 'Global Lodging Cap - Tier 1 Metro ($220 USD)',
          policyTitle: 'Global Corporate Travel & Lodging Standard',
          suppressedByRuleCode: 'RUL-IND-102',
          suppressedByPolicy: 'India Regional Domestic Expense Annexure',
          precedenceRationale: 'Specific national jurisdiction annexure takes priority over global default for INR-denominated travel within India.'
        });
      }
    }

    const activeEvaluatingRules = applicableRules.filter(r => 
      !suppressedRules.some(s => s.ruleCode === r.ruleCode)
    );

    const evaluatedRulesRecords: any[] = [];
    let totalClaimed = 0;
    let approvedAmount = 0;
    let disallowedAmount = 0;
    let cappedAmount = 0;
    let hasClarify = false;
    let hasReject = false;
    let rejectReasons: string[] = [];
    let clarifyReasons: string[] = [];

    // Adjudicate line items deterministically
    const adjudicatedLines: ClaimLineItem[] = claimData.lineItems.map((item, idx) => {
      totalClaimed += item.amount;
      let lineApproved = item.amount;
      let lineDisallowed = 0;
      let lineOutcome: 'APPROVED' | 'CAPPED' | 'DISALLOWED' | 'CLARIFY' = 'APPROVED';
      let lineReason = 'Complies with all deterministic parameters.';
      let appliedRuleCode = '';

      // Check temporal rule (submission window <= 30 days)
      const daysElapsed = Math.floor((new Date(subDate).getTime() - new Date(item.date).getTime()) / (1000 * 3600 * 24));
      if (daysElapsed > 30) {
        hasClarify = true;
        clarifyReasons.push(`Item #${idx + 1} submitted ${daysElapsed} days post-incurrence (> 30 days limit).`);
      }

      // Check documentation rule: > $25 requires ITEMIZED_TAX_INVOICE
      if (item.amount > 25 && (!item.receiptAttached || item.receiptType !== 'ITEMIZED_TAX_INVOICE')) {
        lineOutcome = 'CLARIFY';
        lineApproved = 0;
        hasClarify = true;
        appliedRuleCode = 'RUL-DOC-110';
        lineReason = 'Receipt missing itemized tax invoice. Credit card slip or missing receipt triggers CLARIFY (never hard reject).';
        clarifyReasons.push(`Item #${idx + 1} (${item.description}) requires itemized tax receipt.`);
        
        evaluatedRulesRecords.push({
          ruleId: 'rul-doc-110',
          ruleCode: 'RUL-DOC-110',
          ruleTitle: 'Mandatory Itemized Tax Receipt > $25',
          policyTitle: 'Global Corporate Travel & Lodging Standard',
          policyVersion: 'v2.4',
          comparator: 'DOC_REQUIREMENT',
          result: 'FAILED',
          rationale: 'Transaction > $25 lacks itemized tax receipt.',
          sourceCitation: 'POL-TRV-001 Section 8.1'
        });
      }

      // Check Lodging Monetary Cap
      if (item.category === 'LODGING') {
        if (isIndiaClaim) {
          const capINR = 7500;
          appliedRuleCode = 'RUL-IND-102';
          if (item.amount > capINR) {
            lineOutcome = 'CAPPED';
            lineApproved = capINR;
            lineDisallowed = item.amount - capINR;
            lineReason = `Capped at INR ${capINR.toLocaleString()} under India Domestic Lodging Ceilings.`;
            cappedAmount += lineDisallowed;
            disallowedAmount += lineDisallowed;
            approvedAmount += lineApproved;
          } else {
            lineOutcome = 'APPROVED';
            approvedAmount += lineApproved;
            lineReason = `Nightly rate INR ${item.amount} complies with INR 7,500 ceiling.`;
          }
          evaluatedRulesRecords.push({
            ruleId: 'rul-ind-102',
            ruleCode: 'RUL-IND-102',
            ruleTitle: 'India Domestic Hotel Cap (Tier A Metro)',
            policyTitle: 'India Regional Domestic Expense Annexure',
            policyVersion: 'v1.2',
            comparator: 'MONETARY_CAP',
            result: 'PASSED',
            rationale: `Applied India specific cap. Incurred: ${item.amount}, Cap: ${capINR}.`,
            sourceCitation: 'POL-IND-004 Section 2.1'
          });
        } else {
          // Global cap $220
          const capUSD = 220;
          appliedRuleCode = 'RUL-TRV-101';
          if (item.amount > capUSD) {
            lineOutcome = 'CAPPED';
            lineApproved = capUSD;
            lineDisallowed = item.amount - capUSD;
            lineReason = `Capped at USD ${capUSD} under Global Lodging Standard.`;
            cappedAmount += lineDisallowed;
            disallowedAmount += lineDisallowed;
            approvedAmount += lineApproved;
          } else {
            lineOutcome = 'APPROVED';
            approvedAmount += lineApproved;
            lineReason = `Nightly rate $${item.amount} complies with $220 cap.`;
          }
          evaluatedRulesRecords.push({
            ruleId: 'rul-trv-101',
            ruleCode: 'RUL-TRV-101',
            ruleTitle: 'Global Lodging Cap - Tier 1 Metro',
            policyTitle: 'Global Corporate Travel & Lodging Standard',
            policyVersion: 'v2.4',
            comparator: 'MONETARY_CAP',
            result: 'PASSED',
            rationale: `Lodging nightly rate checked against $220.00 USD cap.`,
            sourceCitation: 'POL-TRV-001 Section 5.2'
          });
        }
      } 
      // Check Airfare Cabin Class rule
      else if (item.category === 'AIRFARE') {
        const flightHours = item.flightHours || 3;
        const cabin = item.cabinClass || 'ECONOMY';
        appliedRuleCode = 'RUL-TRV-104';

        if (flightHours < 6 && (cabin.toUpperCase().includes('BUSINESS') || cabin.toUpperCase().includes('FIRST'))) {
          lineOutcome = 'DISALLOWED';
          lineApproved = 0;
          lineDisallowed = item.amount;
          hasReject = true;
          lineReason = `Direct breach of RUL-TRV-104: Flights under 6 hours (${flightHours}h) cannot be booked in ${cabin} Class.`;
          rejectReasons.push(`Commercial flight under 6h booked in unauthorized premium cabin.`);
          disallowedAmount += lineDisallowed;

          evaluatedRulesRecords.push({
            ruleId: 'rul-trv-104',
            ruleCode: 'RUL-TRV-104',
            ruleTitle: 'Airfare Cabin Class Flight Duration Entitlement',
            policyTitle: 'Global Corporate Travel & Lodging Standard',
            policyVersion: 'v2.4',
            comparator: 'ORDINAL_ENTITLEMENT',
            result: 'FAILED',
            rationale: `Flight duration ${flightHours}h < 6h cap; booked in ${cabin}.`,
            sourceCitation: 'POL-TRV-001 Section 4.1'
          });
        } else {
          lineOutcome = 'APPROVED';
          approvedAmount += lineApproved;
          lineReason = `Flight duration ${flightHours}h booked in ${cabin} is fully compliant.`;
          evaluatedRulesRecords.push({
            ruleId: 'rul-trv-104',
            ruleCode: 'RUL-TRV-104',
            ruleTitle: 'Airfare Cabin Class Flight Duration Entitlement',
            policyTitle: 'Global Corporate Travel & Lodging Standard',
            policyVersion: 'v2.4',
            comparator: 'ORDINAL_ENTITLEMENT',
            result: 'PASSED',
            rationale: `Cabin class entitlement verified.`,
            sourceCitation: 'POL-TRV-001 Section 4.1'
          });
        }
      }
      // Check Personal / Disallowed items in mixed bills
      else if (item.category === 'PERSONAL_INCIDENTAL' || item.description.toLowerCase().includes('minibar') || item.description.toLowerCase().includes('movie')) {
        lineOutcome = 'DISALLOWED';
        lineApproved = 0;
        lineDisallowed = item.amount;
        lineReason = 'Personal entertainment and minibar confectioneries are strictly non-reimbursable.';
        disallowedAmount += lineDisallowed;
      }
      else {
        // Standard approved category
        if (lineOutcome !== 'CLARIFY') {
          approvedAmount += lineApproved;
        }
      }

      return {
        id: `li-eval-${idx}-${Date.now().toString().slice(-4)}`,
        category: item.category,
        description: item.description,
        amount: item.amount,
        currency: item.currency,
        date: item.date,
        receiptAttached: item.receiptAttached,
        receiptType: item.receiptType,
        vendor: item.vendor,
        adjudication: {
          outcome: lineOutcome,
          approvedAmount: lineApproved,
          disallowedAmount: lineDisallowed,
          reason: lineReason,
          appliedRuleCode
        }
      };
    });

    // Overall claim outcome synthesis
    let finalOutcome: ClaimOutcome = 'PASS';
    let outcomeReason = 'Claim adheres to all active deterministic rules.';

    if (hasReject) {
      finalOutcome = 'AUTO_REJECT';
      outcomeReason = rejectReasons.join('; ');
      approvedAmount = 0;
      disallowedAmount = totalClaimed;
    } else if (hasClarify) {
      finalOutcome = 'CLARIFY';
      outcomeReason = clarifyReasons.join('; ');
      approvedAmount = 0; // On clarify, payout is paused pending documentation
    } else if (disallowedAmount > 0 || cappedAmount > 0) {
      finalOutcome = 'PART_APPROVE';
      outcomeReason = `Mixed bill line-level adjudication: Approved ${claimData.currency} ${approvedAmount.toFixed(2)}, Disallowed/Capped ${claimData.currency} ${(disallowedAmount).toFixed(2)}.`;
    }

    const newClaimId = `clm-${Date.now().toString().slice(-4)}`;
    const evaluatedClaim: Claim = {
      id: newClaimId,
      claimNumber: `CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      claimantName: claimData.claimantName,
      claimantRole: claimData.claimantRole,
      claimantEmail: claimData.claimantEmail,
      department: claimData.department,
      jurisdiction: claimData.jurisdiction,
      submissionDate: subDate,
      incurredDate: claimDate,
      totalClaimed,
      approvedAmount,
      disallowedAmount,
      cappedAmount,
      currency: claimData.currency,
      primaryCategory: claimData.category,
      description: claimData.description,
      outcome: finalOutcome,
      outcomeReason,
      isCompliantDowngrade: claimData.isDowngrade,
      downgradeDetails: claimData.downgradeDetails,
      lineItems: adjudicatedLines,
      evaluatedRules: evaluatedRulesRecords,
      suppressedRules: suppressedRules,
      decisionSignature: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      immutableTimestamp: new Date().toISOString()
    };

    setStored(STORAGE_KEYS.CLAIMS, [evaluatedClaim, ...claims]);

    const actor = this.getCurrentUser();
    this.recordAudit({
      actorName: actor?.name || 'Deterministic Engine',
      actorEmail: actor?.email || 'engine@policyos.internal',
      actorRole: actor?.role || 'FC',
      action: 'CLAIM_EVALUATION',
      entityType: 'CLAIM',
      entityId: evaluatedClaim.id,
      description: `Evaluated ${evaluatedClaim.claimNumber} with outcome ${evaluatedClaim.outcome}. Approved: ${evaluatedClaim.currency} ${evaluatedClaim.approvedAmount}.`,
      newValue: evaluatedClaim.outcome
    });

    return evaluatedClaim;
  }

  // Async Jobs
  static getJobs(): AsyncJob[] {
    const jobs = getStored<AsyncJob[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    // Simulate gradual progress of running jobs
    const updated = jobs.map(j => {
      if (j.status === 'RUNNING') {
        const nextProgress = Math.min(100, j.progress + 15);
        if (nextProgress >= 100) {
          return {
            ...j,
            progress: 100,
            status: 'COMPLETED' as const,
            currentStage: 'Completed',
            estimatedRemainingSeconds: 0,
            completedAt: new Date().toISOString(),
            resultSummary: 'Extraction completed. Extracted 2 candidate rules.'
          };
        }
        return {
          ...j,
          progress: nextProgress,
          estimatedRemainingSeconds: Math.max(0, j.estimatedRemainingSeconds - 4)
        };
      }
      return j;
    });
    setStored(STORAGE_KEYS.JOBS, updated);
    return updated;
  }

  // Replay Lab
  static getReplaySimulation(): ReplaySimulation {
    return getStored<ReplaySimulation>(STORAGE_KEYS.REPLAY, INITIAL_REPLAY_SIMULATION);
  }

  static runReplaySimulation(ruleId: string, proposedCap: number): ReplaySimulation {
    const rules = this.getRules();
    const targetRule = rules.find(r => r.id === ruleId) || rules[0];

    // Compute realistic shifts
    const beforePayout = 91400.0;
    const sampleSize = 420;
    const factor = Math.max(0.6, proposedCap / 220.0);
    const afterPayout = Math.round(beforePayout * factor);
    const delta = afterPayout - beforePayout;
    const shifts = Math.round((1 - factor) * 120);

    const simulation: ReplaySimulation = {
      id: `rep-sim-${Date.now().toString().slice(-4)}`,
      ruleId: targetRule.id,
      ruleTitle: targetRule.title,
      ruleCode: targetRule.ruleCode,
      comparator: targetRule.comparator,
      proposedChangeSummary: `Adjusting monetary cap parameter to $${proposedCap.toFixed(2)} USD.`,
      sampleSize,
      evaluatedAt: new Date().toISOString(),
      beforeStats: {
        pass: 340,
        partApprove: 52,
        clarify: 18,
        autoReject: 10,
        totalPayout: beforePayout
      },
      afterStats: {
        pass: Math.max(200, 340 - shifts),
        partApprove: 52 + shifts,
        clarify: 18,
        autoReject: 10,
        totalPayout: afterPayout
      },
      netFinancialDelta: delta,
      outcomeShifts: shifts,
      sampleDiffs: [
        {
          claimNumber: 'CLM-2026-9041',
          claimant: 'Samantha Wu',
          category: 'LODGING',
          beforeOutcome: 'PART_APPROVE',
          afterOutcome: 'PART_APPROVE',
          beforePayout: 420.0,
          afterPayout: 420.0 + (proposedCap - 220),
          delta: proposedCap - 220,
          rationale: `Nightly room rate evaluated against adjusted cap of $${proposedCap}.`
        },
        {
          claimNumber: 'CLM-2026-4401',
          claimant: 'Marcus Vance',
          category: 'LODGING',
          beforeOutcome: 'PASS',
          afterOutcome: proposedCap < 215 ? 'PART_APPROVE' : 'PASS',
          beforePayout: 215.0,
          afterPayout: Math.min(215.0, proposedCap),
          delta: Math.min(0, proposedCap - 215.0),
          rationale: `Room folio $215 shifted outcome under new cap ceiling.`
        }
      ]
    };

    setStored(STORAGE_KEYS.REPLAY, simulation);

    const actor = this.getCurrentUser();
    this.recordAudit({
      actorName: actor?.name || 'Controller',
      actorEmail: actor?.email || 'fc@policyos.internal',
      actorRole: actor?.role || 'FC',
      action: 'REPLAY_SIMULATION',
      entityType: 'RULE',
      entityId: ruleId,
      description: `Executed Replay simulation on N=${sampleSize} claims with proposed parameter $${proposedCap}. Net variance: $${delta}.`
    });

    return simulation;
  }

  // Audit Events
  static getAuditEvents(): AuditEvent[] {
    return getStored<AuditEvent[]>(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_EVENTS);
  }

  static recordAudit(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const current = getStored<AuditEvent[]>(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_EVENTS);
    const newEvent: AuditEvent = {
      ...event,
      id: `aud-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString()
    };
    setStored(STORAGE_KEYS.AUDIT, [newEvent, ...current]);
  }

  // System Limits
  static getSystemLimits(): SystemLimits {
    return getStored<SystemLimits>(STORAGE_KEYS.LIMITS, INITIAL_SYSTEM_LIMITS);
  }

  static updateSystemLimits(newLimits: Partial<SystemLimits>): SystemLimits {
    const current = this.getSystemLimits();
    const updated = { ...current, ...newLimits };
    setStored(STORAGE_KEYS.LIMITS, updated);

    const actor = this.getCurrentUser();
    this.recordAudit({
      actorName: actor?.name || 'Admin',
      actorEmail: actor?.email || 'admin@policyos.internal',
      actorRole: actor?.role || 'ADMIN',
      action: 'SYSTEM_LIMITS_UPDATE',
      entityType: 'SYSTEM_LIMITS',
      entityId: 'global_config',
      description: `Updated system limits configuration.`
    });

    return updated;
  }
}
