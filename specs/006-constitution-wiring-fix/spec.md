# Feature Specification: Constitution Wiring Fix (enforcement truth + routing canon в собственном AI-контуре репо)

> "Какое ТЗ — такое и ХЗ." — Folk Wisdom
> "Обувать пизду в лапти." — Народная мудрость о художественном пиздеже вместо ТЗ
> "Well, I didn't realize you had documentation." — Бабуленька (_Young Sheldon_)

**Feature Branch**: `specs/006-constitution-wiring-fix` (UndeRoute, ветка планирования, Principle IX)
**Created**: 2026-11-15
**Status**: Draft (clarified 2026-11-15: Q1–Q8 решены владельцем; перед requirements-audit)
**Input**: форензик-аудит 2026-11-15 (запрос владельца: «точно ли конституция полна, соответствует best practices для полного ведения бизнеса и разработки, и чтобы ИИ дёргал нужных агентов/скиллы/команды»); 11 находок уровня L1A (каждая проверена ls/grep по файлам репо, ноль домыслов). Решение владельца 2026-11-15 — фикс обвязки идёт отдельной chore-спекой 006, НЕ внутри 005.

**Prerequisites**: нет жёстких. Консьюмит constitution v1.9.0 (base `main` = `7c2a5d463a`). Не зависит от 004/005: все изменения — `.md`/`.json`/`.sh` конфиги собственного AI-контура. Пересечение с 005 — только слово «routing»: 005 = продуктовый capability-слой инжекции скиллов в рантайме харнеса; 006 = всегда-on документация и enforcement-обвязка самого репо. Общих файлов нет.

---

## Scope Boundary

| Граница | Решение |
| --- | --- |
| vs 005-agent-skill-routing | 005 — продуктовая фича (discovery/injection рантайма, консьюмит valves 004). 006 не трогает `src/`, 005 не трогает AGENTS.md/commands. Ноль пересечения файлов |
| vs constitution v1.9.1 | 006 — носитель amend'а v1.9.1 (Governance §2: amend = commit, трогающий constitution.md + зависимые `.claude/` файлы одним коммитом; спека документирует связность) |
| vs Principle VII-B | chore-only: ноль коммерческой поверхности → `business-plan-waiver.md` приложен (VII-B.5) |
| vs Principle XII контур | `test-design` + `qa-signoff` waived (`qa/waiver.md`): ноль runtime-поверхности, AC grep-исполнимы; `requirements-audit` + `analyze` остаются гейтами |

---

## User Scenarios & Testing

### User Story 1 - Enforcement Truth: заявленные гейты реально исполняются (Priority: P1)

ИИ-сессия запускает `/speckit.analyze` → анализ реально проверяет RTM-покрытие и evidence-backed `[x]` (Principle XII), как декларирует конституция. ИИ-сессия в репо открывает AGENTS.md (always-on слой) и видит карту Intent Routing + правило приоритета конституции. XII-стадии успешно тегируются скриптом.

**Why this priority**: главный засор аудита — enforcement-контракт декларирован и не подключён. Analyze — первый гейт перед implement: лживый analyze = лживый гейт. Сломанный snapshot-stage для XII-стадий — единственная находка, которая валит команду с exit 2 в рантайме.

**Independent Test**: grep/командные проверки из AC + прогон `/speckit.analyze` на самой спеке 006 (самоприменимость).

**Acceptance Scenarios**:

1. **Given** `speckit.analyze.md`, **When** grep `RTM` и `Evidence-Backed`, **Then** оба маркера найдены, формулировки ссылаются на constitution §XII.
2. **Given** AGENTS.md, **When** grep `## Intent Routing` и ссылки на конституцию, **Then** секция и канон-блок найдены, precedence-правило присутствует.
3. **Given** `snapshot-stage.sh`, **When** вызвать с `requirements-audit` / `test-design` / `qa-signoff`, **Then** exit 0 и тег создан (сегодня: exit 2, case-валидация `snapshot-stage.sh:25-27` при том что `speckit.requirements-audit.md:125`, `speckit.test-design.md:136`, `speckit.qa-signoff.md:98` вызывают именно эти имена).

---

### User Story 2 - Documentation Truth: файлы перестают врать (Priority: P2)

v1.9.1 amendment чинит заметку про хуки; dispatch.md и CLAUDE.md теряют битые ссылки; IX-claim согласован с реальностью CI.

**Why this priority**: ложь в always-on доках направляет каждую сессию по битым путям; противоречие «hooks inactive here» против git-реальности подрывает доверие ко всему governance-доку.

