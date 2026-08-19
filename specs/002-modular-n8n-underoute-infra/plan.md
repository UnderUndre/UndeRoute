# Technical Plan: Modular Docker Deployment Architecture, n8n TG Bot Pipeline & Multi-Project Landing Engine

**Branch**: `002-modular-n8n-underoute-infra` | **Date**: 2026-08-16 | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification from `specs/002-modular-n8n-underoute-infra/spec.md`

---

## 1. Executive Summary

This implementation plan delivers:

1. **Primary Compose Anchor in `UndeRoute`**: `UndeRoute/docker-compose.yml` updated to build `omniroute` directly from local source (`build: context: .`) and include `local-ai-packaged` compose services as modular sidecars (`profiles: [n8n]`, `profiles: [supabase]`, `profiles: [client-lite]`).
2. **Modular Profiles in `local-ai-packaged`**: Refactored `local-ai-packaged/docker-compose.yml` with explicit Docker Compose profiles to allow selective client spin-up (e.g. running n8n + Supabase without heavy Ollama/Qdrant containers).
3. **Telegram Bot Pipeline in n8n**: Standardized n8n workflow JSON definition featuring Telegram webhook ingestion, Zod schema validation inside TypeScript Code Nodes (`NODE_FUNCTION_ALLOW_EXTERNAL=zod`), Claude 3.7 scoring via UndeRoute, and Dead-Letter Queue branching.
4. **Multi-Project Landing Architecture in `undrllanding`**: Restructured Next.js landing engine with `projects/undreseller` and `projects/undrlla` directories resolved dynamically by `process.env.NEXT_PUBLIC_PROJECT_NAME`.

---

## 2. Technical Context

- **Language/Version**: TypeScript / Node.js 20+, Python 3.11 (`start_services.py`), Next.js 15 (App Router), Docker Compose v2.20+
- **Primary Dependencies**: `n8n` (v1.x / latest), `@telegram-auth/server`, `zod`, `@underundre/undesign`, Tailwind CSS v4
- **Storage**: Supabase PostgreSQL + Row Level Security (RLS), Redis 7+ (UndeRoute rate-limiter backend)
- **Target Platform**: Linux VPS (Hetzner Cloud CX22 / CPX11) / macOS / Windows Docker Desktop
- **Constraints**: Total memory for `client-lite` profile < 1.5 GB RAM; startup time < 45 seconds.

---

## 3. Project Structure & Scope of Changes

### 3.1 `UndeRoute` Repository

```text
UndeRoute/
├── docker-compose.yml                  # MODIFIED: add local build context + include local-ai-packaged compose
├── docker-compose.prod.yml             # MODIFIED: production profile bindings
└── specs/002-modular-n8n-underoute-infra/
    ├── spec.md                         # CREATED: feature spec
    ├── plan.md                         # CREATED: technical plan
    └── tasks.md                        # CREATED: task breakdown
```

### 3.2 `local-ai-packaged` Repository

```text
local-ai-packaged/
├── docker-compose.yml                  # MODIFIED: add profiles (n8n, supabase, ai)
├── start_services.py                   # MODIFIED: add --profile flag handling
├── n8n-tool-workflows/
│   └── tg-lead-triage-workflow.json    # CREATED: n8n Zod Dead-Letter workflow
└── .env.example                        # MODIFIED: add NODE_FUNCTION_ALLOW_EXTERNAL=zod
```

### 3.3 `undrllanding` Repository

```text
undrllanding/
├── projects/
│   ├── undrlla/                        # EXISTING: Medusa storefront lander
│   │   ├── config.ts
│   │   └── components/
│   └── undreseller/                    # CREATED: Productized engineering lander ($3.5k/$4.9k)
│       ├── config.ts
│       └── components/
│           ├── hero-undreseller.tsx
│           ├── sprint-pricing.tsx
│           └── loom-demo-section.tsx
├── lib/
│   └── project-config.ts               # CREATED: project resolver (reads NEXT_PUBLIC_PROJECT_NAME)
└── app/(default)/page.tsx              # MODIFIED: render active project dynamically
```

---

## 4. Phase-by-Phase Implementation Design

### Phase 1: Docker Compose Linkage & Profile Modularization (`UndeRoute` & `local-ai-packaged`)

1. In `UndeRoute/docker-compose.yml`:
   - Keep `omniroute-base` building from local root (`build: context: .`).
   - Add `include: - ../local-ai-packaged/docker-compose.yml` (with fallback path check).
   - Add profile alias `client-lite` combining `omniroute`, `n8n`, and `supabase`.
2. In `local-ai-packaged/docker-compose.yml`:
   - Add `profiles: [n8n, client-lite, all]` to `n8n`.
   - Add `profiles: [ai, all]` to `ollama`, `flowise`, `qdrant`, `open-webui`, `searxng`.
   - Set `NODE_FUNCTION_ALLOW_EXTERNAL=zod` in `n8n` container env.
3. Update `start_services.py` CLI parser to pass `--profile` directly to `docker compose`.

### Phase 2: n8n Telegram Bot & Zod Triage Pipeline

1. Create `tg-lead-triage-workflow.json` in `local-ai-packaged/n8n-tool-workflows/`.
2. Pipeline nodes:
   - `Telegram Webhook / Ingest Node`
   - `Zod TypeScript Code Node` (splits payload into `validItems` vs `deadLetterItems`)
   - `Claude 3.7 AI Node` (points to `UndeRoute` API at `http://host.docker.internal:20129/v1/chat/completions`)
   - `Supabase Upsert Node`
   - `Telegram / Slack Alert Node`

### Phase 3: Multi-Project Landing Engine (`undrllanding`)

1. Create `projects/undrlla/` and move existing lander components into it.
2. Create `projects/undreseller/` with components tuned for Productized Engineering (Sprint A $3.5k B2B Automation, Sprint B $4.9k 14-Day SaaS MVP, 90s Loom demo).
3. Implement `lib/project-config.ts` inspecting `process.env.NEXT_PUBLIC_PROJECT_NAME`.
4. Update `app/(default)/page.tsx` to read the active project config and render its sections.

---

## 5. Verification & Testing Strategy

1. **Docker Compose Verification**:
   - Run `docker compose --profile client-lite up -d` in `UndeRoute`.
   - Check `docker ps`: verify `omniroute`, `n8n`, and `supabase` are UP; verify `ollama` and `qdrant` are NOT running.
   - Test total RAM consumption via `docker stats --no-stream`. Must be < 1.5 GB.
2. **n8n Workflow Verification**:
   - Send valid JSON via curl to n8n webhook ➔ verify 200 OK, Supabase record created, TG alert triggered.
   - Send malformed JSON via curl to n8n webhook ➔ verify error caught by Zod node and routed to Dead-Letter branch.
3. **Landing Page Verification**:
   - Run `NEXT_PUBLIC_PROJECT_NAME=undreseller pnpm dev` ➔ verify Undreseller lander displayed.
   - Run `NEXT_PUBLIC_PROJECT_NAME=undrlla pnpm dev` ➔ verify Undrlla lander displayed.
   - Run `pnpm build` in `undrllanding` ➔ verify zero TypeScript errors.
