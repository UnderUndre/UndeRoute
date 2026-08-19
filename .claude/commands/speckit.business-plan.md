---
description: Create or update the practical Lean/CustDev product business plan before or alongside SpecKit features. Banned corporate 50-page fluff & 5-year Excel fantasies. Focus on single-page Lean Canvas, Mom Test CustDev, napkin unit economics, smoke tests/MVP, prepayment gates, pre-mortem failure modes, and kill criteria.
handoffs:
  - label: Start Feature Worktree
    agent: speckit.start
    prompt: Start isolated worktree for the feature described in the business plan
  - label: Write First Spec
    agent: speckit.specify
    prompt: Write the first feature spec aligned to the business plan
    send: true
  - label: Full Spec Combo
    agent: speckit.full-spec
    prompt: Specify + clarify the next feature under the current business plan
---

## User Input

```text
$ARGUMENTS
```

Optional args (any order, free text):

- Feature / product description (what is being built or changed)
- `--create` — force create mode even if a plan file exists (new brand/product plan)
- `--update` — force update mode (requires existing plan)
- `--path <file>` — explicit plan path (default: auto-detect under `docs/`)
- `--skip-stress` — do **not** use (debug only); stress tables and pre-mortem pass are mandatory in normal mode
- `--request-external-review` — after write, print explicit prompt to run `/speckit.business-plan-review` (or manual Gemini/Grok pass); **auto-on** for CREATE and **major** bumps

ultrathink

> "Писать 50 страниц талмуда на старте — это слив времени в унитаз. Пока первых денег из чужого кармана не капнуло в твой — это не бизнес, а проверка гипотезы. Сначала Lean Canvas, кастдев и предоплата на коленке, и только потом — большая гидравлика." — Valera

## Goal

Make the **business plan a lean, hypothesis-driven SpecKit stage**, not a corporate side PDF:

| Situation                                                | Mode                                                  | Output                                                                                     |
| :------------------------------------------------------- | :---------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| **No** `docs/**/*business-plan*.md` (or user `--create`) | **CREATE**                                            | Lean 1-page business canvas + CustDev validation plan + napkin unit econ + pre-mortem pass |
| Plan exists and this is **2nd+** feature (or `--update`) | **UPDATE**                                            | Same file(s), bump version, changelog row, patch sections touched by new spec/scope        |
| Plan exists, first feature still in flight               | **CREATE if empty stub / UPDATE if substantive plan** | Prefer update; never fork silent duplicates                                                |

**When it runs in the pipeline**

1. **Before or at first `/speckit.specify`** (greenfield): practical validation plan MUST exist or be created in this command / specify gate.
2. **On every later `/speckit.specify`** that changes ICP, pricing, packaging, focus gates, legal rails, or monetization: **UPDATE** after `spec.md` is stable (post-clarify preferred; minimum post-specify).
3. Standalone: user runs `/speckit.business-plan <context>` anytime.

Does **not** replace `spec.md`. Plan = hypothesis validation / unit econ / GTM / prepay gate / pre-mortem; spec = product behavior.

## Core Mindset & Execution Pipeline (The Plumber's 6-Step Lean Rule)

Classic 50-page business plans with 5-year financial projections are **strictly prohibited** at early stages (unless explicitly required for institutional bank loans or government grants). Any early-stage plan MUST follow this lean engineering pipeline:

```text
[1. Lean Canvas] ──> [2. CustDev (Mom Test)] ──> [3. Napkin Unit Econ]
                                                         │
[6. Legal & Infra] <── [5. Prepayment Gate] <── [4. Smoke Test & MVP]
```

