import {
  User,
  Policy,
  CandidateRule,
  AsyncJob,
  Claim,
  ReplaySimulation,
  AuditEvent,
  SystemLimits
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-fc-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@acmepolicy.com',
    role: 'FC',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    department: 'Corporate Finance & Controls',
    status: 'active',
    lastLogin: '2026-09-24T08:15:22Z'
  },
  {
    id: 'usr-po-1',
    name: 'Alex Chen',
    email: 'alex.chen@acmepolicy.com',
    role: 'PO',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Global Travel & Procurement',
    status: 'active',
    lastLogin: '2026-09-23T14:40:10Z'
  },
  {
    id: 'usr-adm-1',
    name: 'Marcus Vance',
    email: 'marcus.vance@acmepolicy.com',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'IT Security & Compliance',
    status: 'active',
    lastLogin: '2026-09-24T06:12:00Z'
  },
  {
    id: 'usr-po-2',
    name: 'Elena Rostova',
    email: 'elena.rostova@acmepolicy.com',
    role: 'PO',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'People Operations & Workplace',
    status: 'active',
    lastLogin: '2026-09-20T11:05:43Z'
  },
  {
    id: 'usr-rev-1',
    name: 'David Kross (Revoked Demo)',
    email: 'david.kross@acmepolicy.com',
    role: 'PO',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    department: 'Procurement Specialist',
    status: 'revoked',
    lastLogin: '2026-09-15T09:22:15Z'
  }
];