**Independent Test**: 6 grep-проверок dangling-ссылок.

**Acceptance Scenarios**:

1. **Given** constitution.md, **When** читать адаптационную заметку (строка 5), **Then** утверждает: hooks активны с 2026-08-14 (`f4c87e9099`), `.claude/` dual role; changelog-запись 1.9.1 существует.
2. **Given** dispatch.md, **When** каждый `/ref` матчится против `.claude/commands/`, **Then** ноль dangling.
3. **Given** CLAUDE.md, **When** каждый путь/skill-реф матчится против файловой системы, **Then** ноль dangling.

---

### User Story 3 - Completeness & Hygiene (Priority: P3)

Principle XIV (Stage Checklists) привязывает 9 готовых чеклистов к гейтам; гигиена: knowledge/patterns bootstrap, dialog-capture, `.gemini` target, Principle V dual-role note.

**Why this priority**: не блокирует пайплайн, но дёшево закрывает разрыв «полного ведения бизнеса» (ops/compliance/accessibility чеклисты уже написаны и не привязаны ни к чему).

**Independent Test**: constitution содержит XIV + перечень чеклистов; каждый решённый Q закрывает соответствующий dangling.

**Acceptance Scenarios**:

1. **Given** constitution.md, **When** grep `XIV`, **Then** принцип Stage Checklists существует, 9 чеклистов перечислены, plan/qa-signoff командам предписан шаг прогона.
2. **Given** `knowledge/patterns/`, **When** ls, **Then** директория + INDEX.md существуют.

---

### Edge Cases

- **Amend-рекурсия**: 006 подчинена конституции, которую меняет. Правило: спека не редактирует constitution.md до стадии implement; amend выполняется одним коммитом по Governance §2 (constitution + зависимые `.claude/` файлы), спека фиксирует связность.
- **Precedence-конфликт**: если AGENTS.md Hard Rules противоречат конституции в процессном вопросе, применяется формула FR-002c; если и она не снимает конфликт — это дефект спеки, а не повод для тихого игнора (Governance §5).
- **Q1a-исключение**: единственный случай кода в этой спеке — новый CI workflow при выборе (a) в Q1; тогда STRIDE-условие (pinned actions, least privileges) обязательно и проверяется analyze.

---

## Requirements

### Functional Requirements

**Группа A — Enforcement Truth (P1)**

- **FR-001 (Analyze XII enforcement)**: `.claude/commands/speckit.analyze.md` MUST: (a) в §2 Load Artifacts добавить загрузку `requirements-audit.md` и `qa/{rtm-matrix,preliminary-rtm,waiver}.md` (сегодня грузятся только spec/plan/tasks/constitution/bizplan); (b) включить чек RTM coverage — каждый FR/NFR трейсится в ≥1 TC; Risk ≥ 20 → Decision Table + State Transition + Exploratory Charter + UAT (verbatim constitution.md:167) — с оговоркой waiver-пути: при наличии `qa/waiver.md` (test-design waived) покрытие проверяется по `qa/preliminary-rtm.md` (каждый FR/NFR → ≥1 исполняемый AC), иначе гейт ложно CRITICAL на chore-спеках; (c) включить Evidence-Backed Completion XII.4 — `[x]` без inline evidence (`path:line`, test ID, command output path) = CRITICAL finding, reopen task (constitution.md:172); поиск строго по строкам задач `- \[[xX]\] T\d+` (регистронезависимо), исключая шаблонные чекбоксы Self-Validation Checklist. Сегодня: grep `RTM|Evidence-Backed|XII` по файлу = 0 попаданий. AC: оба маркера в файле; §2 грузит qa-артефакты; waiver-оговорка и regex-скоуп присутствуют; формулировки цитируют §XII.

