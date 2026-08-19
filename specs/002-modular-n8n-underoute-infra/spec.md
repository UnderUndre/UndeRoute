# Feature Specification: Modular Docker Deployment Architecture, n8n TG Bot Pipeline & Multi-Project Landing Engine

**Feature Directory**: `specs/002-modular-n8n-underoute-infra`  
**Created**: 2026-08-16  
**Status**: Draft (Clarified)  
**Input**: Integrated specification for undreseller business plan, TG bot n8n integration, local-ai-packaged modularization, UndeRoute compose linkage, and multi-project landing engine in undrllanding.

---

## 1. Context & Architectural Overview

This feature unifies four major operational components of the **Undreseller Productized Engineering Conveyor**:

1. **Primary Router Core (`UndeRoute`)**:
   - `UndeRoute` serves as the primary Docker Compose root, building directly from local source (`build: context: .`).
   - Integrates `local-ai-packaged` services via native Docker Compose `include: - ../local-ai-packaged/docker-compose.yml` and profile flags (`profiles: [n8n]`, `profiles: [supabase]`, `profiles: [ai]`).
   - Eliminates dependence on external pre-published Docker images during local development and custom fork iterations.

2. **Modular Sidecar Infrastructure (`local-ai-packaged`)**:
   - Provides optional sidecar stacks (Supabase DB/Auth, n8n Automation Engine, Ollama, Qdrant, Caddy).
   - Enables lightweight client deployments (e.g. running ONLY UndeRoute + n8n + PostgreSQL/Supabase) without forcing 15GB Ollama LLM / Vector DB footprints on smaller client VPSs.

3. **Enterprise Inbound & TG Bot Integration via n8n**:
   - Deployment of Telegram Bot handlers via n8n workflows utilizing `@telegram-auth/server` / webhook ingest, Zod TypeScript code nodes (`NODE_FUNCTION_ALLOW_EXTERNAL=zod`), Claude 3.7 triage, and Dead-Letter Queue error routing.

4. **Multi-Project Landing Engine (`undrllanding`)**:
   - Restructuring `undrllanding` to support isolated multi-project landing pages under `projects/[project-name]` (e.g. `projects/undrlla`, `projects/undreseller`).
   - Configuration via `NEXT_PUBLIC_PROJECT_NAME` env variable or domain host headers to switch active landers instantly.

---

## 2. User Scenarios & Testing

### User Story 1 - Selective Lightweight Docker Deployment for Clients (Priority: P1)

As a DevOps Engineer / Agency Founder delivering Sprint A ($3.5k) or Sprint B ($4.9k),  
I want to execute a single Docker Compose command with profiles,  
So that I can spin up ONLY the containers needed by the client (n8n + Supabase + UndeRoute) without starting unnecessary heavy AI containers.

**Why this priority**: Directly impacts client onboarding speed, VPS RAM costs ($10/mo Hetzner vs $80/mo monster VPS), and reliability of 14-day deliveries.

**Independent Test**:  
Run `docker compose --profile n8n --profile supabase up -d` in `UndeRoute`. Verify that `omniroute` (built locally from `Dockerfile`), `n8n`, and `supabase-db` containers start successfully, while `ollama`, `flowise`, and `qdrant` remain down.

**Acceptance Scenarios**:

1. **Given** a local clone of `UndeRoute` with code modifications,  
   **When** executing `docker compose --profile client-lite up -d` (or `--profile n8n --profile supabase`),  
   **Then** `UndeRoute` builds locally from source, while `n8n` (5678) and `supabase` (5432/8000) boot as sidecars in < 60 seconds with total RAM consumption under 1.5 GB.

2. **Given** a client requiring full local LLM offline capabilities,  
   **When** executing `docker compose --profile all up -d` (or `--profile ai`),  
   **Then** `ollama`, `qdrant`, and `open-webui` start alongside the core pipeline.

---

### User Story 2 - Telegram Bot Operational Pipeline via n8n & Claude 3.7 (Priority: P2)

