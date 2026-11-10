# Feature Specification: Safe Harness Valves (G1–G8)

> "Какое ТЗ — такое и ХЗ." — Folk Wisdom
> "Обувать пизду в лапти." — Народная мудрость о художественном пиздеже вместо ТЗ
> "Why don't you explain this to me like I'm five." — Майкл Скотт (_The Office_)
> "Well, I didn't realize you had documentation." — Бабуленька (_Young Sheldon_)

**Feature Branch**: `specs/004-safe-harness-valves` (UndeRoute, ветка планирования, Principle IX)
**Created**: 2026-11-10
**Revised**: 2026-11-10 (rev 2: clarify — Q1–Q5 resolved, см. Clarifications & Resolution Log)
**Status**: Draft
**Input**: Ресерч [ZCode_VibeCoding-Failures-Safe-Harness-Design_20261110-2223.md](../../../../../undreplans/docs/projects/underoute/researches/ZCode_VibeCoding-Failures-Safe-Harness-Design_20261110-2223.md) §7–§8 — 13 failure modes вайбкодинга (L1/L2: arXiv 2507.09089, 2606.23130, 2406.10279; CVE-2025-32711/6514/53773; Replit/SaaStr 2025-07-18) и проект харнеса из 12 клапанов. Эта спека реализует **Ряд 1 + Ряд 2** (G1–G8); G9–G12 — отдельные спеки.

**Prerequisites**: business-plan UPDATE v3.0 → v3.1 (Principle VII-B.2, канон — `undreplans/docs/projects/underoute/business-plan.md`); замечания к конституции §"Constitution 1.9.0 amendment" (см. ресерч §8).

---

## Scope Boundary (relation to 001-init)

| 001-init артефакт                                               | Статус (речек 2026-11-10)                                                      | Действие в 004                                                                                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| T000c audit-logger (`src/core/db/audit-logger.ts:3-22`)         | in-memory + console.log, SQLite-схема не используется                          | **Supersedes**: FR-003 переписывает на персистенцию                                                                |
| T000f sandbox-тесты (`tests/security/sandbox.test.ts:4-15`)     | таутологии (литерал 512 = 512)                                                 | **Supersedes**: FR-001 + SC-001 требуют негативные тесты                                                           |
| FR-002 sandbox (`spec.md:19,43-55`)                             | частично: `container-sandbox.ts` без seccomp, без read-only rootfs, nsjail нет | **Extends**: FR-001 достраивает эшелон                                                                             |
| ADR-002 (`plan.md:22`) cap-drop/ro-rootfs/network-off           | частично реализовано                                                           | Реализация ADR-002 завершается здесь                                                                               |
| State machine PLAN/ACT (`src/core/agent/state-machine.ts:3-14`) | работает                                                                       | **Extends**: деструктив-апрув в ACT через `AWAITING_TOOL_APPROVAL` (алиас `AWAITING_DESTRUCTIVE_APPROVAL`, FR-005) |
| `docs/threat-model.md` v1.0                                     | описывает nsjail, которого нет                                                 | Обновляется в плане (T-plan)                                                                                       |

**Out of scope (следующие спеки, фикс. порядок)**: G9 untrusted quarantine (блокирует MVP-2 — TG relay без него = lethal trifecta в продукте), G10 artifact-verification UI, G11 protocol-first расширения, G12 handoff/forensics-отчёты.

---

## Терминология

- **Клапан (Valve)** — детерминированный механизм контроля исполнения агента (код+конфиг, не промпт). Клапан не доверяет модели и не читает её самопризнания.
- **Fail-closed** — недоступность/ошибка клапана блокирует действие, а не пропускает его.
- **Гейт-решение (GateDecision)** — результат клапана над одним действием: `allow | block | needs_approval`, reasonCode, ссылка на политику.
- **Чекпоинт (Checkpoint)** — снапшот рабочего дерева перед записью; идентификатор, восстанавливаемый одной операцией.
- **VerifyRun** — прогон верификации проекта (lint + typecheck + test по конфигу) с артефактом: команда, exit code, усечённый вывод/хеш, ts.
- **Деструктивная операция** — действие, совпавшее с deny-листом политики FR-005.
- **Human input channel** — единственный источник подтверждений: UI/терминал/hook-ответ человека. Текст, сгенерированный моделью, каналом не является.
- **Артефакт-доказательство** — запись в аудите (команда, exit code, хеш вывода, ts), а не текстовое утверждение модели.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Песочница доведена до эшелона (Priority: P1) 🎯 MVP

