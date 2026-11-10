# UndeRoute — Living Architecture (specs/main)

> Source of truth for topography and contracts (Constitution Principle VIII.6). Updated when architecture changes — drift here is a defect.
> Status: created 2026-11-10 (constitution amendment v1.9.0); baseline = forensic recheck 2026-11-10.

## 1. What this repo is

UndeRoute = **OSS AI-gateway fork (OmniRoute v3.8.50, `diegosouzapw/OmniRoute`) + agentic coding & character PaaS layer**. Business canon: `repos/undreplans/docs/projects/underoute/business-plan.md` (pointer: `docs/business-plan-pointer.md`).

## 2. Topography

| Layer              | Path                                                                        | Role                                                                           |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Gateway (upstream) | `open-sse/`, `src/{server,mitm,sse,models,domain,lib}`, `bin/omniroute.mjs` | 339 providers, RTK+Caveman compression, OpenAI-compatible APIs                 |
| UI                 | `src/app/**` (Next.js), `electron/`                                         | dashboard, TWA (план), session UI                                              |
| UndeRoute core     | `src/core/{agent,context,db}`                                               | state machine (PLAN/ACT), sandbox provider, repo map, SQLite schema            |
| Themes/personas    | `src/themes/**`, `src/components/persona/**`                                | 9 персон, FX-слой; промпт-слой БЕЗ привилегий (Constitution XIII)              |
| CLI tooling        | `packages/cli` (`underoute-clai`, bin `helpers`)                            | конфиг-транспилятор `.claude/` → Copilot/Gemini; stack-aware agents (spec 003) |
| MCP tool server    | `packages/underboard`                                                       | local-first task board + semantic memory (FTS5)                                |
| Sandbox assets     | `sandbox/{Dockerfile,seccomp.json}`                                         | alpine + non-root; seccomp default-deny allowlist (~50 syscalls)               |
| Tests              | `tests/**` (node:test via tsx)                                              | `npm test`, `npm run test:security`, `test:scoped`                             |

## 3. Agent execution data flow (target, spec 004-safe-harness-valves)

```
user intent → state machine (PLAN→AWAITING_PLAN_APPROVAL→ACT)
  → valves G1/G6/G7/G8 (deterministic pre-gates: deny-list, verify, secrets, deps)
  → container-sandbox (docker: cap-drop ALL, net none, read-only rootfs, seccomp, 512MB/1cpu/pids64)
  → tool-executor / acp-bridge (spawn CLI-агентов claude/opencode/aider)
  → checkpoint (git shadow-ref, pre-write) → audit_events (SQLite, WAL, append-only)
```

## 4. Stage map

| Спека                   | Статус                                         | Кратко                           |
| ----------------------- | ---------------------------------------------- | -------------------------------- |
| 001-init                | Phase 0–2 частично (речек: 4 фиктивных `[x]`)  | Core Engine, MVP-1→4 roadmap     |
| 002-modular-n8n         | 0/13, кандидат на DEPRECATED                   | инфра в других репо              |
| 003-stack-aware-agents  | 41/41 (артефакт stack-matrix.json отсутствует) | stack-sniffer для `helpers`      |
| 004-safe-harness-valves | specify→analyze (2026-11-10)                   | клапаны G1–G8, Constitution XIII |
| G9–G12                  | не начаты                                      | G9 quarantine блокирует MVP-2    |

## 5. Constraints

Технические ограничения — [`requirements.md`](requirements.md) §2.1. Threat model — `docs/threat-model.md` (v1.0, обновляется в 004). Business plan — external canon (VII-B.7).