export const INITIAL_POLICIES: Policy[] = [
  {
    id: 'pol-trv-001',
    title: 'Global Corporate Travel & Lodging Standard',
    code: 'POL-TRV-001',
    version: 'v2.4',
    ownerId: 'usr-po-1',
    ownerName: 'Alex Chen',
    jurisdiction: 'GLOBAL',
    department: 'All Departments',
    effectiveFrom: '2026-01-01',
    status: 'LIVE',
    sourceFileName: 'Global_Travel_Policy_v2.4_Final.pdf',
    sourceFileSize: '2.4 MB',
    sourceFilePages: 14,
    extractedRulesCount: 8,
    approvedRulesCount: 6,
    candidateRulesCount: 2,
    summary: 'Standardized global guidelines for commercial air travel, lodging caps, ground transportation, and incidental allowances.',
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2026-02-10T16:30:00Z',
    documentClauses: [
      {
        id: 'cls-101',
        pageNumber: 3,
        sectionCode: 'Section 4.1',
        heading: 'Commercial Air Transportation Classes',
        text: 'All employees must book economy class seating for domestic and continental flights where total scheduled flight duration is under six (6) continuous hours. Flights exceeding six (6) hours continuous duration are eligible for premium economy or business class entitlement with prior written division head authorization.',
        linkedRuleId: 'rul-trv-104',
        highlightCategory: 'ORDINAL_ENTITLEMENT'
      },
      {
        id: 'cls-102',
        pageNumber: 5,
        sectionCode: 'Section 5.2',
        heading: 'Nightly Lodging Thresholds',
        text: 'Standard commercial hotel nightly rates shall not exceed USD 220.00 per night excluding statutory taxes in Tier 1 global metropolitan centers (e.g., New York, London, Tokyo, Singapore, San Francisco). For secondary and tertiary markets, the nightly cap is fixed at USD 150.00 per night.',
        linkedRuleId: 'rul-trv-101',
        highlightCategory: 'MONETARY_CAP'
      },
      {
        id: 'cls-103',
        pageNumber: 7,
        sectionCode: 'Section 6.4',
        heading: 'Compliant Fare Downgrades',
        text: 'Where an employee voluntarily or by availability books a lower fare class than their authorized entitlement (e.g. Economy instead of Business, or Compact instead of Intermediate rental), the expense claim shall be processed without penalty and compensated up to the actual incurred amount.',
        linkedRuleId: 'rul-trv-105',
        highlightCategory: 'ORDINAL_ENTITLEMENT'
      },
      {
        id: 'cls-104',
        pageNumber: 9,
        sectionCode: 'Section 8.1',
        heading: 'Itemized Substantiation Mandate',
        text: 'Receipts are strictly mandatory for any individual expense item exceeding USD 25.00. Payment vouchers, credit card cardholder summary slips, or bank transaction statements that lack an itemized breakdown of goods/services do not constitute valid tax documentation. Missing invoices will require explicit clarification.',
        linkedRuleId: 'rul-doc-110',
        highlightCategory: 'DOC_REQUIREMENT'
      }
    ]
  },
  {
    id: 'pol-ind-004',
    title: 'India Regional Domestic Expense Annexure',
    code: 'POL-IND-004',
    version: 'v1.2',
    ownerId: 'usr-po-1',
    ownerName: 'Alex Chen',
    jurisdiction: 'IN',
    department: 'India Entities & Regional Branches',
    effectiveFrom: '2026-01-15',
    status: 'LIVE',
    sourceFileName: 'India_Domestic_Travel_Annexure_2026.pdf',
    sourceFileSize: '1.1 MB',
    sourceFilePages: 8,
    extractedRulesCount: 4,
    approvedRulesCount: 4,
    candidateRulesCount: 0,
    summary: 'Localized lodging and meal ceilings for travel within India. Precedence supersedes global caps for Indian rupee denominated claims.',
    createdAt: '2026-01-05T09:20:00Z',
    updatedAt: '2026-01-15T11:00:00Z',
    documentClauses: [
      {
        id: 'cls-201',
        pageNumber: 2,
        sectionCode: 'Section 2.1',
        heading: 'Domestic Hotel Ceilings in India',
        text: 'For travel within Indian metropolitan territories (Tier A: Mumbai, Bengaluru, Delhi NCR, Hyderabad, Chennai), the nightly hotel reimbursement limit is capped at INR 7,500 inclusive of taxes. For Tier B cities, the ceiling is INR 5,000.',
        linkedRuleId: 'rul-ind-102',
        highlightCategory: 'MONETARY_CAP'
      }
    ]
  },
  {
    id: 'pol-ent-008',
    title: 'Client Hospitality & Executive Entertainment Policy',
    code: 'POL-ENT-008',
    version: 'v3.0',
    ownerId: 'usr-po-1',
    ownerName: 'Alex Chen',
    jurisdiction: 'GLOBAL',
    department: 'Sales, Marketing & BD',
    effectiveFrom: '2026-02-01',
    status: 'LIVE',
    sourceFileName: 'Client_Hospitality_Standard_v3.pdf',
    sourceFileSize: '1.8 MB',
    sourceFilePages: 11,
    extractedRulesCount: 6,
    approvedRulesCount: 5,
    candidateRulesCount: 1,
    summary: 'Rules governing business meals with external clients, per-head monetary ceilings, alcohol allowances, and quota frequency.',
    createdAt: '2026-01-20T14:15:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    documentClauses: [
      {
        id: 'cls-301',
        pageNumber: 4,
        sectionCode: 'Section 3.2',
        heading: 'Per-Attendee Meal Cap',
        text: 'Business dinners hosted for verified prospective or active clients shall not exceed USD 120.00 per attendee, including food, beverage, and gratuity. Itemized receipt and complete list of external attendee names and affiliations must accompany the reimbursement filing.',
        linkedRuleId: 'rul-ent-103',
        highlightCategory: 'MONETARY_CAP'
      }
    ]
  },
  {
    id: 'pol-eqp-012',
    title: 'Remote Workplace Equipment & Hardware Stipend',
    code: 'POL-EQP-012',
    version: 'v1.0',
    ownerId: 'usr-po-1',
    ownerName: 'Alex Chen',
    jurisdiction: 'GLOBAL',
    department: 'Engineering, Product, Remote Staff',
    effectiveFrom: '2026-04-01',
    status: 'PROPOSED',
    sourceFileName: 'Remote_Hardware_Stipend_Proposal_v1.pdf',
    sourceFileSize: '950 KB',
    sourceFilePages: 6,
    extractedRulesCount: 4,
    approvedRulesCount: 0,
    candidateRulesCount: 4,
    summary: 'Candidate policy establishing ergonomic furniture, external monitors, and peripheral reimbursement allowances under evaluation.',
    createdAt: '2026-03-10T16:00:00Z',
    updatedAt: '2026-03-12T09:30:00Z',
    documentClauses: [
      {
        id: 'cls-401',
        pageNumber: 3,
        sectionCode: 'Section 2.4',
        heading: 'Display Hardware Rolling Quota',
        text: 'Eligible full-time remote personnel may claim one (1) external display monitor up to USD 400.00 once within any twenty-four (24) consecutive month rolling period. Auxiliary adapters and cables must not exceed USD 50.00.',
        linkedRuleId: 'rul-eqp-108',
        highlightCategory: 'QUOTA'
      }
    ]
  },
  {
    id: 'pol-rel-099',
    title: 'Legacy Expatriate Relocation Standard 2023',
    code: 'POL-REL-099',
    version: 'v1.0',
    ownerId: 'usr-po-2',
    ownerName: 'Elena Rostova',
    jurisdiction: 'GLOBAL',
    department: 'HR Global Mobility',
    effectiveFrom: '2023-01-01',
    effectiveTo: '2025-12-31',
    status: 'ARCHIVED',
    sourceFileName: 'Relocation_Standard_2023_Archive.pdf',
    sourceFileSize: '3.1 MB',
    sourceFilePages: 22,
    extractedRulesCount: 12,
    approvedRulesCount: 12,
    candidateRulesCount: 0,
    summary: 'Superseded international relocation allowances for historical audit and retrospective claims adjudication.',
    createdAt: '2022-11-10T08:00:00Z',
    updatedAt: '2025-12-31T23:59:59Z',
    documentClauses: []
  },
  {
    id: 'pol-apc-021',
    title: 'APAC Field Representative Fuel & Transit Allowance',
    code: 'POL-APC-021',
    version: 'v0.9',
    ownerId: 'usr-po-2',
    ownerName: 'Elena Rostova',
    jurisdiction: 'APAC',
    department: 'Field Sales',
    effectiveFrom: '2026-05-01',
    status: 'FAILED',
    sourceFileName: 'APAC_Field_Mileage_Scan_Corrupt.pdf',
    sourceFileSize: '520 KB',
    sourceFilePages: 4,
    extractedRulesCount: 0,
    approvedRulesCount: 0,
    candidateRulesCount: 0,
    summary: 'Document parsing failed during OCR text layer reconstruction due to invalid embedded PostScript glyph tables.',
    createdAt: '2026-03-01T11:45:00Z',
    updatedAt: '2026-03-01T11:48:22Z',
    documentClauses: []
  }
];