- **FR-002 (Intent Routing canon)**: AGENTS.md получает: (a) `## Intent Routing` — таблица utterance→command, источник правды (intent-hint.sh и dispatch.md синхронизируются с ней — T007/T010; маршруты: repair: `/fix-tests`, `/fix-ci`, `/fix-types`, `/resolve-conflicts`; investigation: spawn `debugger` + `systematic-debugging`; spec/implement: `/speckit.start` → пайплайн; session-end: `/improve`; brainstorm: `/speckit.brainstorm`; release: `/speckit.bump`); (b) канон-блок ≤ 10 строк: путь конституции, что она гейтит, `/dispatch`, two-phase Principle IX одной строкой; (c) precedence-правило: «конституция приоритетна в процессных вопросах (гейты, стадии, артефакты, версии, теги); AGENTS.md приоритетен в продуктовых конвенциях кода; прямой конфликт процессных правил решает конституция»; (d) `.claude/hooks/intent-hint.sh` — все ссылки на CLAUDE.md и битые команды: комментарий `:10` меняется с «mirror the Intent Routing table in CLAUDE.md» на «mirror AGENTS.md §Intent Routing»; runtime-строка `:112` (CONTEXT, инжектируется в сессию) — «matching CLAUDE.md table» → «matching AGENTS.md § Intent Routing»; подсказки `:63` `/brainstorm` → `/speckit.brainstorm` и `:95` `/bump` → `/speckit.bump` (существуют только speckit.* версии). Сегодня: AGENTS.md не упоминает конституцию, speckit или `/dispatch` ни разу (grep = 0). AC: grep `CLAUDE.md` по intent-hint.sh = 0; `AGENTS.md § Intent Routing` ≥ 2 попаданий (:10, :112); `/speckit.brainstorm` и `/speckit.bump` присутствуют; дельта AGENTS.md ≤ 60 строк.

- **FR-003 (Snapshot stage-list break)**: `.specify/scripts/bash/snapshot-stage.sh` (case-валидация, строки 25-27) расширяется именами `requirements-audit|test-design|qa-signoff`; `.specify/scripts/powershell/snapshot-stage.ps1` синхронно. Обратная совместимость: прежние имена работают. AC: `bash snapshot-stage.sh requirements-audit <slug>` exit 0 + тег; ditto `test-design`, `qa-signoff`.

**Группа B — Documentation Truth (P2)**

- **FR-004 (IX claim consistency)**: Q1 решён (2026-11-15, дефолт): вариант (b) — вычеркнуть «(via CI workflow)» из constitution.md:135, cleanup `specs/<slug>` веток остаётся ручным (`git branch -d` после merge). CI-workflow не создаётся. AC: фраза «via CI workflow» в constitution.md отсутствует; других упоминаний CI-автоклина нет.

- **FR-005 (v1.9.1 amendment)**: constitution.md:5 адаптационная заметка переписывается: Principle VIII hooks активны в этом репо с 2026-08-14 (settings.json + 7 hook-файлов в git, commit `f4c87e9099`), потому что `.claude/` здесь dual role (FR-011); запись 1.9.1 в Changelog; шестая правка бандла: constitution.md:97 (Principle VIII.1) — `CLAUDE.md §"Intent Routing"` → `AGENTS.md §"Intent Routing"` (согласовано с FR-002/NFR-005). AC: grep `1.9.1` > 0; «inactive here» = 0; grep `CLAUDE.md` по constitution.md = 0 (единственное упоминание было в VIII.1).

- **FR-006 (dispatch refs)**: `.claude/commands/dispatch.md`: (a) битые команды `/bump`→`/speckit.bump`, `/brainstorm`→`/speckit.brainstorm`, `/questions`→`/questions_ideas`; (b) адрес таблицы маршрутизации CLAUDE.md→AGENTS.md в строках `:2` (description), `:20` (Source of truth), `:70` (Updates go through normal CLAUDE.md edit), `:63` («Stop conditions still apply (CLAUDE.md)» → фактический дом стоп-условий, проверяется при implement). Сегодня: существуют только `speckit.bump.md`, `speckit.brainstorm.md`, `questions_ideas.md`; 4 ссылки на CLAUDE.md. AC: каждый `/name` из dispatch.md существует как `.claude/commands/<name>.md`; grep `CLAUDE.md` по dispatch.md = 0 (после перенаправления на фактические адресаты).

- **FR-007 (Base-green / sweep-reds / _tasks cleanup)**: Q3/Q4/Q5 решены (2026-11-15): (a) практика base-green отменена владельцем: файлы практики отсутствуют по активным путям (`.agents/skills/_shared/`, `.claude/skills/` — нет ни в репо, ни на 2 уровнях выше; апстрим-шаблоны `config/quality/skill-templates/{_shared/base-green.md,sweep-reds/SKILL.md}` — неактивный инвентарь под `check-skill-contract`, практикой не считаются) — удалить секцию «Base-green before opening PRs» из CLAUDE.md и секцию «### Base-green check (PRs must not be born red)» из AGENTS.md:571; (b) упоминание `/sweep-reds` уходит вместе с секцией (скилла нет в commands/skills, единственный потребитель — отменяемая секция); (c) выпилить из CLAUDE.md секцию «Superpowers / planning artifacts — path overrides» с таблицей `_tasks/...` путей; AGENTS.md `_*`-канон (Hard Rule #23, §Planning & Research Artifacts:261-268 и 482-493) НЕ трогается (приватный present-or-future канон владельца). AC: grep `base-green|sweep-reds` по CLAUDE.md + AGENTS.md = 0; grep `_tasks` по CLAUDE.md = 0; секция Base-green в AGENTS.md отсутствует.

