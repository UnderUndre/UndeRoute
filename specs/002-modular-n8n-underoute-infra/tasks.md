# Tasks: Modular Docker Deployment Architecture, n8n TG Bot Pipeline & Multi-Project Landing Engine

**Feature Directory**: `specs/002-modular-n8n-underoute-infra`  
**Created**: 2026-08-16  
**Plan**: [`plan.md`](./plan.md) | **Spec**: [`spec.md`](./spec.md)

---

## Task Breakdown

### Phase 1: Docker Compose Linkage & Modular Profiles (Priority: P1) [US1]

- [ ] **TASK-101** `[OPS]` `[US1]`: Update `local-ai-packaged/docker-compose.yml` with explicit service profiles (`n8n`, `supabase`, `ai`, `client-lite`). Set `NODE_FUNCTION_ALLOW_EXTERNAL=zod` on `n8n`.
- [ ] **TASK-102** `[OPS]` `[US1]`: Update `UndeRoute/docker-compose.yml` to include `local-ai-packaged` docker-compose as an included sidecar stack and define the `client-lite` profile (`build: context: .`).
- [ ] **TASK-103** `[BE]` `[US1]`: Update `local-ai-packaged/start_services.py` to parse `--profile` arguments and forward them to `docker compose`.
- [ ] **TASK-104** `[E2E]` `[US1]`: Test selective startup using `docker compose --profile client-lite up -d` in `UndeRoute` and verify container status + RAM usage (<1.5 GB).

---

### Phase 2: n8n Telegram Bot & Zod Triage Pipeline (Priority: P2) [US2]

- [ ] **TASK-201** `[BE]` `[US2]`: Create `tg-lead-triage-workflow.json` in `local-ai-packaged/n8n-tool-workflows/`.
- [ ] **TASK-202** `[BE]` `[US2]`: Write TypeScript Zod validation node logic in `tg-lead-triage-workflow.json` with two output branches `[validItems, deadLetterItems]`.
- [ ] **TASK-203** `[BE]` `[US2]`: Configure Claude 3.7 AI node in n8n pointing to `UndeRoute` API (`http://host.docker.internal:20129/v1/chat/completions`).
- [ ] **TASK-204** `[E2E]` `[US2]`: Test n8n workflow execution with valid and invalid payloads via curl. Verify Dead-Letter queue alerts.

---

### Phase 3: Multi-Project Landing Engine in `undrllanding` (Priority: P3) [US3]

- [ ] **TASK-301** `[FE]` `[US3]`: Refactor `undrllanding` directory structure: create `projects/undrlla/` and move existing Medusa lander components.
- [ ] **TASK-302** `[FE]` `[US3]`: Create `projects/undreseller/` with HeroUndreseller, SprintPricing ($3.5k/$4.9k), and LoomDemoSection components.
- [ ] **TASK-303** `[FE]` `[US3]`: Create `lib/project-config.ts` project resolver inspecting `process.env.NEXT_PUBLIC_PROJECT_NAME`.
- [ ] **TASK-304** `[FE]` `[US3]`: Update `app/(default)/page.tsx` to dynamically render the active project lander.
- [ ] **TASK-305** `[E2E]` `[US3]`: Run `pnpm build` in `undrllanding` and test switching between `NEXT_PUBLIC_PROJECT_NAME=undreseller` and `NEXT_PUBLIC_PROJECT_NAME=undrlla`.

---

## Dependency Graph

```text
TASK-101 → TASK-102 → TASK-103 → TASK-104
TASK-201 → TASK-202 → TASK-203 → TASK-204
TASK-301 → TASK-302 → TASK-303 → TASK-304 → TASK-305
```

---

## Parallel Lanes

| Lane                     | Assigned Tasks                                   | Agent Domain                        |
| ------------------------ | ------------------------------------------------ | ----------------------------------- |
| Lane 1 (Infra & Compose) | TASK-101, TASK-102, TASK-103, TASK-104           | DevOps (`[OPS]`) & Backend (`[BE]`) |
| Lane 2 (n8n & TG Bot)    | TASK-201, TASK-202, TASK-203, TASK-204           | Backend (`[BE]`)                    |
| Lane 3 (Landing Engine)  | TASK-301, TASK-302, TASK-303, TASK-304, TASK-305 | Frontend (`[FE]`)                   |

---

## Agent Summary

| Tag     | Count | Description                                           |
| ------- | ----- | ----------------------------------------------------- |
| `[OPS]` | 2     | Infrastructure & Docker Compose configuration         |
| `[BE]`  | 4     | Python service runners, n8n workflows, Zod code nodes |
| `[FE]`  | 4     | Next.js components, project configuration resolver    |
| `[E2E]` | 3     | Verification and multi-container integration testing  |

---

## Definition of Done

- All tasks checked and verified.
- `docker compose --profile client-lite up -d` boots UndeRoute + n8n + Supabase cleanly without running Ollama/Qdrant.
- n8n workflow safely validates payloads via Zod without runtime crashes.
- `undrllanding` builds cleanly for both `undreseller` and `undrlla` targets.