As a Client or Agency Lead,  
I want inbound Telegram messages and webhooks processed by an n8n workflow with Zod schema validation and Claude 3.7 scoring,  
So that invalid payloads are routed to a Dead-Letter Queue while valid leads sync to Supabase and send alerts to Telegram/Slack.

**Why this priority**: Essential for Sprint A ($3,500 B2B Automation) and Dogfooding demo (`demo.undreseller.com`) shown in client Loom videos.

**Independent Test**:  
Send a test webhook payload with invalid JSON to n8n webhook endpoint. Verify that the TypeScript Zod node catches the validation error, routes it to the Dead-Letter Queue branch, and sends an alert to Telegram without crashing the n8n execution context.

**Acceptance Scenarios**:

1. **Given** a valid B2B lead payload sent to n8n Webhook,  
   **When** the Zod Code Node executes,  
   **Then** the payload is validated, prioritized (`TIER_1_HIGH` vs `TIER_2_STANDARD`), passed to Claude 3.7 for AI analysis, upserted into Supabase PostgreSQL, and notified in Telegram with interactive buttons.

2. **Given** a malformed payload (missing required email or company name),  
   **When** processed by the Zod Code Node,  
   **Then** `deadLetterItems` receives the structured error log with `pairedItem` metadata preserved, triggering a Dead-Letter alert.

---

### User Story 3 - Multi-Project Landing Engine in `undrllanding` (Priority: P3)

As a Marketer / Product Owner,  
I want `undrllanding` to support multiple project landing pages (`undrlla`, `undreseller`) configured via an environment variable,  
So that a single Next.js codebase can serve distinct project landers (`undreseller.com` vs `undrlla.com`) cleanly.

**Why this priority**: Enables rapid deployment of `undreseller.com` landing page without duplicating Next.js infrastructure or breaking existing `undrlla` lander.

**Independent Test**:  
Set `NEXT_PUBLIC_PROJECT_NAME=undreseller` and run `npm run dev` in `undrllanding`. Verify that the home route `/` displays the `undreseller` hero, 2-SKU pricing table ($3.5k / $4.9k), and Loom demo showcase.

**Acceptance Scenarios**:

1. **Given** `NEXT_PUBLIC_PROJECT_NAME=undreseller`,  
   **When** accessing root route `/`,  
   **Then** `undreseller` metadata, Hero, 14-Day Sprint features, and pricing sections are rendered.

2. **Given** `NEXT_PUBLIC_PROJECT_NAME=undrlla` (or unset fallback),  
   **When** accessing root route `/`,  
   **Then** the legacy `undrlla` Medusa storefront lander is rendered.

---

## 3. Technical Requirements

### Functional Requirements

- **FR-001**: `UndeRoute/docker-compose.yml` MUST serve as the primary compose entry point, building the local router container directly (`build: context: .`) and linking sidecars via Docker Compose `include: - ./local-ai-packaged/docker-compose.yml` (or path override).
- **FR-002**: Sidecar services in `local-ai-packaged` MUST be categorized into explicit Docker Compose profiles:
  - `n8n`: `n8n` service container
  - `supabase`: Supabase stack (`db`, `auth`, `rest`, `storage`, `kong`)
  - `ai`: `ollama`, `qdrant`, `open-webui`, `flowise`, `searxng`
  - `client-lite`: Composite profile executing `omniroute` + `n8n` + `supabase`