Разработчик запускает агентную задачу в ACT. Каждый shell-вызов исполняется в контейнере с read-only rootfs, подключённым seccomp-профилем (default-deny allowlist `sandbox/seccomp.json`), cap-drop ALL, без сети, лимитами 512MB/1cpu/pids 64 (уже есть в `container-sandbox.ts:20-28`). Запись возможна только в явные tmpfs-writedirs (workspace + временные каталоги).

**Why this priority**: закрывает FM-4/FM-11 (slopsquatting, agent-RCE CVE-2025-53773); это ядро Security Core, обещанного бизнес-планом MVP-1 ($0 FOSS) — без него декларация о zero-trust есть воздух.

**Independent Test**: фикстура git-репо + задача «создать файл и запустить тест». После прогона `docker inspect` контейнера прогона показывает: `ReadonlyRootfs=true`, `CapDrop=["ALL"]`, `Memory=536870912`, `NanoCpus=1000000000`, `PidsLimit=64`, `NetworkMode=none`, `SecurityOpt` содержит `seccomp=<abs-path>`. Негативные попытки (запись вне writedirs, syscall вне allowlist, mount `/etc`) — отклонены и залогированы.

**Acceptance Scenarios**:

1. **Given** политика по умолчанию, **When** задача исполняет `sh -c 'touch /etc/pwned'`, **Then** операция отклонена (read-only rootfs), агент получает структурированную ошибку, в аудит записано событие блокировки.
2. **Given** `sandbox/seccomp.json` удалён или битый, **When** старт прогона, **Then** исполнение не стартует (fail-closed): ошибка конфигурации, событие `startup_refused` в аудите. Никакого fallback-режима «на хосте» не существует.
3. **Given** задача пытается смонтировать host-путь вне allowlist (например `/etc`), **When** старт контейнера, **Then** mount отклонён, событие в аудите, прогон продолжается без mount (если это не была единственная цель) или завершается с явной ошибкой.

---

### User Story 2 — Чекпоинт перед каждой записью и откат (Priority: P1) 🎯 MVP

Перед каждым изменением рабочего дерева создаётся чекпоинт; одним действием рабочее дерево откатывается к любому чекпоинту сессии. Для каталога вне git исполнение по умолчанию отказано (fail-closed).

**Why this priority**: закрывает FM-7 (Replit удалил прод-БД — откат был обещан CEO как однострочная кнопка; здесь откат — первоклассная операция). UX-принцип ресерча: «откат как первая кнопка».

**Independent Test**: фикстура с 2 коммитами; агент изменяет 3 файла и создаёт 1. Откат к чекпоинту N восстанавливает байт-в-байт состояние на момент N (включая удаление созданного файла). В non-git каталоге старт отказан; явный per-session override стартует, но каждая запись помечена `unprotected` в аудите.

**Acceptance Scenarios**:

1. **Given** сессия с 4 записями, **When** выполняется откат к чекпоинту 2, **Then** `diff` рабочего дерева с состоянием чекпоинта 2 пуст; в аудите `checkpoint_created` ×4 и `rollback_performed` с ссылкой на чекпоинт.
2. **Given** каталог не git-репозиторий, **When** старт сессии, **Then** отказ с подсказкой; с `--allow-no-checkpoint` — старт, каждая запись аудируется как `unprotected=true`.
3. **Given** пользователь изменил файлы вручную после чекпоинта 2, **When** откат к чекпоинту 2, **Then** требуется явное подтверждение перезаписи (diff показан); молчаливой потери пользовательских правок не существует.

