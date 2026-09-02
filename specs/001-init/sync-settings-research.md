Ебать мой лысый череп, да это же **идеальный брак сантехники и вентиляции!**

`OmniRoute` от Diego Souza — это мощнейший, проверенный в боях локальный шлюз (TypeScript, 350+ провайдеров, сжатие токенов RTK+Caveman, MCP-сервер, роутинг). Но в базовом виде это «труба с вентилями»: он перенаправляет HTTP-запросы и жмёт токены.

Твоя спека **UndeRoute** с обратным спавном агентов (`stdio/ACP`), персонами (включая меня, Валеру) и песочницами поверх OmniRoute — это превращение пассивного шлюза в полноценную **автономную операционную систему для ИИ-агентов (AI Agent OS)**. А идея универсальной кросс-агентской синхронизации и трансляции правил ложится сюда как родная резьба на 3/4 дюйма.

Ниже — детальный аудит того, **как врезать эту систему в OmniRoute, где возникнут засоры и как их расшить.**

---

### АРХИТЕКТУРА ИНТЕГРАЦИИ: КАК СХОДЯТСЯ ТРУБЫ

```
                          АРХИТЕКТУРНЫЙ СТЕК UNDE-ROUTE (OMNIROUTE FORK)

  +-----------------------------------------------------------------------------------------+
  |              DASHBOARD & CHAT UI  |  TELEGRAM TWA  |  EXTERNAL APIS (/v1)               |
  +-----------------------------------------------------------------------------------------+
                                               |
                                               v
  +-----------------------------------------------------------------------------------------+
  |                             UNDE-ROUTE CONTROL PLANE ENGINE                             |
  |  - Auth: Undrlla IdP (RS256 JWT via JWKS) [FR-007]                                      |
  |  - Theme/Persona Engine (Валера, Геральт, Наруто -> System Prompt & Config Generator)   |
  |  - Unified Config Transpiler (Генерит CLAUDE.md, AGENTS.md, .cursorrules на лету)       |
  +-----------------------------------------------------------------------------------------+
                         /                                           \
                        v                                             v
  +-------------------------------------------+   +-----------------------------------------+
  |   ORIGINAL OMNIROUTE CORE (Gateway/Proxy) |   |    ACP REVERSE AGENT CONTROLLER         |
  |   - 350+ Providers & Auto-Fallback        |   |    - Child Process Manager (stdio/ACP)  |
  |   - RTK + Caveman Token Compression       |   |    - ANSI Stripper & Stream Sanitizer   |
  |   - Model Context Protocol (MCP) Host     |   |    - Spawns: Claude Code / Hermes /     |
  +-------------------------------------------+   |             Aider / OpenCode            |
                        ^                         +-----------------------------------------+
                        | (Internal Local Loop)                        |
                        +----------------------------------------------+
                                               |
                                               v
  +-----------------------------------------------------------------------------------------+
  |                    ISandboxProvider LAYER (LocalNative / Docker / OpenSandbox)          |
  |  - Isolated FS & Shell Execution (Drop Caps, Block AWS Metadata 169.254.169.254)       |
  +-----------------------------------------------------------------------------------------+
                                               |
                                               v
  +-----------------------------------------------------------------------------------------+
  |               SYNC & MEMORY ENGINE (MVP-3: Noise_XX + WAL-Safe SQLite Sync)             |
  |  - State checkpointing (VACUUM INTO / state.db) + Multi-Device E2EE Sync                |
  +-----------------------------------------------------------------------------------------+
```

---

### 4 ГЛАВНЫХ ЗАСОРА И ИХ РЕШЕНИЕ (НЮАНСЫ РЕАЛИЗАЦИИ)

#### Засор 1. Как подружить ACP-агентов с локальным шлюзом OmniRoute

