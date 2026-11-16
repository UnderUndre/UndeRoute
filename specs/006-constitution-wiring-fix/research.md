# Research: 006-constitution-wiring-fix

**Дата**: 2026-11-15 | **Phase 0** (/speckit.plan)

## Статус неизвестных

**NEEDS CLARIFICATION: 0.** Все развилки закрыты на `/speckit.clarify` 2026-11-15 (§Clarifications спеки, Session 2026-11-15, Q1–Q8). Этот документ фиксирует решения как research-записи (Decision / Rationale / Alternatives) и определяет spike-гигиену.

## Decisions

- **D1 (Q1, FR-004)**: IX cleanup — правка текста конституции, CI-workflow не создаётся. Rationale: дешевле для соло, workflow добавил бы supply-chain поверхность ради 6 слов. Alternatives: GHA cleanup workflow — отвергнут на clarify.
- **D2 (Q2, FR-010)**: `dialog-capture.mjs` удалить. Rationale: файл никогда не был зарегистрирован в settings.json (7-й хук из 7, мёртвый), назначение владельцем не помнится. Alternatives: регистрировать как hook event — отвергнуто (нет потребности). Осознанный побочный эффект (F6): `packages/cli/src/cli/dialog.ts:106-110` — `helpers dialog doctor` проверяет existsSync файла и после удаления даст fail (exit 1); вычистка packages/ вне скоупа NFR-003 (ADR-008), документировано в FR-010.
- **D3 (Q3, FR-007)**: практика base-green отменена полностью (секции из CLAUDE.md и AGENTS.md:571). Rationale: файл-опора `.agents/skills/_shared/base-green.md` не существует; практика никогда не была операционной. Alternatives: восстановить файл-опору — отвергнуто владельцем.
- **D4 (Q4/Q3, FR-007)**: `/sweep-reds` упоминание удаляется вместе с base-green секцией (единственный потребитель). Alternatives: создать скилл — отвергнуто (нет практики, под которую он нужен).
- **D5 (Q5, FR-007)**: таблица `_tasks/` путей выпилена из CLAUDE.md; AGENTS.md `_*`-канон (Hard Rule #23, :261-268/:482-493) не тронут — это приватный present-or-future договорённость, не dangling. Alternatives: удалить канон из AGENTS.md — отвергнуто (не соответствует решению владельца).
- **D6 (Q6, FR-012)**: ops-покрытие через `operational-readiness` чеклист внутри Principle XIV (FR-008); принцип XV не добавляется. Rationale: чеклист уже написан; full doctrine (NIST SP 800-61 / FinOps / DR) — кандидат в спеку 007. Alternatives: (a) XV сейчас, (b) отдельная спека-блокер — отвергнуты.
- **D7 (Q7, FR-013)**: `.gemini/` — N/A, пометка в Principle I amend'а. Alternatives: генерировать дерево — отвергнуто (GEMINI.md стаб достаточен).
- **D8 (Q8, FR-002c)**: precedence-формула подтверждена: конституция = процесс, AGENTS.md = код; прямой конфликт процессных правил решает конституция.
- **D9 (plan, ADR-001)**: amend-стратегия один коммит (Governance §2), манифест в `verification/amend-bundle.md` (T002).
- **D10 (plan, T017; F1-corrected)**: после правок `.claude/commands/*.md` обязателен transpile-прогон `node packages/cli/bin/helpers.mjs regen --targets copilot` + `git diff --exit-code .github/` (Principle I). Correction v2: `npx clai-helpers sync/status --strict` неисполнимы — пакет в UndeRoute называется `underoute-clai` (bin `helpers`, packages/cli), в корневых devDeps отсутствует, sync/status требуют `helpers-lock.json` (sync.ts:352, status.ts:49); `regen` работает без lockfile (regen.ts:53-59), но full-run создал бы `.gemini/` (helpers.config.ts:87-95) вопреки FR-013 → только `--targets copilot`; риск EMFILE от глоба `.claude/worktrees/**` — fallback: ignore `.claude/worktrees/` в helpers.config.ts (root-конфиг, разрешён).
- **D11 (F7)**: base-green/sweep-reds существуют как апстрим-шаблоны в `config/quality/skill-templates/` (проверяются `check-skill-contract.mjs` + unit-тест) — уточнение формулировки FR-007: практика отсутствует по АКТИВНЫМ путям (`.agents/skills/`, `.claude/skills/`), шаблоны инвентарём практики не считаются. После правок AGENTS.md обязателен `npm run check:fabricated-docs` (package.json:174, --strict) — включён в AC T006/T018.

## Spike Governance (ISO/IEC/IEEE 12207)

- **Timebox**: N/A — спайков нет; все решения текстовые/конфигурационные, приняты на clarify.
- **Quantitative Verification Metrics**: N/A — верификация через исполняемые AC `qa/preliminary-rtm.md` (grep/exit-code).
- **Spike Disposal Path**: N/A — выбрасывать нечего; ноль prototype-кода (XI не применяется).