export const INITIAL_RULES: CandidateRule[] = [
  {
    id: 'rul-trv-101',
    policyId: 'pol-trv-001',
    policyTitle: 'Global Corporate Travel & Lodging Standard',
    policyCode: 'POL-TRV-001',
    policyVersion: 'v2.4',
    ruleCode: 'RUL-TRV-101',
    title: 'Global Lodging Cap - Tier 1 Metro',
    comparator: 'MONETARY_CAP',
    status: 'APPROVED',
    naturalLanguageSummary: 'Standard lodging rate capped at $220.00 USD per night (before statutory taxes) for Tier 1 global metropolitan destinations.',
    formalLogic: 'ASSERT claim.category == "LODGING" && claim.jurisdiction != "IN" => line_item.amount_per_night <= 220.00 USD',
    parameters: {
      capAmount: 220.0,
      currency: 'USD',
      period: 'PER_NIGHT',
      allowedCategories: ['LODGING', 'HOTEL']
    },
    sourceClause: {
      page: 5,
      section: 'Section 5.2',
      text: 'Standard commercial hotel nightly rates shall not exceed USD 220.00 per night excluding statutory taxes in Tier 1 global metropolitan centers.',
      confidence: 0.98
    },
    impactAnalysis: {
      historicalClaimsAffected: 384,
      projectedAnnualVariance: -42500,
      riskLevel: 'LOW',
      notes: 'Matches prevailing corporate negotiated rates across Marriott and Hilton preferred corporate accounts.'
    },
    conflicts: [],
    effectiveDate: '2026-01-01',
    approvedBy: 'Sarah Jenkins (FC)',
    approvedAt: '2025-12-28T14:20:00Z'
  },
  {
    id: 'rul-ind-102',
    policyId: 'pol-ind-004',
    policyTitle: 'India Regional Domestic Expense Annexure',
    policyCode: 'POL-IND-004',
    policyVersion: 'v1.2',
    ruleCode: 'RUL-IND-102',
    title: 'India Domestic Hotel Cap (Tier A Metro)',
    comparator: 'MONETARY_CAP',
    status: 'APPROVED',
    naturalLanguageSummary: 'Ceiling of INR 7,500 per night for lodging in Tier A Indian cities (Mumbai, Bengaluru, Delhi NCR, Hyderabad, Chennai).',
    formalLogic: 'ASSERT claim.jurisdiction == "IN" && claim.category == "LODGING" => line_item.amount_per_night <= 7500.00 INR [SUPPRESSES POL-TRV-001/RUL-TRV-101]',
    parameters: {
      capAmount: 7500.0,
      currency: 'INR',
      period: 'PER_NIGHT',
      allowedCategories: ['LODGING']
    },
    sourceClause: {
      page: 2,
      section: 'Section 2.1',
      text: 'For travel within Indian metropolitan territories (Tier A), the nightly hotel reimbursement limit is capped at INR 7,500 inclusive of taxes.',
      confidence: 0.99
    },
    impactAnalysis: {
      historicalClaimsAffected: 142,
      projectedAnnualVariance: -18200,
      riskLevel: 'LOW',
      notes: 'Jurisdiction-specific precedence rule that supersedes global USD cap.'
    },
    conflicts: [],
    effectiveDate: '2026-01-15',
    approvedBy: 'Sarah Jenkins (FC)',
    approvedAt: '2026-01-14T09:15:00Z'
  },
  {
    id: 'rul-trv-104',
    policyId: 'pol-trv-001',
    policyTitle: 'Global Corporate Travel & Lodging Standard',
    policyCode: 'POL-TRV-001',
    policyVersion: 'v2.4',
    ruleCode: 'RUL-TRV-104',
    title: 'Airfare Cabin Class Flight Duration Entitlement',
    comparator: 'ORDINAL_ENTITLEMENT',
    status: 'APPROVED',
    naturalLanguageSummary: 'Commercial flights under 6 hours duration must be booked in Economy. Business Class is restricted to continuous flights >= 6 hours.',
    formalLogic: 'ASSERT claim.category == "AIRFARE" && claim.flight_hours < 6.0 => claim.cabin_class == "ECONOMY"',
    parameters: {
      entitlementLevel: 'ECONOMY',
      allowedCategories: ['AIRFARE', 'FLIGHT']
    },
    sourceClause: {
      page: 3,
      section: 'Section 4.1',
      text: 'All employees must book economy class seating for domestic and continental flights where total scheduled flight duration is under six (6) continuous hours.',
      confidence: 0.97
    },
    impactAnalysis: {
      historicalClaimsAffected: 95,
      projectedAnnualVariance: -68000,
      riskLevel: 'MEDIUM',
      notes: 'Directly curtails unauthorized premium cabin domestic upgrades.'
    },
    conflicts: [],
    effectiveDate: '2026-01-01',
    approvedBy: 'Sarah Jenkins (FC)',
    approvedAt: '2025-12-28T14:22:00Z'
  },
  {
    id: 'rul-doc-110',
    policyId: 'pol-trv-001',
    policyTitle: 'Global Corporate Travel & Lodging Standard',
    policyCode: 'POL-TRV-001',
    policyVersion: 'v2.4',
    ruleCode: 'RUL-DOC-110',
    title: 'Mandatory Itemized Tax Receipt > $25',
    comparator: 'DOC_REQUIREMENT',
    status: 'APPROVED',
    naturalLanguageSummary: 'Full itemized tax invoice mandatory for any single transaction exceeding $25.00 USD. Summary card slips require clarification.',
    formalLogic: 'ASSERT line_item.amount > 25.00 USD => line_item.receipt_attached == true && line_item.receipt_type == "ITEMIZED_TAX_INVOICE" [ELSE CLARIFY]',
    parameters: {
      mandatoryAboveAmount: 25.0,
      currency: 'USD',
      requiredReceiptTypes: ['ITEMIZED_TAX_INVOICE']
    },
    sourceClause: {
      page: 9,
      section: 'Section 8.1',
      text: 'Receipts are strictly mandatory for any individual expense item exceeding USD 25.00... Missing invoices will require explicit clarification.',
      confidence: 0.96
    },
    impactAnalysis: {
      historicalClaimsAffected: 210,
      projectedAnnualVariance: 0,
      riskLevel: 'LOW',
      notes: 'Deterministic trigger for CLARIFY state rather than harsh rejection.'
    },
    conflicts: [],
    effectiveDate: '2026-01-01',
    approvedBy: 'Sarah Jenkins (FC)',
    approvedAt: '2025-12-28T14:25:00Z'
  },
  {
    id: 'rul-ent-103',
    policyId: 'pol-ent-008',
    policyTitle: 'Client Hospitality & Executive Entertainment Policy',
    policyCode: 'POL-ENT-008',
    policyVersion: 'v3.0',
    ruleCode: 'RUL-ENT-103',
    title: 'Client Business Dinner Per-Head Ceiling',
    comparator: 'MONETARY_CAP',
    status: 'APPROVED',
    naturalLanguageSummary: 'Client hospitality dinners capped at $120.00 USD per attendee with mandatory attendee manifest.',
    formalLogic: 'ASSERT claim.category == "CLIENT_DINNER" => (claim.total_amount / claim.attendee_count) <= 120.00 USD',
    parameters: {
      capAmount: 120.0,
      currency: 'USD',
      period: 'PER_TRANSACTION',
      allowedCategories: ['MEALS', 'CLIENT_DINNER']
    },
    sourceClause: {
      page: 4,
      section: 'Section 3.2',
      text: 'Business dinners hosted for verified prospective or active clients shall not exceed USD 120.00 per attendee, including food, beverage, and gratuity.',
      confidence: 0.95
    },
    impactAnalysis: {
      historicalClaimsAffected: 88,
      projectedAnnualVariance: -14200,
      riskLevel: 'LOW',
      notes: 'Auditable against external CRM guest logs.'
    },
    conflicts: [],
    effectiveDate: '2026-02-01',
    approvedBy: 'Sarah Jenkins (FC)',
    approvedAt: '2026-01-25T16:00:00Z'
  },
  {
    id: 'rul-tmp-112',
    policyId: 'pol-trv-001',
    policyTitle: 'Global Corporate Travel & Lodging Standard',
    policyCode: 'POL-TRV-001',
    policyVersion: 'v2.4',
    ruleCode: 'RUL-TMP-112',
    title: '30-Day Expense Claim Temporal Filing Window',
    comparator: 'TEMPORAL',
    status: 'APPROVED',
    naturalLanguageSummary: 'Expenses must be filed within 30 calendar days from the date incurred. Claims older than 30 days require controller waiver.',
    formalLogic: 'ASSERT (claim.submission_date - claim.incurred_date) <= 30 DAYS',
    parameters: {
      maxFilingDays: 30
    },
    sourceClause: {
      page: 11,
      section: 'Section 10.3',
      text: 'All expense claims must be formally submitted within thirty (30) calendar days from the date of expense incurrence.',
      confidence: 0.99
    },
    impactAnalysis: {
      historicalClaimsAffected: 45,
      projectedAnnualVariance: 0,
      riskLevel: 'LOW',
      notes: 'Improves month-end financial close predictability.'
    },
    conflicts: [],
    effectiveDate: '2026-01-01',
    approvedBy: 'Sarah Jenkins (FC)',
    approvedAt: '2025-12-28T14:30:00Z'
  },
  // Candidate rules awaiting FC review
  {
    id: 'rul-trv-105',
    policyId: 'pol-trv-001',
    policyTitle: 'Global Corporate Travel & Lodging Standard',
    policyCode: 'POL-TRV-001',
    policyVersion: 'v2.4',
    ruleCode: 'RUL-TRV-105',
    title: 'Vehicle Rental Class Entitlement & Cap',
    comparator: 'ORDINAL_ENTITLEMENT',
    status: 'CANDIDATE',
    naturalLanguageSummary: 'Standard rental cars capped at Intermediate or Compact classes. Premium SUVs, sports, and luxury vehicles require VP signoff.',
    formalLogic: 'ASSERT claim.category == "CAR_RENTAL" => claim.vehicle_class IN ["COMPACT", "INTERMEDIATE", "STANDARD_SEDAN"]',
    parameters: {
      entitlementLevel: 'INTERMEDIATE',
      allowedCategories: ['CAR_RENTAL', 'GROUND_TRANSPORT']
    },
    sourceClause: {
      page: 7,
      section: 'Section 6.4',
      text: 'Vehicle rental reservations must not exceed Intermediate Sedan class unless group travel of 4+ passengers is documented.',
      confidence: 0.91
    },
    impactAnalysis: {
      historicalClaimsAffected: 32,
      projectedAnnualVariance: -9400,
      riskLevel: 'LOW',
      notes: 'Reduces high-variance SUV bookings on single-traveler sales trips.'
    },
    conflicts: [
      {
        conflictingRuleId: 'rul-trv-101',
        conflictingPolicy: 'Global Corporate Travel & Lodging Standard',
        conflictingVersion: 'v2.4',
        issue: 'Overlaps with incidental parking allowances mentioned in Section 6.2',
        severity: 'WARNING'
      }
    ],
    effectiveDate: '2026-04-01'
  },
  {
    id: 'rul-eqp-108',
    policyId: 'pol-eqp-012',
    policyTitle: 'Remote Workplace Equipment & Hardware Stipend',
    policyCode: 'POL-EQP-012',
    policyVersion: 'v1.0',
    ruleCode: 'RUL-EQP-108',
    title: 'External Monitor 24-Month Rolling Quota',
    comparator: 'QUOTA',
    status: 'CANDIDATE',
    naturalLanguageSummary: 'Maximum 1 external monitor reimbursement up to $400.00 USD per employee per 24 rolling months.',
    formalLogic: 'ASSERT claim.category == "HARDWARE" && item.subtype == "MONITOR" => quota(employee.id, "MONITOR", 24_MONTHS) <= 1 && item.amount <= 400.00 USD',
    parameters: {
      quotaLimit: 1,
      quotaWindowDays: 730,
      capAmount: 400.0,
      currency: 'USD',
      allowedCategories: ['HARDWARE', 'OFFICE_EQUIPMENT']
    },
    sourceClause: {
      page: 3,
      section: 'Section 2.4',
      text: 'Eligible full-time remote personnel may claim one (1) external display monitor up to USD 400.00 once within any twenty-four (24) consecutive month rolling period.',
      confidence: 0.94
    },
    impactAnalysis: {
      historicalClaimsAffected: 110,
      projectedAnnualVariance: -31200,
      riskLevel: 'HIGH',
      notes: 'High financial impact. Requires integration with IT hardware asset inventory to prevent double-claiming.'
    },
    conflicts: [
      {
        conflictingRuleId: 'rul-legacy-mon',
        conflictingPolicy: 'Engineering Tools Stipend 2024',
        conflictingVersion: 'v1.1',
        issue: 'Direct quota window conflict: previous policy used annual fiscal year quota ($300/yr).',
        severity: 'BLOCKING'
      }
    ],
    effectiveDate: '2026-04-01'
  }
];