---

### User Story 3 — Персистентный аудит (Priority: P1) 🎯 MVP

Каждое гейт-решение, вызов тулов, чекпоинт, VerifyRun и подтверждение человека пишутся в SQLite (`audit_events`, схема уже в `src/core/db/schema.ts:49-92`) синхронно до продолжения исполнения. Аудит читается после перезапуска процесса.

**Why this priority**: FM-1/FM-13 (self-deception, verification burden) — in-memory аудит «переживёт» только удачную сессию; форензика начинается после инцидента, когда процесс уже умер.

**Independent Test**: прогон задачи → перезапуск процесса → запрос аудита возвращает полную цепочку событий с монотонными id. Файл БД повреждён → новые сессии не стартуют (fail-closed).

**Acceptance Scenarios**:

1. **Given** прогон с 2 гейт-решениями и 1 VerifyRun, **When** процесс перезапущен и аудит запрошен по sessionId, **Then** все события в порядке id; поля включают ts, type, decision, reasonCode, artifactHash; секреты и PII замаскированы (FR-006).
2. **Given** БД временно недоступна (блокировка другой сессией), **When** новая запись, **Then** retry с бэкоффом; недоступность дольше таймаута — исполнение паузится, не продолжается без аудита.
3. **Given** БД повреждена, **When** старт новой сессии, **Then** отказ (fail-closed) с forensic-подсказкой (путь файла, ожидание ручного вмешательства). Тихая деградация «пишем в console.log» запрещена.

---

### User Story 4 — Гейт верификации: «no test run = no done» (Priority: P2)

Завершение задачи (переход из ACT в done) невозможно без VerifyRun с вердиктом `GREEN` или явным `SKIPPED` (только если в проекте нет конфига верификации). SKIPPED ≠ PASSED: в аудите и UI это разные вердикты. Красный/таймаут вернут исполнение в ACT с контекстом ошибки.

**Why this priority**: FM-1/FM-2/FM-13; прямое лечебное средство против болезни 001-init (4 фиктивных задачи `[x]`) — то, что конституция сегодня не ловит вообще.

**Independent Test**: фикстура с падающим тестом: правка кода → verify красный → completion блокирован, состояние ACT, в контекст возвращён вывод; после фикса — зелёный → done. Проект без verify-конфига → SKIPPED с reason.

**Acceptance Scenarios**:

1. **Given** тест падает, **When** модель заявляет done текстом, **Then** state machine не выходит из ACT; попытка аудируется как `completion_blocked`; текст-самопризнание модели не является артефактом-доказательством.
2. **Given** в проекте нет ни одной verify-команды, **When** done, **Then** VerifyRun=`SKIPPED` (reason `no_verify_config`), done разрешён, пометка SKIPPED видна в UI и аудите.
3. **Given** verify-команда превышает таймаут конфига, **When** таймаут, **Then** VerifyRun=`TIMEOUT`, completion блокирован как при красном.

---

### User Story 5 — Гейт деструктивных операций (Priority: P2)

Действия из deny-листа политики (`rm -rf` вне workspace, `git push --force`, `DROP`/`TRUNCATE`/`DETACH DATABASE`, форматирование дисков, чтение `.env*`/секретных путей) блокируются до явного подтверждения через human input channel. Подтверждение — one-shot на точную команду (по хешу).

**Why this priority**: FM-7/FM-11. State machine уже запрещает деструктив в PLAN — FR-005 переносит ту же дисциплину в ACT с точечным апрувом вместо полного запрета.

**Independent Test**: фикстура с задачей, промпт которой провоцирует `rm -rf /tmp/demo` вне workspace: команда не исполняется, состояние `AWAITING_DESTRUCTIVE_APPROVAL`, после подтверждения человека — исполнение ровно этой команды; повторный вызов — снова подтверждение.