- **FR-003**: `UndeRoute/docker-compose.yml` MUST support execution without published Docker Registry images by using local build context (`Dockerfile`).
- **FR-004**: `n8n` container configuration MUST set `NODE_FUNCTION_ALLOW_EXTERNAL=zod` to allow Zod schema validation inside TypeScript Code Nodes.
- **FR-005**: n8n Telegram integration MUST support Webhook ingestion from Telegram Bot API with HMAC / token verification.
- **FR-006**: n8n workflows MUST implement a two-output Zod Code Node pattern returning `[validItems, deadLetterItems]` to prevent runtime workflow crashes on malformed input.
- **FR-007**: `undrllanding` MUST organize project-specific components under `projects/[project-name]/` (e.g. `projects/undreseller/`, `projects/undrlla/`).
- **FR-008**: `undrllanding` MUST export a central project resolver module `lib/project-config.ts` that inspects `process.env.NEXT_PUBLIC_PROJECT_NAME`.
- **FR-009**: `undrllanding` project configuration MUST specify metadata, theme primary colors, hero section, features list, pricing tiers, and CTA targets for `undreseller`.
- **FR-010**: All Docker and Next.js environment configuration templates (`.env.example`) MUST be documented and kept in sync across repos via `npx clai-helpers sync`.
- **FR-011**: Inbound requests to `UndeRoute` API endpoints MUST validate bearer **RS256 JWT** session tokens issued by **Undrlla IdP (`id.undrlla.network`)** via JWKS endpoint (`/.well-known/jwks.json`) per `undrlla/specs/005-sso-jwt-contract.md`.

---

## 4. Key Entities & System Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
## DOCKER INFRASTRUCTURE TOPOLOGY (local-ai-packaged + UndeRoute)
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [ Client Inbound Request / TG Webhook ]                                   │
│                     │                                                       │
│                     ▼                                                       │
│        [ Caddy / Nginx Reverse Proxy ]                                      │
│                     │                                                       │
│         ┌───────────┴─────────────────────────────┐                         │
│         ▼                                         ▼                         │
│   [ UndeRoute Router ] (Port 20129)        [ n8n Automation ] (Port 5678)   │
│   • Profile: underoute                     • Profile: n8n                   │
│   • LLM Proxy & Fallbacks                  • TS + Zod Code Nodes            │
│                     │                             │                         │
│                     ▼                             ▼                         │
│        ┌──────────────────────────────────────────────┐                     │
│        │ Supabase PostgreSQL DB (Port 5432)           │                     │
│        │ • Profile: supabase                          │                     │
│        │ • Row Level Security (RLS) & Auth            │                     │
│        └──────────────────────────────────────────────┘                     │
│                                                                             │
│   OPTIONAL HEAVYWEIGHT AI PROFILE (--profile ai):                           │
│   • Ollama (11434) · Qdrant (6333) · Open-WebUI (8080) · Flowise (3001)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Edge Cases & Risk Mitigation

1. **Edge Case: Port Conflicts between UndeRoute and Host Services**
   - _Risk_: Port 20128 or 20129 already in use on client VPS.
   - _Mitigation_: Support configurable env vars `OMNIROUTE_PORT` and `OMNIROUTE_API_PORT` in `local-ai-packaged/.env`.

2. **Edge Case: Memory Exhaustion on 2GB RAM VPS**
   - _Risk_: Running n8n + Supabase + UndeRoute concurrently on low-spec host causes OOM kill.
   - _Mitigation_: Enforce Node option `--max-old-space-size=512` for UndeRoute and limit n8n memory via Compose `mem_limit: 768m`.

3. **Edge Case: Missing Zod package in n8n container**
   - _Risk_: TypeScript code node fails with `Cannot find module 'zod'`.
   - _Mitigation_: Add custom Dockerfile build or volume mount for n8n node_modules containing `zod`, plus environment setting `NODE_FUNCTION_ALLOW_EXTERNAL=zod`.

4. **Edge Case: Landing project fallback**
   - _Risk_: `NEXT_PUBLIC_PROJECT_NAME` is invalid or empty.
   - _Mitigation_: Fall back gracefully to `undrlla` project config with a console warning.

---

## 6. Success Criteria

- **SC-001**: Selective container spin-up time for client deployment profile (`n8n` + `supabase` + `underoute`) is **< 45 seconds** on a standard $10/mo Hetzner VPS.
- **SC-002**: Memory footprint of the client deployment profile stays **below 1.5 GB total RAM**.
- **SC-003**: n8n Telegram Bot workflow handles invalid JSON payloads without unhandled exceptions, routing 100% of invalid items to `deadLetterItems`.
- **SC-004**: Multi-project landing page in `undrllanding` successfully builds (`pnpm build`) and renders both `undreseller` and `undrlla` themes without code duplication.