export const INITIAL_CLAIMS: Claim[] = [
  {
    id: 'clm-2026-8812',
    claimNumber: 'CLM-2026-8812',
    claimantName: 'Jordan Rivera',
    claimantRole: 'Principal Solutions Architect',
    claimantEmail: 'jordan.rivera@acmepolicy.com',
    department: 'Sales Engineering',
    jurisdiction: 'US',
    submissionDate: '2026-09-18',
    incurredDate: '2026-09-14',
    totalClaimed: 342.0,
    approvedAmount: 342.0,
    disallowedAmount: 0.0,
    cappedAmount: 0.0,
    currency: 'USD',
    primaryCategory: 'AIRFARE',
    description: 'Domestic client kickoff in Chicago (United Airlines Flight 1422, Economy class). Fully compliant.',
    outcome: 'PASS',
    outcomeReason: 'Flight duration 4.2h booked in Economy class with valid itemized ticket and digital boarding pass attached. Compliant downgrade from flexible fare.',
    isCompliantDowngrade: true,
    downgradeDetails: 'Claimant was authorized for Flexible Economy ($480) but booked standard Restricted Economy ($342). Passed automatically with zero penalties.',
    decisionSignature: 'sha256:d8c201a073fbe65c3b8e722a492b45129ffb19e9921764642ab74ffc1890',
    immutableTimestamp: '2026-09-18T14:32:01Z',
    lineItems: [
      {
        id: 'li-8812-1',
        category: 'AIRFARE',
        description: 'SFO -> ORD Economy Seat 18B (Direct)',
        amount: 342.0,
        currency: 'USD',
        date: '2026-09-14',
        receiptAttached: true,
        receiptType: 'ITEMIZED_TAX_INVOICE',
        vendor: 'United Airlines Inc.',
        adjudication: {
          outcome: 'APPROVED',
          approvedAmount: 342.0,
          disallowedAmount: 0.0,
          reason: 'Meets RUL-TRV-104 (flight under 6 hours in Economy cabin) and RUL-DOC-110 (itemized invoice verified).',
          appliedRuleCode: 'RUL-TRV-104'
        }
      }
    ],
    evaluatedRules: [
      {
        ruleId: 'rul-trv-104',
        ruleCode: 'RUL-TRV-104',
        ruleTitle: 'Airfare Cabin Class Flight Duration Entitlement',
        policyTitle: 'Global Corporate Travel & Lodging Standard',
        policyVersion: 'v2.4',
        comparator: 'ORDINAL_ENTITLEMENT',
        result: 'PASSED',
        rationale: 'Flight duration 4h 12m < 6h cap; booked in Economy.',
        sourceCitation: 'POL-TRV-001 Section 4.1'
      },
      {
        ruleId: 'rul-doc-110',
        ruleCode: 'RUL-DOC-110',
        ruleTitle: 'Mandatory Itemized Tax Receipt > $25',
        policyTitle: 'Global Corporate Travel & Lodging Standard',
        policyVersion: 'v2.4',
        comparator: 'DOC_REQUIREMENT',
        result: 'PASSED',
        rationale: 'Itemized airline tax invoice attached and verified.',
        sourceCitation: 'POL-TRV-001 Section 8.1'
      },
      {
        ruleId: 'rul-tmp-112',
        ruleCode: 'RUL-TMP-112',
        ruleTitle: '30-Day Expense Claim Temporal Filing Window',
        policyTitle: 'Global Corporate Travel & Lodging Standard',
        policyVersion: 'v2.4',
        comparator: 'TEMPORAL',
        result: 'PASSED',
        rationale: 'Incurred 2026-09-14, submitted 2026-09-18 (4 days elapsed <= 30 days).',
        sourceCitation: 'POL-TRV-001 Section 10.3'
      }
    ],
    suppressedRules: []
  },
  {
    id: 'clm-2026-9041',
    claimNumber: 'CLM-2026-9041',
    claimantName: 'Samantha Wu',
    claimantRole: 'Enterprise Account Executive',
    claimantEmail: 'samantha.wu@acmepolicy.com',
    department: 'Enterprise Sales',
    jurisdiction: 'US',
    submissionDate: '2026-09-20',
    incurredDate: '2026-09-16',
    totalClaimed: 492.0,
    approvedAmount: 420.0,
    disallowedAmount: 72.0,
    cappedAmount: 0.0,
    currency: 'USD',
    primaryCategory: 'LODGING',
    description: '2-night business stay at Grand Hyatt Seattle with client meeting wifi and minibar folio.',
    outcome: 'PART_APPROVE',
    outcomeReason: 'Mixed bill adjudication: Lodging rate approved ($195/night) and business wifi approved ($15/day). Disallowed $72 for minibar alcoholic beverages & personal pay-per-view movies.',
    decisionSignature: 'sha256:884e9102abcc4952093847aa1f402c91838848ffba018274718301829bbcc201',
    immutableTimestamp: '2026-09-20T17:10:45Z',
    lineItems: [
      {
        id: 'li-9041-1',
        category: 'LODGING',
        description: 'Room Rate (2 nights @ $195.00/night)',
        amount: 390.0,
        currency: 'USD',
        date: '2026-09-16',
        receiptAttached: true,
        receiptType: 'ITEMIZED_TAX_INVOICE',
        vendor: 'Grand Hyatt Seattle',
        adjudication: {
          outcome: 'APPROVED',
          approvedAmount: 390.0,
          disallowedAmount: 0.0,
          reason: 'Nightly rate $195.00 is strictly under the $220.00 Tier 1 cap.',
          appliedRuleCode: 'RUL-TRV-101'
        }
      },
      {
        id: 'li-9041-2',
        category: 'INTERNET',
        description: 'Premium In-Room High Speed Wi-Fi (2 days @ $15.00)',
        amount: 30.0,
        currency: 'USD',
        date: '2026-09-16',
        receiptAttached: true,
        receiptType: 'ITEMIZED_TAX_INVOICE',
        vendor: 'Grand Hyatt Seattle',
        adjudication: {
          outcome: 'APPROVED',
          approvedAmount: 30.0,
          disallowedAmount: 0.0,
          reason: 'Business internet connection allowed for remote client engagement.',
          appliedRuleCode: 'RUL-TRV-101'
        }
      },
      {
        id: 'li-9041-3',
        category: 'PERSONAL_INCIDENTAL',
        description: 'In-Room Minibar Snacks & Pay-Per-View Cinema',
        amount: 72.0,
        currency: 'USD',
        date: '2026-09-17',
        receiptAttached: true,
        receiptType: 'ITEMIZED_TAX_INVOICE',
        vendor: 'Grand Hyatt Seattle',
        adjudication: {
          outcome: 'DISALLOWED',
          approvedAmount: 0.0,
          disallowedAmount: 72.0,
          reason: 'Personal entertainment and minibar confectioneries are strictly non-reimbursable under Section 5.4.',
          appliedRuleCode: 'RUL-TRV-101'
        }
      }
    ],
    evaluatedRules: [
      {
        ruleId: 'rul-trv-101',
        ruleCode: 'RUL-TRV-101',
        ruleTitle: 'Global Lodging Cap - Tier 1 Metro',
        policyTitle: 'Global Corporate Travel & Lodging Standard',
        policyVersion: 'v2.4',
        comparator: 'MONETARY_CAP',
        result: 'PASSED',
        rationale: 'Hotel room night rate $195 <= $220 cap.',
        sourceCitation: 'POL-TRV-001 Section 5.2'
      },
      {
        ruleId: 'rul-doc-110',
        ruleCode: 'RUL-DOC-110',
        ruleTitle: 'Mandatory Itemized Tax Receipt > $25',
        policyTitle: 'Global Corporate Travel & Lodging Standard',
        policyVersion: 'v2.4',
        comparator: 'DOC_REQUIREMENT',
        result: 'PASSED',
        rationale: 'Full hotel folio with line-by-line itemization provided.',
        sourceCitation: 'POL-TRV-001 Section 8.1'
      }
    ],
    suppressedRules: []
  },
  {
    id: 'clm-2026-7492',
    claimNumber: 'CLM-2026-7492',
    claimantName: 'Rohan Mehta',
    claimantRole: 'Product Director',
    claimantEmail: 'rohan.mehta@acmepolicy.com',
    department: 'Product Management',
    jurisdiction: 'GLOBAL',
    submissionDate: '2026-09-21',
    incurredDate: '2026-09-19',
    totalClaimed: 280.0,
    approvedAmount: 0.0,
    disallowedAmount: 0.0,
    cappedAmount: 0.0,
    currency: 'USD',
    primaryCategory: 'MEALS',
    description: 'Working team dinner with prospective design advisory board members at Osteria Morini.',
    outcome: 'CLARIFY',
    outcomeReason: 'Missing mandatory itemized tax receipt. Claimant attached credit card EFT POS transaction slip showing total only ($280.00) without itemized order breakdown.',
    decisionSignature: 'sha256:7198a287cbf9028a49c90a12bf843818e9a102983cbf0188237e8c187123aa12',
    immutableTimestamp: '2026-09-21T11:20:00Z',
    lineItems: [
      {
        id: 'li-7492-1',
        category: 'MEALS',
        description: 'Advisory Board Working Dinner',
        amount: 280.0,
        currency: 'USD',
        date: '2026-09-19',
        receiptAttached: true,
        receiptType: 'SUMMARY_SLIP',
        vendor: 'Osteria Morini NYC',
        adjudication: {
          outcome: 'CLARIFY',
          approvedAmount: 0.0,
          disallowedAmount: 0.0,
          reason: 'Summary slip detected. Itemized invoice required to verify alcohol ratio and per-head ceiling under RUL-DOC-110 and RUL-ENT-103.',
          appliedRuleCode: 'RUL-DOC-110'
        }
      }
    ],
    evaluatedRules: [
      {
        ruleId: 'rul-doc-110',
        ruleCode: 'RUL-DOC-110',
        ruleTitle: 'Mandatory Itemized Tax Receipt > $25',
        policyTitle: 'Global Corporate Travel & Lodging Standard',
        policyVersion: 'v2.4',
        comparator: 'DOC_REQUIREMENT',
        result: 'FAILED',
        rationale: 'Transaction ($280.00) exceeds $25 threshold, but receipt is SUMMARY_SLIP rather than ITEMIZED_TAX_INVOICE. Outcome set to CLARIFY.',
        sourceCitation: 'POL-TRV-001 Section 8.1'
      }
    ],
    suppressedRules: []
  },
  {
    id: 'clm-2026-6130',
    claimNumber: 'CLM-2026-6130',
    claimantName: 'Victoria Sterling',
    claimantRole: 'Regional VP, Capital Markets',
    claimantEmail: 'victoria.sterling@acmepolicy.com',
    department: 'Institutional Banking',
    jurisdiction: 'US',
    submissionDate: '2026-09-22',
    incurredDate: '2026-09-15',
    totalClaimed: 890.0,
    approvedAmount: 0.0,
    disallowedAmount: 890.0,
    cappedAmount: 0.0,
    currency: 'USD',
    primaryCategory: 'AIRFARE',
    description: 'Short commuter shuttle flight from New York (JFK) to Washington DC (DCA). Duration: 1h 14m. First Class cabin booked.',
    outcome: 'AUTO_REJECT',
    outcomeReason: 'Direct breach of RUL-TRV-104: Domestic flight duration under 6 continuous hours booked in First Class. Negative constraint strictly violated.',
    decisionSignature: 'sha256:49c011aef83921bba80948cbb39182390ff01928038102380182371987ba42a1',
    immutableTimestamp: '2026-09-22T09:44:11Z',
    lineItems: [
      {
        id: 'li-6130-1',
        category: 'AIRFARE',
        description: 'Delta Air Lines Flight DL 5410 First Class Seat 2A (JFK -> DCA)',
        amount: 890.0,
        currency: 'USD',
        date: '2026-09-15',
        receiptAttached: true,
        receiptType: 'ITEMIZED_TAX_INVOICE',
        vendor: 'Delta Air Lines Inc.',
        adjudication: {
          outcome: 'DISALLOWED',
          approvedAmount: 0.0,
          disallowedAmount: 890.0,
          reason: 'Flight duration is 1.25h. Business/First cabin strictly disallowed for trips under 6 hours.',
          appliedRuleCode: 'RUL-TRV-104'
        }
      }
    ],
    evaluatedRules: [
      {
        ruleId: 'rul-trv-104',
        ruleCode: 'RUL-TRV-104',
        ruleTitle: 'Airfare Cabin Class Flight Duration Entitlement',
        policyTitle: 'Global Corporate Travel & Lodging Standard',
        policyVersion: 'v2.4',
        comparator: 'ORDINAL_ENTITLEMENT',
        result: 'FAILED',
        rationale: 'Flight duration 1.25 hours < 6 hours threshold; booked in FIRST class.',
        sourceCitation: 'POL-TRV-001 Section 4.1'
      }
    ],
    suppressedRules: []
  },
  {
    id: 'clm-2026-5520',
    claimNumber: 'CLM-2026-5520',
    claimantName: 'Aarav Patel',
    claimantRole: 'Lead Engineer, Platform Core',
    claimantEmail: 'aarav.patel@acmepolicy.com',
    department: 'Engineering',
    jurisdiction: 'IN',
    submissionDate: '2026-09-23',
    incurredDate: '2026-09-17',
    totalClaimed: 7200.0,
    approvedAmount: 7200.0,
    disallowedAmount: 0.0,
    cappedAmount: 0.0,
    currency: 'INR',
    primaryCategory: 'LODGING',
    description: '1-night technical onsite lodging at The Leela Palace Bengaluru.',
    outcome: 'PASS',
    outcomeReason: 'Evaluated under India Regional Annexure RUL-IND-102 (ceiling INR 7,500). Incurred rate INR 7,200 is fully compliant. Global USD cap was suppressed by local precedence.',
    decisionSignature: 'sha256:19b88937402ccba92374902198427abcdf82740219827361928374921980ab91',
    immutableTimestamp: '2026-09-23T15:02:18Z',
    lineItems: [
      {
        id: 'li-5520-1',
        category: 'LODGING',
        description: 'Deluxe Room (1 Night)',
        amount: 7200.0,
        currency: 'INR',
        date: '2026-09-17',
        receiptAttached: true,
        receiptType: 'ITEMIZED_TAX_INVOICE',
        vendor: 'The Leela Palace Bengaluru',
        adjudication: {
          outcome: 'APPROVED',
          approvedAmount: 7200.0,
          disallowedAmount: 0.0,
          reason: 'Incurred INR 7,200 <= INR 7,500 Tier A city ceiling.',
          appliedRuleCode: 'RUL-IND-102'
        }
      }
    ],
    evaluatedRules: [
      {
        ruleId: 'rul-ind-102',
        ruleCode: 'RUL-IND-102',
        ruleTitle: 'India Domestic Hotel Cap (Tier A Metro)',
        policyTitle: 'India Regional Domestic Expense Annexure',
        policyVersion: 'v1.2',
        comparator: 'MONETARY_CAP',
        result: 'PASSED',
        rationale: 'Incurred INR 7,200 <= INR 7,500 ceiling in Bengaluru.',
        sourceCitation: 'POL-IND-004 Section 2.1'
      }
    ],
    suppressedRules: [
      {
        ruleId: 'rul-trv-101',
        ruleCode: 'RUL-TRV-101',
        ruleTitle: 'Global Lodging Cap - Tier 1 Metro ($220 USD)',
        policyTitle: 'Global Corporate Travel & Lodging Standard',
        suppressedByRuleCode: 'RUL-IND-102',
        suppressedByPolicy: 'India Regional Domestic Expense Annexure',
        precedenceRationale: 'Specific national jurisdiction annexure takes priority over global default for INR-denominated travel within India.'
      }
    ]
  }
];