**Acceptance Scenarios**:

1. **Given** deny-лист-матч, **When** PreToolUse, **Then** block + аудит + `AWAITING_DESTRUCTIVE_APPROVAL`; попытка модели «подтвердить» самой (текст/функциональный вызов от агента) отклоняется — источник проверяется state machine.
2. **Given** подтверждение человека, **When** та же команда вызвана повторно, **Then** one-shot: второй вызов требует нового подтверждения (кеш апрува расходуется одним использованием).
3. **Given** benign паттерн (например `rm -rf node_modules` внутри workspace), **When** политика default, **Then** не блокируется; deny-лист и allowlist версионируются, любое изменение политики аудируется (FR-008).

---

### User Story 6 — Гейт зависимостей (Priority: P3)

Добавление новой зависимости в манифест (package.json / pyproject.toml) требует явного DependencyDecision человека (`approve`, `approve+pin`, `deny`) до запуска install. Решение персистится; оффлайн — решение помечается `unverified_registry`.

**Why this priority**: FM-4/FM-5 (slopsquatting arXiv 2406.10279: 5.2%/21.7% сэмплов с выдуманными пакетами, 205,474 повторяемых имён; Shai-Hulud — CISA 2025-09-23). Модель выбирает имена пакетов предсказуемо — гейт ставит человека между фантазией и реестром.

**Independent Test**: задача добавляет несуществующий/подозрительный пакет → install блокирован до решения; `approve+pin` разрешает только pin-версию; все решения в аудите.

**Acceptance Scenarios**:

1. **Given** правка манифеста с новым пакетом, **When** попытка install, **Then** блок до DependencyDecision; в оффлайне решение создаётся с `unverified_registry=true`.
2. **Given** decision `approve+pin` на версию X, **When** install, **Then** только X; расхождение с pin — блок и аудит.
3. **Given** decision `deny`, **When** агент повторно правит манифест под тот же пакет, **Then** повторная правка также требует нового решения (deny не «сгорает» по правкам).

---

### Edge Cases

