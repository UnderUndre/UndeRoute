# Feature Specification: UndeRoute Core Engine — Staged Architecture & Hardened Security Spec

**Feature Branch**: `001-init-character-opencode-tg`  
**Created**: 2026-08-14 | **Updated**: 2026-08-14 (Architecture Review Audit Pass)  
**Status**: Staged & Hardened Specification  
**Input**: Staged release roadmap (MVP-1 Local Core → MVP-2 Remote → MVP-3 Sync/Billing → MVP-4 Ecosystem), Threat Model & Sandbox Policy, Noise_XX Protocol Lifecycle, Data Persistence.

---

## 🎯 Staged Release Roadmap (Release Boundaries)

Чтобы обеспечить доказуемую безопасность и стабильность, реализация разделена на 4 строгих независимых релиза:

1. **MVP-1 (Local Agentic IDE Core)**:
   - Local Web IDE, 9 Персон (UGC/CDN), Plan/Act State Machine, Context Providers (`@file`, `@folder`, `@terminal`, `@git`), Monaco Diff Editor, Sandboxed Execution (Docker/nsjail), Local SQLite Audit Trail.
   - _Не входит_: Telegram Remote, Cloud Sync, Payments, WoT.
2. **MVP-2 (Remote Telegram Bridge & Device Registry)**:
   - Noise_XX Protocol Tunnel, Device Registry, OTP Pairing, Telegram Remote Approvals, Stream Throttling (1.5s), TWA Monaco Diff Viewer.
3. **MVP-3 (Cloud Sync & Entitlement PaaS)**:
   - Multi-Device E2E Sync (Postgres + Object Storage), Entitlement State Machine, Telegram Stars & Stripe Adapters.
4. **MVP-4 (Ecosystem & WoT R&D)**:
   - Theme Creator Marketplace (70/30), Offline WoT Replay Analyzer.

---

## 🛡️ Security Threat Model & Sandbox Execution Policy (FR-002 Hardening)

### Deployment Topology & Trust Boundary

- **Execution Environment**: Local Desktop Agent / Daemon running on user's machine (`localhost:20128`).
- **Sandbox Container Policy**:
  - **Isolation**: Docker Container / nsjail sandbox per session.
  - **Filesystem**: Read-Only Root Filesystem (`read-only rootfs`), Mount workspace directory strictly read-write.
  - **Network**: `network-off` by default. Outbound network enabled only if explicitly requested and approved by operator.
  - **Capabilities**: All Linux capabilities dropped (`--cap-drop=ALL`).
  - **Seccomp / AppArmor**: Restricted syscall profile blocking `ptrace`, `chroot`, `mount`, `sys_admin`.
  - **Resource Cgroups**: Hard limit **512 MB RAM**, **1 vCPU core**, process limit (max 64 pids to prevent fork bombs).
  - **Execution Timeout**: Hard timeout 30 seconds. Automatic orphan process reaper on timeout.
  - **User Privilege**: Non-root user (`uid 1000:1000`).

---

## 🔐 Protocol Design: Noise_XX & Device Lifecycle (FR-005 Hardening)

### Noise_XX Protocol Lifecycle

1. **Static Identity Keys**: Ed25519 / X25519 static identity keys generated locally on Desktop Agent (`DeviceKey`).
2. **Handshake Pattern**: **Noise_XX** (`e, s, ee, s, es, sk`).
3. **Device Pairing**:
   - Desktop Agent displays 6-digit OTP / QR Code containing `epub_local` + pairing token (TTL 5 minutes).
   - User inputs `/pair <OTP>` in Telegram.
   - Successful handshake adds `Telegram ID` + `X25519 public key` to local `DeviceRegistry` (SQLite).
4. **Session Transport**: AES-256-GCM authenticated encryption with auto-incrementing nonces and anti-replay window (64 messages).
5. **Revocation & Recovery**: User can revoke any device in Desktop IDE at any time, invalidating associated session keys immediately.

---

## 💾 Data Persistence & Entitlement Data Model

### Core Entities (SQLite Local / Postgres Cloud)

- **`User`**: `id`, `created_at`, `role`.
- **`Device`**: `id`, `user_id`, `name`, `public_key`, `paired_at`, `status` (ACTIVE / REVOKED).
- **`Workspace`**: `id`, `path`, `trust_level`.
- **`AgentSession`**: `id`, `workspace_id`, `state` (PLAN / AWAITING_APPROVAL / ACTING / COMPLETED / ERROR), `mode` (PLAN / ACT).
- **`Approval`**: `id`, `session_id`, `command`, `actor`, `status` (PENDING / APPROVED / REJECTED), `created_at`, `expires_at`.
- **`AuditEvent`**: `id`, `session_id`, `actor`, `action`, `details_json`, `timestamp`.
- **`Entitlement`**: `user_id`, `sku`, `status` (ACTIVE / GRACE / CANCELED), `expires_at`.

---

## User Scenarios & Acceptance Criteria _(mandatory)_

### MVP-1: User Story 1 - Local Multi-Character Theming (Priority: P1)

**Given** открытый локальный интерфейс UndeRoute, **When** пользователь переключает тему на "Наруто", **Then** тему загружает CSS/Canvas эффекты, подставляет системный промпт Наруто, а медиа-ассеты подгружаются через UGC/CDN без блокировки интерфейса.

### MVP-1: User Story 2 - Agentic IDE & Sandboxed Execution (Priority: P1)

**Given** задача на модификацию кода в режиме Act Mode, **When** модель генерирует `execute_bash`, **Then**:

1. Система запрашивает HITL одобрение оператора с выведением точного текста команды.
2. После одобрения команда запускается в Docker-песочнице с `read-only rootfs`, `network-off`, 512MB RAM.
3. Попытка выполнить `rm -rf /` или вылезти из workspace завершается ошибкой изоляции без вреда хост-системе.
4. Все действия записываются в локальный `AuditEvent` log.

---

## Functional Requirements

- **FR-001 (Theme Engine)**: 9 локальных тем персонажей (UGC/CDN lazy loading).
- **FR-002 (Plan/Act Sandbox State Machine)**: Plan Mode (read-only) и Act Mode (read-write) с принудительной Docker/nsjail изоляцией `execute_bash` (512MB RAM, 30s timeout, cap-drop ALL, network-off).
- **FR-003 (Context Providers)**: `@file`, `@folder`, `@terminal`, `@git`.
- **FR-004 (Repo Map Compression)**: AST Repo Map via `web-tree-sitter` & PageRank.
- **FR-005 (Noise_XX Remote Relay)**: Noise_XX handshake, X25519 pairing, OTP/QR code, Device Registry & Revocation (MVP-2).
- **FR-006 (Cloud Sync & Entitlement)**: E2E multi-device sync, Telegram Stars / Stripe adapters (MVP-3).