**Группа C — Completeness & Hygiene (P3)**

- **FR-008 (Principle XIV Stage Checklists)**: constitution v1.9.1 получает Principle XIV: `/speckit.plan` Constitution Check и `/speckit.qa-signoff` MUST прогоняют применимые чеклисты `.specify/checklists/` — перечень 9: accessibility, api-contract, data-migration, i18n, operational-readiness, performance, regulatory-compliance, security, spike-governance; «применимость» определяет план (не все на каждую фичу). Синхронно `speckit.plan.md` + `speckit.qa-signoff.md` получают шаг перечня. Сегодня: чеклисты написаны, конституция не упоминает их ни разу (grep = 0), wiring только через опциональный `/speckit.checklist`. AC: constitution XIV section + оба command-файла ссылаются на перечень.

- **FR-009 (knowledge/patterns bootstrap)**: `knowledge/patterns/` создаётся с `INDEX.md` (status: empty, правило VIII). Сегодня: директории нет; на неё ссылаются `learn.md:14`, `improve.md`, `session-checkpoint.sh` (VIII dormant). AC: dir + INDEX.md существуют.

- **FR-010 (dialog-capture)**: Q2 решён (дефолт, 2026-11-15): удалить `.claude/hooks/dialog-capture.mjs`. Сегодня: 7-й hook-файл лежит незарегистрированным в settings.json (там 6 из 7). Осознанный побочный эффект (F6): `packages/cli/src/cli/dialog.ts:106-110` (`helpers dialog doctor`) проверяет existsSync этого файла — после удаления чек даст fail (exit 1); вычистка/депрекация `helpers dialog` в packages/ вне скоупа (NFR-003), кандидат в будущую спеку, эффект документирован (research D2). AC: файл отсутствует; settings.json без изменений.

- **FR-011 (Principle V dual-role note)**: constitution Principle V получает абзац: в UndeRoute `.claude/` dual role — собственный AI config + поставляемый шаблон `underoute-clai`; 60-day deletion rule применяется к consumer-инстансам, для template inventory критерий остаётся «referenced by any command/agent/skill in the shipped corpus». AC: grep `dual role` в constitution.md.

- **FR-012 (Operational doctrine)**: Q6 решён (дефолт, 2026-11-15): вариант (c) — принцип XV в v1.9.1 НЕ добавляется; ops-покрытие идёт через FR-008 (`.specify/checklists/operational-readiness.md` обязателен на `/speckit.qa-signoff` для фич с runtime-поверхностью). Full doctrine (NIST SP 800-61 incident response, DR/retention с RPO/RTO, FinOps LLM-спенда) — кандидат в отдельную спеку 007, 006 не блокирует. AC: constitution.md не содержит принципа XV; operational-readiness входит в XIV-перечень (FR-008).

- **FR-013 (.gemini target)**: Q7 решён (2026-11-15): N/A — Principle I (в amend v1.9.1) получает пометку: UndeRoute не генерирует `.gemini/` дерево (root-стаб GEMINI.md достаточен). Дерево не создаётся. AC: пометка N/A рядом с `.gemini/` в Principle I; `.gemini/` отсутствует.

### Non-Functional Requirements (ISO/IEC/IEEE 29148:2018)

- **NFR-001 (Token Budget)**: суммарная добавка в always-on слой (AGENTS.md) ≤ 60 строк; конституция ≤ 50 строк чистого прироста вне changelog; ноль новых always-on файлов.
- **NFR-002 (Verifiability)**: каждый FR имеет grep/командно-исполнимый AC; ноль проверок «на глаз».
- **NFR-003 (No runtime surface)**: ноль изменений под `src/`, `packages/`, `electron/`, `docker/`, `.github/workflows/` (Q1 решён в пользу правки текста, workflow не создаётся).
- **NFR-004 (Backward compat tooling)**: snapshot-stage скрипты принимают все прежние имена стадий; существующие теги валидны.
- **NFR-005 (Single source)**: Intent Routing таблица живёт ровно в одном always-on файле (AGENTS.md); хук остаётся дублирующим фильтром с комментарием-ссылкой; CLAUDE.md дубликатов не получает.

### Regulatory & Compliance Screening (ISO/IEC/IEEE 12207 Phase 0)