1. **Lean Canvas (Single Page):** Capture the business model on 1 page: Problem, Target Segment, Solution, Unique Value Proposition (UVP), GTM Channels, Revenue & Cost Structure. No corporate filler.
2. **CustDev Validation (The Mom Test):** Validate real pain before writing code. Interview target users about _past behavior_ ("How did you solve this last week? What did it cost?"). Never ask hypothetical purchase questions ("Would you buy?").
3. **Napkin Unit Economics:** Verify CAC, LTV / Avg Order Value, and Gross Margin per unit. Golden Rule: If margin is negative on 1 unit, scaling only builds a bigger money leak.
4. **Smoke Test & Off-The-Shelf MVP:** Minimum viable product built with off-the-shelf components or "Wizard of Oz" manual backend. Zero custom engineering until demand is proven.
5. **Prepayment Validation Gate (Moment of Truth):** True validation is cash/prepayments collected. Pre-revenue status triggers an immediate lockdown on unnecessary engineering.
6. **Infrastructure & Legal Formalization:** Legal entity setup, automated billing, and formal infrastructure are deferred until regular paid orders arrive.

## Operating Constraints

**Writes (allowed paths only):**

- `docs/<product>-business-plan.md` and/or `docs/business-plan.md`
- Multi-brand: `docs/<brand>-business-plan.md` (e.g. `undreseller-business-plan.md`, `undrlla-business-plan.md`) when brands are publicly isolated
- Optional: `docs/business-plans/README.md` index if ≥2 brand plans
- Snapshot tag stage: `bizplan` via `snapshot-stage` when inside a feature git flow **or** tag on main docs commit when plan is repo-level

**Does NOT:**

- Implement product code
- Bypass focus gates invented in the plan
- Invent fake traction, 5-year fantasy forecasts, or “Production Ready” at 0 revenue
- Hardcode specific third-party vendor or SaaS brand names (keep as abstract operational patterns: off-the-shelf landing engine, payment gateway/MoR, messaging channel, CRM)
- Mix crypto/polity narrative into sterile B2B agency plans (brand isolation)

## Detection Logic

```text
PLAN_GLOBS = docs/**/*business-plan*.md , docs/business-plan.md
FEATURE_SPECS = specs/**/spec.md  EXCEPT specs/main/**

EXISTING_PLANS = files matching PLAN_GLOBS
FEATURE_COUNT = count(FEATURE_SPECS)

If user --path → PLAN_PATH = that file
Else if single EXISTING_PLAN → PLAN_PATH = it
Else if multiple → ask user which brand/path OR update all that the feature touches
Else → PLAN_PATH = docs/business-plan.md  (or docs/<slug-product>-business-plan.md from args)

If user --create OR (not EXISTING_PLANS):
  MODE = create
Else if user --update OR FEATURE_COUNT >= 1 OR EXISTING_PLANS:
  MODE = update
```

**First-spec rule:** If `FEATURE_COUNT == 0` and `MODE` would be update without files → force **create**.

**Second+-spec rule:** If `FEATURE_COUNT >= 1` and plan exists → default **update** (even if user is about to write another spec).

## Execution Steps

### 0. Load inputs

1. Read `$ARGUMENTS` and repo context: `README*`, `AGENTS.md`, `.specify/memory/constitution.md`, existing `docs/*business-plan*`, latest `specs/**/spec.md` (if any).
2. Load template: `.specify/templates/business-plan-template.md`.
3. If feature slug known (cwd worktree or args), read `specs/<slug>/spec.md` when present.

### 1. Mode branch

#### A) CREATE (first plan)

1. Interview gaps **only** if blocking (max 5 questions). Prefer informed defaults + Assumptions section over endless Q&A. Blocking examples: who pays, price floor, Phase A sole SKU, legal entity path.
2. Fill template completely using the **6-Step Lean Pipeline**:
   - **Lean Canvas (1-page matrix):** Problem, Segment, Solution, UVP, Channels, Revenue/Cost structure.
   - **CustDev Plan:** 5–10 past-behavior questions based on The Mom Test.
   - **Napkin Unit Economics:** CAC, LTV/Avg Ticket, Margin per unit.
   - **Smoke Test & Off-the-Shelf MVP Scope:** Wizard-of-Oz / manual backend, zero custom code over-engineering.
   - **Prepayment Gate & Traction Status:** Honest state (`Pre-revenue` / `Phase A` / `N paid prepays`).
   - **Pre-Mortem Failure Modes & Kill Criteria:** Hard quantitative metrics to stop or pivot.
