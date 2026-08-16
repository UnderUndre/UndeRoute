# Feature Specification: UndeRoute Core Engine — Staged Architecture & ACP Reverse Agent Integration

**Feature Branch**: `001-init-character-opencode-tg`  
**Created**: 2026-08-14 | **Updated**: 2026-08-14 (ACP Agents & Native Chat Integration Pass)  
**Status**: Staged, Hardened & ACP-Integrated Specification  
**Input**: Staged release roadmap (MVP-1 Local Core → MVP-2 Remote → MVP-3 Sync/Billing → MVP-4 Ecosystem), ACP Reverse Execution Architecture (`stdio/ACP`), Threat Model & Sandbox Policy, ISandboxProvider Abstraction.

---

## 🎯 Staged Release Roadmap (Release Boundaries)

1. **MVP-1 (Local Agentic IDE & ACP Chat Core)**:
   - **OmniRoute Native Chat & ACP Execution**: Чат-интерфейс в дашборде, использующий готовый обратный поток спавна CLI-агентов (`stdio/ACP` — Claude Code, OpenCode, Hermes, Aider).
   - **ANSI Stripping & Sanitization**: Фильтрация escape-последовательностей PTY/stdio для вывода чистого Markdown и диффов.
   - **Dual Execution Mode**:
     - _Chat Mode_: Прямые запросы к OmniRoute API (`/v1/chat/completions`) к быстрым моделям.
     - _Agent / ACP Mode_: Двусторонний `stdio/ACP` спавн автономных кодинг-агентов.
   - **9 Персон (UGC/CDN)**: Динамический инжект системных промптов (Наруто, Саске, Геральт, Валера и др.) в контекст моделей/агентов.
   - **ISandboxProvider**: Принудительная Docker/nsjail изоляция выполнения деструктивных команд.
   - _Не входит_: Telegram Remote, Cloud Sync, Payments, WoT.

2. **MVP-2 (Remote Telegram Bridge & OpenSandbox Advanced Provider)**:
   - Noise_XX Protocol Tunnel, Device Registry, OTP Pairing, Telegram Remote Approvals, Stream Throttling (1.5s), TWA Monaco Diff Viewer, OpenSandbox Adapter (`@alibaba-group/opensandbox`).

3. **MVP-3 (Cloud Sync & Entitlement PaaS)**:
   - Multi-Device E2E Sync (Postgres + Object Storage), Entitlement State Machine, Telegram Stars & Stripe Adapters.

4. **MVP-4 (Ecosystem & WoT R&D)**:
   - Theme Creator Marketplace (70/30), Offline WoT Replay Analyzer.

---

## ⚡ ACP Agents Architecture (`stdio/ACP` Integration)

UndeRoute задействует встроенный в OmniRoute подкапотный механизм **Reverse Execution (stdio/ACP)**:

- OmniRoute выступает в роли управляющего процессного контроллера, спавнящего CLI-агентов (Claude Code, Hermes, Aider, OpenCode) как дочерние процессы (`child_process.spawn`).
- Входящие сообщения пользователя транслируются в `stdin` агента, а исходящий `stdout/stderr` поток санируется от ANSI escape-кодов и стримится в нативный React Chat UI.
- Все темы персонажей подставляются на уровне промпт-пресетов (System Prompt Injection) перед передачей в ACP-воркер.

---

## 🛡️ Security Threat Model & ISandboxProvider Architecture (FR-002 Hardening)

### ISandboxProvider Interface Pattern

Все инструменты исполнения (`execute_bash`, `write_file`, `read_file`) взаимодействуют исключительно через чистый интерфейс `ISandboxProvider`:

```typescript
export interface ISandboxProvider {
  execute(
    command: string,
    options?: { timeoutMs?: number; env?: Record<string, string> }
  ): Promise<{ stdout: string; stderr: string; exitCode: number }>;
  writeFile(path: string, content: Buffer | string): Promise<void>;
  readFile(path: string): Promise<Buffer | string>;
  destroy(): Promise<void>;
}
```

---

## Functional Requirements

- **FR-001 (Theme Engine)**: 9 локальных тем персонажей (UGC/CDN lazy loading) с инжектом системных промптов в ACP и OpenAI эндпоинты.
- **FR-002 (ACP Reverse Execution & Plan/Act Sandbox)**: Поддержка `stdio/ACP` спавна CLI-агентов с принудительной Docker/nsjail изоляцией через `ISandboxProvider` (`LocalNativeSandbox` в MVP-1, `OpenSandboxAdapter` в MVP-2).
- **FR-002a (ANSI Output Sanitization)**: Парсинг и фильтрация ANSI escape-последовательностей из `stdout` CLI-агентов.
- **FR-003 (Context Providers)**: `@file`, `@folder`, `@terminal`, `@git`.
- **FR-004 (Repo Map Compression)**: AST Repo Map via `web-tree-sitter` & PageRank.
- **FR-005 (Noise_XX Remote Relay)**: Noise_XX handshake, X25519 pairing, OTP/QR code, Device Registry (MVP-2).
- **FR-006 (Cloud Sync & Entitlement)**: E2E multi-device sync, Telegram Stars / Stripe adapters (MVP-3).