export const INITIAL_JOBS: AsyncJob[] = [
  {
    id: 'job-991',
    type: 'POLICY_MINING',
    title: 'Mining Candidate Rules: Remote Workplace Equipment Stipend',
    status: 'RUNNING',
    progress: 68,
    currentStage: 'Comparator Synthesis & Deterministic Formal Logic',
    totalStages: 4,
    stages: [
      'Document Ingestion & AST Tree Construction',
      'Clause Segmentation & NLP Tokenization',
      'Comparator Synthesis & Deterministic Formal Logic',
      'Precedence & Multi-Policy Conflict Analysis'
    ],
    estimatedRemainingSeconds: 14,
    policyId: 'pol-eqp-012',
    policyName: 'Remote Workplace Equipment & Hardware Stipend',
    startedAt: '2026-09-24T08:42:10Z'
  },
  {
    id: 'job-988',
    type: 'REPLAY_SIMULATION',
    title: 'Batch Replay: Tier 1 Metropolitan Hotel Cap Adjustment ($220 -> $190)',
    status: 'COMPLETED',
    progress: 100,
    currentStage: 'Completed',
    totalStages: 3,
    stages: [
      'Historical Claims Corpus Ingestion (N=420)',
      'Deterministic Adjudication Re-Run',
      'Outcome Delta & Variance Consolidation'
    ],
    estimatedRemainingSeconds: 0,
    startedAt: '2026-09-24T07:15:00Z',
    completedAt: '2026-09-24T07:16:12Z',
    resultSummary: '420 claims evaluated. 38 claims shifted to PART_APPROVE. Net projected financial reduction: -$24,650.'
  }
];