- **Docker недоступен**: исполнение отказано с сообщением; «прямой» режим на хосте в MVP-1 не существует (fail-closed).
- **Verify-тулулинг отсутствует** (не репозиторий кода): VerifyRun=`SKIPPED` с reason; подмена SKIPPED на GREEN запрещена (конституция XII: SKIPPED ≠ PASSED).
- **Параллельные сессии**: чекпоинты и апрувы скоупятся по sessionId; аудит — WAL; коллизия отката решается подтверждением (US2.3).
- **Огромный репозиторий**: чекпоинт через git (`stash create` / shadow-ref) — O(1); retention-лимит ротации (по умолчанию 50 на сессию).
- **Ложные срабатывания deny-листа**: allowlist-исключения + точечный one-shot апрув; tuning — только через версионируемую политику с аудитом.
- **Модель имитирует человека**: текст «user approved» в выводе агента не принимается — state machine проверяет источник события (human input channel), негативный тест обязателен (SC-005).
- **Отключение клапана**: любой клапан выключается только явной записью в конфиг; отключение фиксируется в аудите (`valve_disabled`) и подсвечивается в UI. Молчаливого bypass не существует.
- **Аудит содержит фрагменты кода**: маскирование секретов до записи (FR-006); хеши вместо сырых значений там, где достаточно.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001 (Sandbox Enforcement, G2)**: `container-sandbox.ts` MUST запускать контейнер с `--read-only` + tmpfs-writedirs (workspace, временные каталоги) и MUST подключать `sandbox/seccomp.json` (default-deny allowlist) через `--security-opt seccomp=...`. Отсутствие/битость профиля → отказ старта (fail-closed). Mount host-путей вне allowlist запрещён. Всё доказывается `docker inspect`-проверкой в тестах (SC-001).
- **FR-002 (Checkpoints, G4)**: перед каждым write-действием MUST создаваться чекпоинт (git shadow-ref/stash-create; идентификатор в аудите). Non-git рабочее дерево → отказ старта, кроме явного per-session `--allow-no-checkpoint` (каждая запись `unprotected=true` в аудите). Откат — одна операция к любому чекпоинту сессии; конфликт с пользовательскими правками требует подтверждения. Retention — ротация по лимиту конфига.
- **FR-003 (Persistent Audit, G5)**: audit-logger MUST персистить каждое событие (GateDecision, tool call, checkpoint, VerifyRun, human approval, valve config change) в SQLite synchronously до продолжения (WAL). Чтение после перезапуска MUST возвращать полную цепочку по sessionId с монотонными id. Повреждение БД → отказ новых сессий (fail-closed). Поверхность запроса аудита — read-only HTTP endpoint приложения (`/api/audit?sessionId=…`); MCP-тул в underboard и CLI-обёртка отложены в G11 (Q1 resolved).<!-- Drift note: 2026-11-10 — Q1 resolved в clarify rev 2 -->
- **FR-004 (Verification Gates, G6)**: state machine MUST блокировать переход ACT→done без VerifyRun вердикта `GREEN` или `SKIPPED(no_verify_config)`. `RED`/`TIMEOUT` возвращают в ACT с контекстом ошибки. VerifyRun персистится как артефакт (команда, exit code, усечённый вывод/хеш, ts). Самопризнание модели доказательством не является.
- **FR-005 (Destructive-Op Gate, G1)**: deny-лист (версионируемая политика) оценивается ДО исполнения действия. Матч → block + аудит + состояние `AWAITING_TOOL_APPROVAL` (семантический алиас «деструктив-апрув»: `state-machine.ts:65-70` уже даёт нужные переходы при `isDestructive=true`; новое состояние не вводится). Подтверждение — только через human input channel, one-shot по хешу команды. Повторное срабатывание требует нового подтверждения.<!-- Drift note: 2026-11-10 — clarify rev 2: переиспользуем существующее состояние вместо нового -->
- **FR-006 (Secret & Prod-Cred Guard, G7)**: чтение `.env*`, секретных путей и переменных окружения из deny-листа (включая prod-креды) — блокируется и аудируется. Всё, что попадает в аудит, маскируется до записи. Pre-commit secret scan: блок коммита + отчёт. Удаление prod-кредов из сессии: env-переменные из deny-листа не пробрасываются в агентный контекст.
- **FR-007 (Dependency Gate, G8)**: правка манифеста, добавляющая зависимость, MUST требовать DependencyDecision до install (approve / approve+pin / deny; персистится). Оффлайн — `unverified_registry=true`. Расхождение с pin → блок.
- **FR-008 (Valve Policy & Override)**: все клапаны G1–G8 individually отключаемы ТОЛЬКО явной записью в конфиг; каждое включение/выключение/изменение политики — версионируемое событие в аудите (`valve_config_change`). Обход гейта (`--override-gate`-аналог) — с reason, логируется в аудит (зеркало Principle VI). Default-политика при свежей установке — все клапаны включены (fail-closed, SC-007).

---

### Non-Functional Requirements (NFR) _(ISO/IEC/IEEE 29148:2018)_

- **NFR-001 (Latency)**: гейт-решение (FR-005/006/007) — p95 < 50 мс, p99 < 100 мс локально; чекпоинт — p95 < 500 мс на репо ≤ 10k файлов. Измерение: бенч-джоб (3 прогрева, 30 прогонов) на `ubuntu-latest`; Linux блокирует релиз, Windows с бюджетом ×2 — не блокирует.
- **NFR-002 (Determinism)**: одинаковые входы (действие, политика, состояние) дают одинаковые GateDecision и reasonCode. В аудите ts допустим и не входит в сравнение.
- **NFR-003 (Fail-Closed)**: отсутствие, ошибка или недоступность любого клапана блокирует действие, а не пропускает. Fresh install — strictest defaults.
- **NFR-004 (Offline)**: все клапаны работают без сети; единственная сетевая операция — опциональная проверка реестра в FR-007, её отсутствие деградирует в `unverified_registry`, не в блок функциональности.
- **NFR-005 (Overhead Budget)**: суммарный оверхед клапанов ≤ 5% wall-clock типовой задачи (медиана по бенч-набору из 10 задач); измеримо, порог — Kill Criteria.

