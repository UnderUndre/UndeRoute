# Tasks: UndeRoute Core Engine — Staged Release Architecture & Hardened Security

**Input**: Design documents from `specs/001-init/` (spec.md, plan.md, UndeRoute Persona Design System.md, docs/business-plan.md)

## Agent Tags

| Tag       | Agent                   | Domain                                                             |
| --------- | ----------------------- | ------------------------------------------------------------------ |
| `[SETUP]` | — (orchestrator)        | Project structure & dependency configuration                       |
| `[DB]`    | database-architect      | SQLite schema, migrations, repositories, audit logging             |
| `[FE]`    | frontend-specialist     | React components, Monaco Editor, Canvas/Lottie FX, Tailwind styles |
| `[BE]`    | backend-specialist      | Agent state machine, Sandbox Container, Crypto Relay, Repo Map     |
| `[SEC]`   | security-auditor        | Security audit of Threat Model, Sandbox Policy, Noise_XX           |
| `[OPS]`   | devops-engineer         | Environment config, Docker Container Sandboxing, Telegram Webhooks |
| `[E2E]`   | test-engineer           | End-to-End testing of Theme Engine, Sandbox & TG Remote            |
| `[FIN]`   | human-financial-analyst | Unit-economics, Stripe & Telegram Stars payout validation          |
| `[LAW]`   | human-legal-counsel     | Terms of Service, Privacy Policy & DMCA UGC Disclaimers            |
| `[MKT]`   | human-marketing-lead    | Viral demo videos, Reddit/X content & ProductHunt launch           |
| `[QA]`    | human-qa-tester         | Manual physical device testing (iOS/Android) & audio verification  |
| `[BIZ]`   | human-bizdev-lead       | Skin creator revenue sharing (70/30) & partnership deals           |

---

## Phase 0: Architecture & Foundation Prerequisites (P0 Blocking Gate)

- [x] T000a [SEC] Document Sandbox Threat Model & Deny-by-Default Policy in `docs/threat-model.md`
- [x] T000b [OPS] Create Hardened Sandbox Dockerfile, Seccomp profile & AppArmor profile in `sandbox/`
- [x] T000c [DB] Implement SQLite Database Schema, Migrations & Audit Logger (`User`, `Workspace`, `Device`, `AgentSession`, `Approval`, `AuditEvent`) in `src/core/db/`
- [x] T000d [BE] Document Noise_XX Protocol Specification (Handshake, Framing, Nonces, Pairing, Revocation) in `docs/adr/004-noise-protocol.md`
- [x] T000e [BE] Create Runtime Schema Validation contracts using Zod in `src/contracts/`
- [x] T000f [SEC] Adversarial Sandbox Test Suite (path traversal, symlink escape, fork bomb, network block, orphan reaper) in `tests/security/sandbox.test.ts`

---

## Phase 1: MVP-1 Setup & Shared Infrastructure

- [x] T001 [SETUP] Create project structure per implementation plan in `app/`, `src/core/`, `src/themes/`
- [x] T002 [SETUP] Install frontend, WASM & core dependencies (`@monaco-editor/react`, `web-tree-sitter`, `dockerode`, `better-sqlite3`, `zod`) in `package.json`

---

## Phase 2: MVP-1 Local Agentic IDE Core (Priority: P1) 🎯 MVP-1 RELEASE

- [x] T003 [FE] [US1] Create `ThemeEngine` registry in `src/themes/theme-engine.ts` supporting dynamic 9-Persona configuration loading
- [x] T004 [FE] [US1] Create 9 persona definitions in `src/themes/definitions/`
- [x] T005 [BE] [US1] Create System Prompt builder for all 9 personas in `src/themes/persona-prompts.ts`
- [x] T006 [FE] [US1] Implement `PersonaSelector.tsx`, `ChatBoxFxOverlay.tsx` and `AudioVideoTrigger.tsx` in `src/components/persona/`
- [x] T007 [BE] [US2] Implement Plan Mode vs Act Mode logic with HITL approval resolver in `src/core/agent/state-machine.ts`
- [x] T008 [OPS] [US2] Implement Docker Execution Sandbox (`container-sandbox.ts`) with cgroups memory limits (512MB RAM, 30s timeout) and `orphan-reaper.ts` in `src/core/agent/`
- [x] T008a [BE] [US2] Implement `ISandboxProvider` interface and `LocalNativeSandbox` adapter in `src/core/agent/sandbox-provider.ts`
- [x] T009 [BE] [US2] Route `execute_bash` through `container-sandbox.ts` via `ISandboxProvider` in `src/core/agent/tool-executor.ts`
- [x] T010 [BE] [US2] Implement `@file`, `@folder`, `@terminal`, `@git` context providers in `src/core/context/`
- [x] T011 [BE] [US2] Implement AST Repo Map Builder via `web-tree-sitter` and PageRank in `src/core/agent/repo-map-builder.ts`
- [x] T012 [FE] [US2] Build `MonacoDiffViewer.tsx` and `AgentPlanOverlay.tsx` in `src/components/ide/`
- [x] T013 [E2E] [US2] Integration test for MVP-1 Local IDE (Plan mode read-only check, sandbox execution, diff preview) in `tests/integration/local-ide.test.ts`