3. Run **Stress Pass** (section below) — mandatory.
4. Set version **1.0** or **10.0** if continuing an external series.
5. Write `PLAN_PATH`.
6. Changelog section: `vX ← ∅` initial.
7. Report path + “next: `/speckit.start` + `/speckit.specify`” (or continue specify if already in flight).

#### B) UPDATE (second+ feature or explicit)

1. Read existing plan end-to-end.
2. Diff against new/changed `spec.md` + user args: ICP, SKUs, pricing, gates, legal, risks, pre-mortem, cashflow, kill criteria, roadmap, unit econ.
3. **Do not** full-rewrite unless user asked. Patch minimal sections.
4. Bump version **patch** (copy/ops) or **minor** (new SKU/gate) or **major** (positioning/focus law break). Default: minor if new feature monetization; patch if wording only.
5. Prepend/append **Changelog** row: `vNEW ← vOLD` with table of deltas + why (spec slug link).
6. Re-run **Stress Pass** on any changed price/CAC/focus claim.
7. Write file. Snapshot if applicable.

### 2. Stress & Pre-Mortem Pass (mandatory — “Valera/Forensic Valves”)

Before marking done, verify and encode:

| Valve                                 | Rule / Requirement                                                                                                                                                          |
| :------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Traction Honesty**                  | Never “Production Ready” at 0 closed deals. Phase A counts strictly paid deposits or non-refundable LOIs.                                                                   |
| **Working Capital & Cash Drag**       | Net-30/60 terms must model 45-day cash gap and require 2–3 months OPEX liquidity buffer.                                                                                    |
| **Cross-Border Tax & Substance**      | Banned using low-tax preferential regimes without proven Economic Substance. Merchant of Record (MoR) / compliant gateway required until scale threshold for VAT/Sales tax. |
| **Pass-Through SLA & Outage Cap**     | Client SLA cannot exceed upstream providers. Cap on Liability MUST be <= 1 month fees; Force Majeure clause mandatory.                                                      |
| **Compute Floor & Circuit Breaker**   | Inference cost ceiling <= 10–15% gross subscription. Hardware circuit breaker ($X/session limit) with fallback to lightweight SLM mandatory.                                |
| **Vector DB & Data Privacy**          | RAG architecture must enforce Namespace Isolation per tenant and cascading deletion of embeddings (GDPR Art. 17 / CCPA / data regulations).                                 |
| **Burnout Shield & Capacity Ceiling** | Solo founder capped at max 2 concurrent Custom Build projects. Excess leads forced to Waitlist or async audits.                                                             |
| **Helmer Moat Verification**          | Must prove at least 1 durable moat (7 Powers: Switching Costs, Network Effects, Counter-Positioning, Scale Economies, etc.) over 12mo.                                      |
| **Grand Slam Offer Integrity**        | Offers must decompose via Hormozi Value Equation (Time-to-Value <= 72h, Done-For-You packaging, risk reversal guarantee).                                                   |
| **Beachhead Whole Product Gate**      | Banned expanding to new niches until >= 3 paid contracts closed in a single narrow beachhead market with a complete Whole Product.                                          |
| **Prepayment Validation Gate**        | Banned building custom infrastructure before proving willingness-to-pay via paid deposit or prepay smoke test.                                                              |

If a claim fails stress → fix plan text, don’t ship vibes.

### 2a. Canonical Business Mental Models & Strategic Frameworks

Every generated or updated business plan MUST pass through these 9 core mental models:

1. **Lean Canvas & One-Page Business Model:**
   - Eliminate 50-page corporate fluff. Map Problem, Segment, Solution, UVP, Channels, Revenue, Costs onto a single 1-page framework.

2. **The Mom Test Validation Gate (Rob Fitzpatrick — _The Mom Test_):**
   - **Behavioral Evidence Only:** Verbal compliments or "would you buy?" count as ZERO validation. Validation requires historical proof of client spending real money/time on clumsy workarounds right now, or paid deposits.