---

### Regulatory & Compliance Screening _(ISO/IEC/IEEE 12207 Phase 0)_

- **Jurisdictions**: N/A (local-first, обработка данных пользователя без передачи третьим лицам; cloud-слои — вне скоупа MVP-1).
- **Data Classification**: Confidential — аудит содержит фрагменты кода и пути; маскирование секретов до записи (FR-006). Данные не покидают машину (NetworkMode=none).
- **Compliance Scope Reduction**: всё исполнение в изолированном контейнере без сети; аудит локален — продукт вне CDE/аудируемого периметра по дизайну.
- **Kill Criteria (Falsifiability)**: через 30 дней после релиза — (a) если оверхед клапанов > 15% wall-clock на эталонных задачах, ИЛИ (b) ≥ 20% сессий явно отключили ≥ 1 клапан (по FR-008-аудиту), ИЛИ (c) ≥ 10 ложных блокировок benign-операций на 100 задач — политика deny-листов пересматривается, виновный клапан переводится в режим «audit-only» с явной пометкой в release notes. **В режим audit-only переводится не более одного клапана; G2/G3/G4/G5 (песочница, план, чекпоинт, аудит) disable-able в принципе не являются.**
- **Business plan**: UPDATE v3.0 → v3.1 — обязательный prerequisite (Principle VII-B.2): клапаны G1–G8 = декомпозиция Security Core для EB-2 NIW Prong 1/2; канон ведётся в `undreplans/docs/projects/underoute/business-plan.md` (см. замечание C4 к конституции о внешнем каноне).

---

### Security & Threat Mitigation (STRIDE) _(NIST SP 800-218 SSDF)_

- **Spoofing**: подтверждение только через human input channel; state machine проверяет источник события; модель не может само-апрувить (негативный тест SC-005). Решения связываются sessionId + хешем команды.
- **Tampering**: аудит append-only (нет UPDATE/DELETE); изменения политики версионируются и аудируются (`valve_config_change`); policy-файл читается как данные, не исполняется (урок CVE-2025-6514: никаких eval на внешних файлах).
- **Repudiation**: каждое событие — ts, actor (`model | human | policy`), decision, reasonCode, artifactHash. Форензика после инцидента восстанавливает цепочку (US3.1).
- **Information Disclosure**: deny чтения секретов; маскирование до записи в аудит; хеши вместо сырых значений; NetworkMode=none — эксфильтрация из контейнера каналом не имеет (антидот EchoLeak CVE-2025-32711 в рамках сессии).
- **Denial of Service**: pids-limit 64 (есть), ротация чекпоинтов, лимит размера audit DB + ротация; бэкофф при блокировке БД, пауза вместо бесконечного retry.
- **Elevation of Privilege**: cap-drop ALL, no net, read-only rootfs; human approval расширяет перечень разрешённых команд, но не песочницу; sandbox-флаги не конфигурируемы из промпта/модели.

---

### Key Entities _(include if feature involves data)_