**Checkpoint**: MVP-1 Local Agentic IDE is fully functional, secure, and testable independently without any remote dependencies!

---

## Phase 3: MVP-2 Remote Telegram Bridge & Device Registry (Priority: P2)

- [ ] T014 [BE] [US3] Implement Device Registry & Identity Key Store in `src/core/remote/device-registry.ts`
- [ ] T015 [BE] [US3] Implement Noise_XX Handshake Protocol (X25519 static/ephemeral keys) in `src/core/remote/noise-handshake.ts`
- [ ] T016 [BE] [US3] Implement 6-digit OTP & QR-Code pairing with Telegram ID Whitelist in `src/core/remote/otp-pairing.ts`
- [ ] T017 [BE] [US3] Implement `TelegramStreamThrottler.ts` (1.5s interval to prevent HTTP 429) in `src/core/remote/stream-throttler.ts`
- [ ] T018 [OPS] [US3] Configure grammY Telegram Bot Relay & Voice-to-Code Whisper pipeline in `src/core/remote/tg-bot-relay.ts`
- [ ] T019 [FE] [US3] Build Telegram Mini App (TWA) Diff Viewer page with `initData` HMAC validation in `app/twa/diff-viewer/page.tsx`
- [ ] T020 [SEC] [US3] Security audit of Noise_XX handshake and OTP pairing mechanism in `tests/security/remote-pairing.test.ts`
- [ ] T020a [BE] [US3] Implement `OpenSandboxAdapter` (`@alibaba-group/opensandbox` & `opensandbox-mcp`) for Firecracker microVMs, Playwright VNC & Egress Firewall in `src/core/agent/opensandbox-adapter.ts`

---

## Phase 4: MVP-3 Cloud Sync Pro & Entitlement PaaS (Priority: P2)

- [ ] T021 [BE] [US3] Implement E2E Encrypted Multi-Device History & Settings Sync Engine in `src/core/sync/cloud-sync.ts`
- [ ] T022 [BE] [US3] Implement Telegram Stars & Stripe Payments Handler & Entitlement State Machine in `src/core/remote/stars-billing.ts`
- [ ] T023 [FIN] Validate multi-tier unit-economics ($9.99 Relay, $14.99 Sync Pro, $29/user Team Hub) in `docs/business-plan.md`

---

## Phase 5: MVP-4 Ecosystem & WoT R&D (Priority: P3)

- [ ] T024 [BE] [US4] Implement `.wotreplay` binary parser integration in `src/core/wot/replay-parser.ts`
- [ ] T025 [FE] [US4] Build WoT CEF HUD Overlay component in `src/components/wot/TacticalHudOverlay.tsx`
- [ ] T026 [LAW] Draft Terms of Service, Privacy Policy, and DMCA UGC Disclaimer for user-contributed character themes/audio in `LEGAL.md`
- [ ] T027 [MKT] Produce 30-second viral demo video "Voice Coding via Telegram in Kurama Mode" and launch copy for Reddit r/LocalLLaMA & ProductHunt
- [ ] T028 [QA] Conduct manual end-to-end testing of Telegram Mini App (TWA) Monaco Diff Editor on physical iOS & Android devices
- [ ] T029 [BIZ] Establish 70/30 revenue share terms and agreement templates for third-party theme/skin creators

---

## Dependency Graph

### Dependencies

T000a + T000b + T000c → T001, T002
T001 + T002 → T003, T007
T003 → T004, T005, T006
T007 + T008 → T009, T012
T009 + T010 + T011 → T013
T013 → T014, T015
T014 + T015 → T016, T017, T018, T019
T018 + T019 → T020, T021
T021 → T022, T023

---

## Agent Summary

| Agent     | Task Count | Can Start After |
| --------- | ---------- | --------------- |
| `[SETUP]` | 2          | T000a–T000f     |
| `[DB]`    | 1          | Immediately     |
| `[FE]`    | 7          | T001            |
| `[BE]`    | 10         | T002            |
| `[OPS]`   | 3          | Immediately     |
| `[SEC]`   | 3          | Immediately     |
| `[E2E]`   | 1          | T013            |
| `[FIN]`   | 1          | T022            |
| `[LAW]`   | 1          | Immediately     |
| `[MKT]`   | 1          | T019            |
| `[QA]`    | 1          | T019            |
| `[BIZ]`   | 1          | Immediately     |