3. **Napkin Unit Economics & Smoke Testing:**
   - **Micro-Econ Check:** CAC, LTV / Avg Order Value, Gross Margin per unit must be positive before writing custom code.
   - **Off-the-Shelf MVP (Wizard of Oz):** Test demand with off-the-shelf tools and manual backends before building custom engines.

4. **Antifragility & Barbell Strategy (Nassim Taleb — _Antifragile_ & _The Black Swan_):**
   - **Barbell Allocation:** 80% effort on low-risk, predictable cashflow (Phase A Hero SKU / Prepay / T&M), 20% on asymmetric bets with massive upside (IP / Platform extensions). Banned: middle-tier high-fragility bets.
   - **Black Swan Preparedness:** Identify single-point-of-failure vulnerabilities (payment freezes, platform bans, API pricing spikes) and enforce payment redundancy.

5. **The 7 Powers Moat Framework (Hamilton Helmer — _7 Powers_):**
   - **Durability Audit:** Verify economic rent sources (_Scale Economies, Network Economies, Switching Costs, Counter-Positioning, Cornered Resources, Branding, Process Power_). Banned: commoditized wrappers over raw APIs without proprietary moats.

6. **Value Equation & Risk Reversal (Alex Hormozi — _$100M Offers_):**
   - **Value Equation Optimization:** Maximize Dream Outcome & Perceived Likelihood while minimizing Time Delay (Time-to-Value <= 72h) and Effort & Sacrifice.
   - **Grand Slam Offer:** Package as Done-For-You with conditional performance guarantees and financial risk reversal.

7. **Crossing the Chasm & Beachhead Strategy (Geoffrey Moore — _Crossing the Chasm_):**
   - **Beachhead Market First:** Dominant market share in a single, narrow niche before horizontal expansion.
   - **Whole Product Delivery:** Scope must include training, integration connectors, SLA, and compliance required by pragmatic buyers.

8. **10x Monopoly Niche Rule (Peter Thiel — _Zero to One_):**
   - **Dominant Micro-Niche:** Target a micro-niche where the solution is **10x better or 10x faster** than existing alternatives. Avoid "1% of a red ocean" fantasies.

9. **Wartime Execution & Hard Kill Criteria (Ben Horowitz & Eric Ries):**
   - **Wartime Execution Mode:** Pre-revenue status triggers an immediate lockdown on non-revenue engineering.
   - **Hard Kill Criteria:** Numeric metrics (spend limit, contact capacity, calendar timeframe, min closed deals) that automatically trigger a freeze, pivot, or shutdown ("Red Button").

### 2b. Forensic Architecture & Legal Guardrails

| Control Area                        | Forensic Requirement                                                  | Enforcement Mechanism                                                                                                                                |
| :---------------------------------- | :-------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| **IP Chain-of-Title**               | Absolute purity of IP rights for codebase, prompts, and architecture. | Subcontractor agreements require explicit Work-for-Hire / Assignment clauses. AI-generated code requires human curation for copyright validity.      |
| **Data Privacy & AI RAG Isolation** | Tenant isolation and GDPR / CCPA / regulatory compliance.             | Multi-tenant vector DBs must use Namespace per Tenant and cascading deletion of embeddings. LLM providers must feature Zero Data Retention policies. |
| **Currency & FX Risk**              | Buffer against FX fluctuations and banking compliance.                | Include 4.5–6% FX currency spread buffer; maintain at least two backup bank accounts in independent jurisdictions.                                   |
| **Compute Floor & Session Cap**     | Gross margin protection from token loops or prompt injection attacks. | Hardware circuit breaker (max $X/session cap) with automatic fallback to lightweight SLM when session limits are exceeded.                           |

### 2c. Review Policy (Hybrid)

Business-plan quality uses **three layers**:

| Layer                           | Who                                                                            | When                                                                       | Output                                                                          |
| :------------------------------ | :----------------------------------------------------------------------------- | :------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| **A. Stress & Pre-Mortem Pass** | This command (authoring model)                                                 | Every CREATE/UPDATE                                                        | In-plan stress and pre-mortem tables; fail → fix before done                    |
| **B. Commercial Drift Lens**    | `/speckit.analyze` + `/speckit.review`                                         | Every feature gate before implement                                        | Findings in `specs/<slug>/reviews/*` — plan vs spec/plan/tasks consistency only |
| **C. External Biz Audit**       | Independent provider (Gemini/Grok/Codex/…) via `/speckit.business-plan-review` | **CREATE** always recommended; **major** bump MUST request; minor optional | `docs/reviews/business-plan-<provider>.md` (or `docs/business-plans/reviews/`)  |

After CREATE or major UPDATE completion report, always include:

```text
External biz review: RECOMMENDED | REQUIRED (major)
  Run: /speckit.business-plan-review
  Or paste plan into independent model; save docs/reviews/business-plan-<provider>.md
```

### 3. Multi-brand

If repo has **publicly isolated** brands (agency vs polity):

- One file per brand under `docs/`.
- UPDATE only brands touched by the feature.
- Cross-link focus law (e.g. polity frozen until agency cash) explicitly in both.

### 4. Snapshot (Principle VII)

When the plan change is committed with a feature slug:

```powershell
.specify\scripts\powershell\snapshot-stage.ps1 -Stage bizplan -Slug <slug-or-main>
```

```bash
.specify/scripts/bash/snapshot-stage.sh bizplan <slug-or-main>
```

Use slug `main` or product id if plan is repo-global and not feature-scoped.

### 5. Completion report

```text
✓ Business plan [CREATE|UPDATE] vX.Y
  Path:         docs/...
  Mode:         first-spec | feature-N update
  Stress Pass:  PASS | PASS-with-assumptions
  Pre-Mortem:   PASS (Failure Modes & Kill Criteria defined)
  GTM spine:    present | missing-sections
  External biz review: skip | RECOMMENDED | REQUIRED (major)
  Next:         /speckit.specify ...  OR  /speckit.business-plan-review  OR  continue pipeline
```

List open assumptions (max 5). Do not dump entire plan into chat — path + delta summary only.

## Quality bar (reject own draft if)

- Draft contains multi-page corporate fluff or 5-year Excel fantasy forecasts instead of Lean Canvas + CustDev validation
- Status lies about traction
- CustDev relies on hypothetical questions ("would you buy?") instead of past behavior evidence (Mom Test)
- Custom software development planned before smoke test / prepayment validation gate
- Includes specific vendor/service hardcodes instead of vendor-neutral architecture patterns
- No changelog on update
- No stress unit econ table
- Missing Pre-Mortem failure modes table or explicit Kill Criteria
- Phase A sells three heroes at once with no gate
- Custom/integration scope unlimited inside fixed price
- Uncalculated cash drag (Working Capital Drag) for Net-30/60 enterprise contracts
- Unlimited liability for third-party upstream provider outages (missing Pass-Through SLA or Liability Cap)
- Missing proof of at least 1 durable moat from Helmer's 7 Powers
- Offer framed as hourly body-leasing without Hormozi Value Equation decomposition & risk-reversal
- Missing compute floor / token session circuit breakers to protect margins
- Vector DB architecture lacks cascading erasure mechanisms (GDPR / privacy compliance)
- Solo founder capacity ceiling exceeded without Waitlist routing
- Plan contradicts constitution red lines without explicit override note

## Coordination

| Command              | Duty                                                                                                                                          |
| :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `/speckit.start`     | Remind: if no plan file, run `/speckit.business-plan` before specify                                                                          |
| `/speckit.specify`   | **Gate:** create plan if missing on first feature; **hook:** queue update after spec if plan exists and feature is commercial/scope-expanding |
| `/speckit.full-spec` | Same gates as specify (inherits)                                                                                                              |
| `/speckit.clarify`   | If answers change pricing/ICP/gates → run update business-plan before plan stage                                                              |
| `/speckit.plan`      | Read current business plan as commercial constraint input                                                                                     |
| `/speckit.implement` | Does not edit plan; may flag drift in completion notes                                                                                        |

## Context

$ARGUMENTS
