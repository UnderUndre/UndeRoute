# Implementation Plan: UndeRoute Core Engine — Staged Architecture & ACP Reverse Agent Plan

**Branch**: `001-init-character-opencode-tg` | **Date**: 2026-08-14 | **Spec**: [specs/001-init/spec.md](specs/001-init/spec.md)  
**Input**: Staged release roadmap (MVP-1 Local Core → MVP-2 Remote → MVP-3 Sync/Billing → MVP-4 Ecosystem), ACP Agents Reverse Execution (`stdio/ACP`), Threat Model & Sandbox Policy, Data Model, Protocol Design.

---

## Summary

Поэтапная реализация UndeRoute:

1. **MVP-1 (Local IDE & ACP Chat Core)**: Local Web IDE & Embedded Chat в OmniRoute дашборде, 9 Personas (UGC/CDN), ACP Reverse Agent Execution (`stdio/ACP` — Claude Code, OpenCode, Hermes, Aider), ANSI Output Sanitizer, Sandboxed Execution (Docker/nsjail), Context Providers (`@file`, `@git`, `@terminal`), AST Repo Map, Local SQLite Audit Trail.
2. **MVP-2 (Remote Telegram Bridge & OpenSandbox)**: Noise_XX Tunnel, Device Registry, OTP Pairing, Remote Approvals, OpenSandbox Adapter.
3. **MVP-3 (Cloud Sync & Billing)**: Multi-device E2E Sync, Entitlement Engine, Telegram Stars / Stripe Billing.
4. **MVP-4 (Ecosystem & WoT)**: Theme Creator Marketplace (70/30), Offline WoT Replay Analyzer.

---

## Technical Context & Architectural Decision Records (ADR)

- **ADR-001 (Deployment Topology)**: Local Desktop Agent / Daemon (`localhost:20128`) written in Node.js / Next.js.
- **ADR-002 (Execution Sandbox)**: Docker Container / nsjail with `--cap-drop=ALL`, `read-only rootfs`, `network-off`, 512MB RAM cgroups, 30s timeout.
- **ADR-003 (Data Persistence)**: SQLite local database for Desktop Agent (`User`, `Device`, `Workspace`, `AgentSession`, `Approval`, `AuditEvent`).
- **ADR-004 (Crypto Protocol)**: Noise_XX (`e, s, ee, s, es, sk`) with X25519 static/ephemeral keys and OTP 6-digit pairing.
- **ADR-005 (ISandboxProvider Pattern)**: `ISandboxProvider` abstraction (`LocalNativeSandbox` for MVP-1, `OpenSandboxAdapter` for MVP-2).
- **ADR-006 (ACP Reverse Execution Architecture)**: Использование встроенного в OmniRoute процессного спавна CLI-агентов (`stdio/ACP`) через `child_process.spawn` с фильтрацией ANSI кодов для вывода чистого Markdown в нативный Chat UI.

---

## Project Structure

```text
app/
├── api/                         # Next.js Server Actions & API endpoints
│   ├── agent/                   # Local Agent & ACP execution API
│   ├── auth/                    # OTP Pairing & Device Auth
│   ├── remote/                  # Telegram Remote Relay Webhooks
│   └── sync/                    # Multi-device Sync API (MVP-3)
├── twa/
│   └── diff-viewer/page.tsx     # Telegram Mini App Monaco Diff Reviewer
src/
├── core/
│   ├── agent/
│   │   ├── state-machine.ts     # AgentStateMachine (PLAN vs ACT mode, HITL approvals)
│   │   ├── acp-bridge.ts        # ACP Reverse Execution Bridge (stdio CLI spawn)
│   │   ├── ansi-sanitizer.ts    # ANSI Escape Sequence Stripper & Markdown Formatter
│   │   ├── tool-executor.ts     # MCP and local tool invocations
│   │   ├── sandbox-provider.ts  # ISandboxProvider Interface & LocalNativeSandbox
│   │   ├── container-sandbox.ts # Docker / nsjail Execution Sandbox
│   │   ├── orphan-reaper.ts     # Process reaper and timeout cleanup
│   │   └── repo-map-builder.ts  # Tree-sitter AST & PageRank Repo Map
│   ├── context/                 # Context Providers (@file, @folder, @terminal, @git)
│   ├── db/                      # SQLite Schema, Migrations & Audit Logger
│   ├── remote/                  # Noise_XX, OTP Pairing, Stream Throttler (MVP-2)
│   └── sync/                    # Cloud Sync Engine (MVP-3)
├── themes/                      # 9 Personas (Naruto, Sasuke, Geralt, Assassins, Musk, Durov, Spidey, WoT, Valera)
sandbox/
├── Dockerfile                   # Hardened Sandbox Image
├── seccomp.json                 # Restricted Seccomp Profile
└── apparmor/                    # Restricted AppArmor Profile
docs/
├── adr/                         # Architectural Decision Records (001 - 006)
└── threat-model.md              # Sandbox Threat Model & Security Specification
```