- **Jurisdictions**: N/A (Internal/Non-regulated).
- **Data Classification**: Internal (конфиги и документация; ноль PII/платежей).
- **Compliance Scope Reduction**: N/A.
- **Kill Criteria (Falsifiability)**: если на clarify выяснится, что ops-doctrine требует полноценной спеки (FR-012b), FR-012 уезжает в 007, 006 не раздувается и не блокируется.

### Security & Threat Mitigation (STRIDE)

- STRIDE: N/A (docs/config). Условие Q1a снято на clarify (2026-11-15): GHA workflow не создаётся (FR-004 вариант b); supply-chain правило (pinned actions, least privileges) остаётся в силе для будущих спек с workflow.

---

## Success Criteria

- **SC-001**: 6 grep-проверок dangling (dispatch refs, CLAUDE.md paths, intent-hint.sh comment, IX claim, hooks note, snapshot stage-list) зелёные; чек-лист оформлен в tasks.md.
- **SC-002**: `/speckit.analyze` на спеке 006 исполняется и находит собственные XII-проверки (самоприменимость гейта).
- **SC-003**: constitution v1.9.1: changelog-запись есть, заметка соответствует git-реальности (`f4c87e9099`), Governance §2 соблюдён (amend + зависимые файлы одним коммитом).
- **SC-004**: token budget: дельта AGENTS.md ≤ 60 строк, конституция ≤ 50 строк (NFR-001).
- **SC-005**: три XII-стадии тегируются скриптом без exit 2 (FR-003 AC прогнан).

---

## Clarifications

### Session 2026-11-15

- **Q1 → FR-004**: дефолт подтверждён — правка текста конституции, CI-workflow не создаётся.
- **Q2 → FR-010**: дефолт — `dialog-capture.mjs` удалить.
- **Q3 → FR-007**: практика base-green отменена владельцем (файл не существует): секции удаляются из CLAUDE.md и AGENTS.md:571.
- **Q4 → FR-007**: `/sweep-reds` — скилл расчистки накопленного красного состояния CI (red base tip + красные PR: перезапуск упавших проверок, закрытие мёртвых PR). Скилла в репо нет; единственный потребитель упоминания — отменяемая base-green секция → упоминание удаляется вместе с ней.
- **Q5 → FR-007**: таблица путей `_tasks/` выпиливается из CLAUDE.md; AGENTS.md `_*`-канон (Hard Rule #23, §Planning & Research Artifacts) не трогается.
- **Q6 → FR-012**: дефолт — ops-покрытие через operational-readiness чеклист (FR-008); принцип XV отложен до возможной спеки 007.
- **Q7 → FR-013**: `.gemini/` — N/A.
- **Q8 → FR-002c**: precedence-формула «конституция = процесс, AGENTS.md = код» подтверждена.

## Decision Log

- **Q0 (2026-11-15, specify)**: фикс-набор аудита идёт отдельной chore-спекой 006, не внутри 005 (005 — продуктовая capability; слоевая гигиена). VII-B.5 waiver приложен; XII контур частично waived (`qa/waiver.md`: test-design + qa-signoff), requirements-audit + analyze остаются. Base branch = локальный main `7c2a5d463a` (строго впереди origin/main на 60 коммитов, содержит v1.9.0 — проверено `git show`). Находка №11 (snapshot stage-list break) добавлена в спеку сверх аудита.
- **Session 2026-11-15 (clarify)**: Q1–Q8 решены владельцем (см. §Clarifications). FR-004/007/010/012/013 переписаны под решения, [NEEDS CLARIFICATION] снят. Все развилки закрыты до plan-стадии.
- **Round 2 (2026-11-16, review fix-pass)**: external review `reviews/antigravity.md` (verdict HIGH: 4H/3M/1L; артефакты v1 в main `bb2fbb1bae` и ветке `0fc4924e44`) принят по ноль-траст калибровке — все 8 findings подтверждены пруфами в репо (F1: sync/status требуют helpers-lock, корневых devDeps нет; F2: 4×CLAUDE.md refs + битые /brainstorm,/bump в intent-hint.sh:10/:63/:95/:112; F3: self-applicability гейта на chore-спеках и шаблонных чекбоксах; F4: фантомная §6 в architecture.md 46 строк; F5: преждевременный коммит в main — учтён через base-sha в T019; F6: dialog doctor exit 1; F7: шаблоны в config/quality/ + check:fabricated-docs; F8: nits). FR-001/002/005/006/007/010 расширены; amend-бандл = 6 правок конституции; T017 переведён на `regen --targets copilot`.