export const INITIAL_REPLAY_SIMULATION: ReplaySimulation = {
  id: 'rep-sim-2026',
  ruleId: 'rul-trv-101',
  ruleTitle: 'Global Lodging Cap - Tier 1 Metro',
  ruleCode: 'RUL-TRV-101',
  comparator: 'MONETARY_CAP',
  proposedChangeSummary: 'Proposed modification: Lower nightly cap from $220.00 USD to $190.00 USD across Tier 1 metropolitan markets.',
  sampleSize: 420,
  evaluatedAt: '2026-09-24T07:16:12Z',
  beforeStats: {
    pass: 340,
    partApprove: 52,
    clarify: 18,
    autoReject: 10,
    totalPayout: 91400.0
  },
  afterStats: {
    pass: 302,
    partApprove: 90,
    clarify: 18,
    autoReject: 10,
    totalPayout: 66750.0
  },
  netFinancialDelta: -24650.0,
  outcomeShifts: 38,
  sampleDiffs: [
    {
      claimNumber: 'CLM-2026-9041',
      claimant: 'Samantha Wu',
      category: 'LODGING',
      beforeOutcome: 'PART_APPROVE',
      afterOutcome: 'PART_APPROVE',
      beforePayout: 420.0,
      afterPayout: 410.0,
      delta: -10.0,
      rationale: 'Grand Hyatt Seattle room rate $195.00 now exceeds new $190.00 cap. $5/night ($10 total) capped.'
    },
    {
      claimNumber: 'CLM-2026-4401',
      claimant: 'Marcus Vance',
      category: 'LODGING',
      beforeOutcome: 'PASS',
      afterOutcome: 'PART_APPROVE',
      beforePayout: 215.0,
      afterPayout: 190.0,
      delta: -25.0,
      rationale: 'Boston Marriott rate $215.00 shifted from PASS to PART_APPROVE with $25 disallowed above cap.'
    },
    {
      claimNumber: 'CLM-2026-3199',
      claimant: 'David Kross',
      category: 'LODGING',
      beforeOutcome: 'PASS',
      afterOutcome: 'PART_APPROVE',
      beforePayout: 210.0,
      afterPayout: 190.0,
      delta: -20.0,
      rationale: 'San Francisco Marquis hotel rate $210.00 capped at $190.00.'
    },
    {
      claimNumber: 'CLM-2026-2184',
      claimant: 'Elena Rostova',
      category: 'LODGING',
      beforeOutcome: 'PASS',
      afterOutcome: 'PASS',
      beforePayout: 175.0,
      afterPayout: 175.0,
      delta: 0.0,
      rationale: 'Chicago hotel rate $175.00 remains strictly below both old ($220) and new ($190) caps.'
    }
  ]
};

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud-001',
    timestamp: '2026-09-24T08:15:22Z',
    actorName: 'Sarah Jenkins',
    actorEmail: 'sarah.jenkins@acmepolicy.com',
    actorRole: 'FC',
    action: 'USER_LOGIN',
    entityType: 'USER',
    entityId: 'usr-fc-1',
    description: 'Authenticated via SAML SSO enterprise session.',
  },
  {
    id: 'aud-002',
    timestamp: '2026-09-23T15:02:18Z',
    actorName: 'System Engine',
    actorEmail: 'engine@policyos.internal',
    actorRole: 'FC',
    action: 'CLAIM_EVALUATION',
    entityType: 'CLAIM',
    entityId: 'clm-2026-5520',
    description: 'Evaluated claim CLM-2026-5520 with outcome PASS. Applied precedence rule RUL-IND-102, suppressing RUL-TRV-101.',
    newValue: 'PASS (Approved INR 7,200.00)'
  },
  {
    id: 'aud-003',
    timestamp: '2026-09-22T09:44:11Z',
    actorName: 'System Engine',
    actorEmail: 'engine@policyos.internal',
    actorRole: 'FC',
    action: 'CLAIM_EVALUATION',
    entityType: 'CLAIM',
    entityId: 'clm-2026-6130',
    description: 'Evaluated claim CLM-2026-6130 with outcome AUTO_REJECT. Hard constraint violation of RUL-TRV-104 (First Class flight under 6h).',
    newValue: 'AUTO_REJECT (Disallowed $890.00 USD)'
  },
  {
    id: 'aud-004',
    timestamp: '2026-09-20T17:10:45Z',
    actorName: 'System Engine',
    actorEmail: 'engine@policyos.internal',
    actorRole: 'FC',
    action: 'CLAIM_EVALUATION',
    entityType: 'CLAIM',
    entityId: 'clm-2026-9041',
    description: 'Line-level adjudication of mixed lodging bill CLM-2026-9041: Approved $420.00, Disallowed $72.00 minibar/entertainment.',
    newValue: 'PART_APPROVE'
  },
  {
    id: 'aud-005',
    timestamp: '2026-01-25T16:00:00Z',
    actorName: 'Sarah Jenkins',
    actorEmail: 'sarah.jenkins@acmepolicy.com',
    actorRole: 'FC',
    action: 'RULE_APPROVE',
    entityType: 'RULE',
    entityId: 'rul-ent-103',
    description: 'Approved candidate rule RUL-ENT-103 (Client Business Dinner Per-Head Ceiling $120) with effective date 2026-02-01.',
    previousValue: 'CANDIDATE',
    newValue: 'APPROVED'
  },
  {
    id: 'aud-006',
    timestamp: '2026-01-14T09:15:00Z',
    actorName: 'Sarah Jenkins',
    actorEmail: 'sarah.jenkins@acmepolicy.com',
    actorRole: 'FC',
    action: 'RULE_APPROVE',
    entityType: 'RULE',
    entityId: 'rul-ind-102',
    description: 'Approved candidate rule RUL-IND-102 (India Domestic Hotel Cap INR 7,500) with precedence override.',
    previousValue: 'CANDIDATE',
    newValue: 'APPROVED'
  },
  {
    id: 'aud-007',
    timestamp: '2026-01-05T09:20:00Z',
    actorName: 'Alex Chen',
    actorEmail: 'alex.chen@acmepolicy.com',
    actorRole: 'PO',
    action: 'POLICY_UPLOAD',
    entityType: 'POLICY',
    entityId: 'pol-ind-004',
    description: 'Uploaded source document India_Domestic_Travel_Annexure_2026.pdf and initiated rule extraction.',
    newValue: 'India Regional Domestic Expense Annexure v1.2'
  }
];

export const INITIAL_SYSTEM_LIMITS: SystemLimits = {
  maxPdfSizeMb: 25,
  miningConcurrency: 4,
  autoExtractConfidenceThreshold: 0.85,
  replaySampleSize: 500,
  claimFilingWindowDays: 30,
  precedenceHierarchy: [
    'LOCAL_MANDATE',
    'REGIONAL_ANNEXURE',
    'DEPARTMENT_SPECIFIC',
    'GLOBAL_ENTERPRISE_STANDARD'
  ]
};