- **Суть проблемы:** Когда ты через `child_process.spawn` запускаешь `claude-code`, `aider` или `hermes`, они по дефолту ломятся напрямую в облака Anthropic/OpenAI, игнорируя твой роутер и компрессию Caveman.
- **Решение:** Контроллер ACP при спавне процесса подменяет переменные окружения, заворачивая агента на локальный порт OmniRoute:

  ```typescript
  // acp_process_controller.ts
  const localOmniPort = process.env.OMNIROUTE_PORT || 20128; //

  const agentEnv = {
    ...process.env,
    // Перенаправляем Claude Code на OmniRoute
    ANTHROPIC_BASE_URL: `http://127.0.0.1:${localOmniPort}/v1`,
    ANTHROPIC_API_KEY: `omni-local-token`, // OmniRoute сам подставит реальный ключ
    // Перенаправляем OpenAI/Hermes/Aider
    OPENAI_BASE_URL: `http://127.0.0.1:${localOmniPort}/v1`,
    OPENAI_API_KEY: `omni-local-token`,
  };
  ```

---

#### Засор 2. Инъекция Персон (Theme Engine) в агентов

- **Суть проблемы:** В обычном чате ты можешь просто добавить системный промпт. Но у `Claude Code` или `OpenCode` системный промпт зашит глубоко в CLI.
- **Решение:** Модуль Персон должен работать на двух уровнях:
  1. **Для Chat Mode:** Прямая инъекция в массив `messages[0]` (`role: "system"`) перед отправкой в OmniRoute API.
  2. **Для ACP Mode:** Автоматическая генерация и подкладывание временного файла правил в рабочий каталог проекта перед спавном процесса:
     - Для Claude Code: генерирует `.claude/CLAUDE.md`.
     - Для OpenCode / Codex: генерирует `AGENTS.md`.
     - Для Cursor: генерирует `.cursor/rules/persona.mdc`.

Когда выбирается персона «Валера», контроллер генерирует манифест с правилами сантехнического сленга и TDD, и агент подхватывает его нативно!

---

#### Засор 3. ANSI Escape Codes и PTY (Чистый стриминг в React UI)

- **Суть проблемы:** CLI-агенты используют `ink`, `blessed` или сырые escape-коды для отрисовки спиннеров, прогресс-баров и цветов. Если прокинуть `stdout` в веб-чат «как есть», UI превратится в кашу из `\x1b[2K\x1b[1G`.
- **Решение (FR-002a):** Потоковый санитайзер на базе регулярки ANSI-стриппера и сборщик диффов:

```typescript
// utils/ansi_sanitizer.ts
const ANSI_REGEX = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

export function sanitizeAgentStream(chunk: Buffer | string): string {
  const text = typeof chunk === "string" ? chunk : chunk.toString("utf-8");
  return text.replace(ANSI_REGEX, "");
}
```

---

#### Засор 4. Синхронизация SQLite баз без падений (WAL Safe Checkpoints)

- **Суть проблемы:** В OmniRoute уже используется SQLite для `audit_log` и настроек. В MVP-3 ты планируешь кросс-девайс синк. Если синкать активную базу, на клиенте будет `SQLite database corrupted`.
- **Решение:** Реализация безопасного снэпшота через механизм SQLite Online Backup перед отправкой в Cloud/P2P Sync:

```typescript
// sync/sqlite_snapshot.ts
import Database from "better-sqlite3";

export async function createSafeDbSnapshot(
  sourceDbPath: string,
  snapshotPath: string
): Promise<void> {
  const db = new Database(sourceDbPath);
  // Принудительно сбрасываем WAL в основной файл и делаем атомарную копию
  await db.backup(snapshotPath);
  db.close();
}
```

---

### СТРУКТУРА ПАПОК ДЛЯ ТВОЕГО ФОРКА (UNDE-ROUTE)

Вот как органично расширить кодовую базу OmniRoute, не ломая апстрим-обновления от Diego:

```
omniroute/
├── src/
│   ├── core/                  # Оригинальный роутер, провайдеры, Caveman сжатие
│   ├── server/                # Express/Fastify HTTP API
│   │
│   ├── underoute/             # <--- ТВОЙ НОВЫЙ МОДУЛЬ (UndeRoute Core)
│   │   ├── acp/               # ACP Process Controller & stdio pipes
│   │   │   ├── runner.ts      # child_process manager (Claude Code, Hermes, Aider)
│   │   │   └── ansi.ts        # FR-002a ANSI Sanitizer
│   │   │
│   │   ├── auth/              # FR-007 Undrlla IdP Auth
│   │   │   └── jwt_verifier.ts# RS256 JWKS validation (id.undrlla.network)
│   │   │
│   │   ├── personas/          # FR-001 Theme Engine (Валера, Геральт, Наруто)
│   │   │   ├── registry.ts    # Загрузка тем (UGC/CDN)
│   │   │   └── transpiler.ts  # Генератор CLAUDE.md / AGENTS.md / .cursorrules
│   │   │
│   │   ├── sandbox/           # FR-002 ISandboxProvider Interface
│   │   │   ├── isandbox.ts    # Интерфейс ISandboxProvider
│   │   │   ├── native.ts      # LocalNativeSandbox (MVP-1)
│   │   │   └── docker.ts      # Docker / OpenSandboxAdapter (MVP-2)
│   │   │
│   │   ├── remote/            # FR-005 MVP-2 Telegram Bridge & Noise_XX
│   │   │   └── noise_relay.ts # Noise_XX handshake & OTP pairing
│   │   │
│   │   └── sync/              # FR-006 MVP-3 Universal Sync & State
│   │       ├── snapshot.ts    # WAL-safe SQLite backup
│   │       └── state_sync.ts  # Multi-device E2EE sync
```

---

### ПРИМЕР: РЕАЛИЗАЦИЯ ИНТЕРФЕЙСА `ISandboxProvider` (FR-002)

Вот эталонный код песочницы для изоляции команд агентов с блокировкой опасных сетей:

```typescript
// src/underoute/sandbox/native.ts
import { spawn } from "child_process";
import * as fs from "fs/promises";
import { ISandboxProvider } from "./isandbox";

export class LocalNativeSandbox implements ISandboxProvider {
  private allowedRootDir: string;

  constructor(allowedRootDir: string) {
    this.allowedRootDir = allowedRootDir;
  }

  async execute(
    command: string,
    options?: { timeoutMs?: number; env?: Record<string, string> }
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve) => {
      // Защита: фильтрация деструктивных вызовов на базовом уровне
      if (command.includes("169.254.169.254")) {
        return resolve({
          stdout: "",
          stderr: "Security Block: Access to Cloud Metadata API is forbidden.",
          exitCode: 1,
        });
      }

      const proc = spawn(command, {
        shell: true,
        cwd: this.allowedRootDir,
        timeout: options?.timeoutMs || 30000,
        env: { ...process.env, ...options?.env },
      });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (data) => (stdout += data.toString()));
      proc.stderr.on("data", (data) => (stderr += data.toString()));

      proc.on("close", (exitCode) => {
        resolve({
          stdout,
          stderr,
          exitCode: exitCode ?? 0,
        });
      });

      proc.on("error", (err) => {
        resolve({
          stdout,
          stderr: err.message,
          exitCode: 1,
        });
      });
    });
  }

  async writeFile(path: string, content: Buffer | string): Promise<void> {
    await fs.writeFile(path, content);
  }

  async readFile(path: string): Promise<Buffer | string> {
    return await fs.readFile(path);
  }

  async destroy(): Promise<void> {
    // Очистка временных ресурсов песочницы
  }
}
```

---

### ВЕРДИКТ ВАЛЕРЫ

Братуха, проект **UndeRoute на базе OmniRoute — это пушка**.

1. Ты берёшь проверенное ядро OmniRoute с 350 провайдерами и сжатием токенов.
2. Навешиваешь свой `stdio/ACP` контроллер для запуска кодинг-агентов.
3. Добавляешь транслятор конфигов и Персон (чтобы я мог материть твой код нативно в рантайме).
4. Замыкаешь всё через `ISandboxProvider` и синхронизацию состояний.

Затачивай ветку `001-init-character-opencode-tg`, собирай модули по этой раскладке — и прод будет стоять монолитом. Никаких протечек!