- **ValvePolicy**: версионируемая конфигурация клапанов (deny-list, allowlist, лимиты, включённость); изменения — события аудита.
- **GateDecision**: результат клапана над действием: verdict, reasonCode, policyVersion, actor.
- **Checkpoint**: идентификатор снапшота, sessionId, ts, метаданные (число файлов); за ним — git-объект.
- **AuditEvent**: монотонный id, ts, type, sessionId, actor, decision, reasonCode, artifactHash; append-only.
- **VerifyRun**: вердикт (GREEN/RED/TIMEOUT/SKIPPED), команды, exit codes, усечённый вывод/хеш, ts.
- **DependencyDecision**: пакет, версия/pin, verdict (approve/deny), unverifiedRegistry, ts.
- **DestructiveApproval**: хеш команды, sessionId, one-shot маркер, ts, actor=human.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: `docker inspect` контейнера прогона доказывает все флаги FR-001; негативные тесты (запись вне writedirs, syscall вне allowlist, mount `/etc`, удалённый/битый seccomp) — заблокированы и залогированы. Тесты замещают таутологии T000f байт-в-байт новой номенклатурой.
- **SC-002**: откат к чекпоинту N восстанавливает байт-в-байт состояние; unprotected-режим аудируется; конфликт с правками пользователя требует подтверждения.
- **SC-003**: аудит переживает перезапуск; запрос по sessionId возвращает полную цепочку; повреждение БД отказывает новые сессии (fail-closed).
- **SC-004**: unit-тест state machine: completion без GREEN/SKIPPED-VerifyRun невозможен; модель-самопризнание не проходит.
- **SC-005**: деструктив: block + аудит + one-shot approval; само-апрув модели отклонён (негативный тест); повторный вызов требует нового подтверждения.
- **SC-006**: новая зависимость без DependencyDecision не устанавливается; оффлайн помечает `unverified_registry`; pin соблюдается.
- **SC-007**: fresh install — все клапаны включены; отключение любого — только через config + `valve_config_change` в аудите; G2/G3/G4/G5 не disable-able (Kill Criteria).
- **SC-008**: golden-тест benign-задач из 001 (законные операции) не сломан: ложных блокировок 0 на эталонном наборе; оверхед ≤ 5% (NFR-005).

---

## Clarifications & Resolution Log (Phase 2 Clarify)

- **Q0 (2026-11-10, specify)**: скоуп = Ряд 1 (G2, G4, G5, G6) + Ряд 2 (G1, G7, G8) из ресерча §7.3; G3 (plan/act) уже существует и расширяется FR-005; G9–G12 — вне (следующие спеки; G9 блокирует MVP-2). Спека создана по итогам речека спек (§2 ресерча): 4 фиктивных элемента 001-init лечатся внутри FR-001/FR-003/SC-001.
- **Q1 (audit surface) — Resolved (rev 2)**: поверхность запроса аудита — read-only HTTP endpoint приложения (`/api/audit?sessionId=…`, GET, поверх существующей локальной auth-обвязки). MCP-тул в underboard и CLI-обёртка отложены в G11 (protocol-first). Обоснование: underboard держит собственную БД (FTS5), аудит живёт в основной БД приложения — отдельный мост без выгоды.
- **Q2 (checkpoint retention) — Resolved (rev 2)**: retention — 50 чекпоинтов на сессию (ротация FIFO), квота хранилища 500 МБ на сессию (ротация по возрасту); оба — конфигурируемы в ValvePolicy.
- **Q3 (verify timeout) — Resolved (rev 2)**: дефолт таймаута VerifyRun — 600 с на команду; per-project override — конфиг верификации (verify-секция ValvePolicy / `.undroute/verify.json`). Не влияет на NFR-001.
- **Q4 (dependency strictness) — Resolved (rev 2)**: unpinned install после approve → **block** (не warn): FM-5 (Shai-Hulud, CISA 2025-09-23) — supply-chain компрометация дороже трения; pin обязателен, отклонение от pin = block + аудит.
- **Q5 (rollback UX) — Resolved (rev 2)**: откат — API-экшн сессии (`POST /api/sessions/:id/rollback`, body `{ checkpointId }` или `{ last: true }`) + CLI-подкоманда `omniroute rollback --session <id> --to <id|last>`; UI-кнопка в шапке существующей session UI (минимальный вариант, отдельная задача в tasks).

> Решения Q1–Q5 закреплены как рекомендованные ZCode по ресерчу (forensic dossier 2026-11-10); veto владельца возможен до `/speckit.plan` — после плана смена решения оформляется drift note (Principle IX) + rev bump.
