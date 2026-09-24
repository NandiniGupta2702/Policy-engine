# PolicyOS — Deterministic Expense Policy Engine

Enterprise UI and evaluation orchestrator for deterministic corporate expense policies.

## Core Architecture Principles
1. **Maker-Checker Governance Separation**:
   - **Policy Owners (POs)** upload source documents (PDFs, text) and initiate AI extraction.
   - **AI Rule Extractor** mines candidate rules into typed comparators with confidence scores and source citations. AI explains rules and suggests parameters, but **NEVER approves or decides**.
   - **Finance Controllers (FCs)** perform strict Maker-Checker review: candidate rules require explicit controller approval with effective dates, conflict analysis, and impact assessment before becoming active.
2. **Deterministic Adjudication**:
   - Approved rules are immutable and versioned.
   - Expense claims are evaluated strictly against rules active on the **claim incurred date** (not today's date).
   - Decisions output exactly one of 4 deterministic outcomes:
     - `PASS`: 100% compliant.
     - `PART_APPROVE`: Mixed bill (e.g. approved room rate, disallowed minibar / excessive wifi).
     - `CLARIFY`: Missing required documentation or prior authorization (never prematurely rejected).
     - `AUTO_REJECT`: Direct breach of immutable negative constraints or non-compliant class of service.
   - **Compliant Downgrades**: Downgrades (e.g. employee booked Economy instead of allowed Business, or lower tier vehicle) pass automatically while strictly observing monetary caps.
   - **Precedence & Rule Suppression**: Local/jurisdiction-specific policies automatically suppress wider global generalities with documented audit trails.

## User Roles
- **Policy Owner (PO)**: Uploads policies, views own policies & mined candidate rules, monitors mining jobs.
- **Finance Controller (FC)**: Cross-organization visibility, single/bulk approval/rejection of candidate rules, Replay Lab simulation, immutable decision records, impact audits.
- **Admin**: User lifecycle & revocations (revoked users bounced to login), system limits configuration, health telemetry.

## Tech Stack
- React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, TanStack React Query, React Hook Form, Zod, Recharts, Framer Motion.
- Isolated Mock Data Adapter simulating an async FastAPI backend with live SSE/polling progress tracking.
