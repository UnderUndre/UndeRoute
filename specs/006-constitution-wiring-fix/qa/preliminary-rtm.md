# Preliminary Requirements Traceability Matrix (Draft RTM)

> Draft до архитектурного плана: задаёт вектор для `plan.md` и `tasks.md`. Контур XII: test-design и qa-signoff waived (`qa/waiver.md`), поэтому этот RTM — финальная верификационная карта спеки: каждая строка = исполняемый AC, попадающий в чек-лист SC-001..005 на implement. Evidence-protocol XII.4 обязателен для каждого `[x]` в tasks.md.

| Req ID | Тип | Формулировка (сжатая) | Impact | Prob | Risk Score | Обязательные техники верификации | Planned Verification Level |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FR-001 | FR | analyze.md исполняет RTM-проверку + XII.4 evidence (CRITICAL на отсутствие), §2 грузит qa-артефакты, waiver-fallback, regex-скоуп задач | 3 | 2 | 6 | EP + негатив (grep RTM/Evidence-Backed/preliminary-rtm; waiver-оговорка; `- \[[xX]\] T\d+` скоуп; цитата §XII) | Automated (grep) + analyze gate |
| FR-002 | FR | AGENTS.md §Intent Routing (источник правды) + канон-блок + precedence + хук :10/:63/:95/:112 (CLAUDE.md→AGENTS.md, /speckit.brainstorm, /speckit.bump) | 4 | 2 | 8 | EP + негатив (дельта ≤60 строк; хук: CLAUDE.md=0, AGENTS.md ≥2; команды таблицы существуют — M1-митигация; check:fabricated-docs exit 0; NFR-005) | Automated (grep + wc -l) + analyze gate |
| FR-003 | FR | snapshot-stage.sh/ps1 принимают requirements-audit/test-design/qa-signoff | 3 | 3 | 9 | EP + негативные (exit 0 на новых именах; exit 0 на старых spec/clarify/plan/tasks/review/bizplan) | Automated (exit-code тест) |
| FR-004 | FR | «(via CI workflow)» вычеркнуто из constitution IX | 2 | 1 | 2 | Smoke happy-path (grep = 0) | Automated (grep) |
| FR-005 | FR | v1.9.1 amend: заметка = реальность (f4c87e9099, «6 хуков зарегистрированы»); changelog 1.9.1 | 3 | 2 | 6 | EP + негатив (grep 1.9.1 > 0; «inactive here» = 0) | Automated (grep) |
| FR-006 | FR | dispatch refs резолвятся (/speckit.bump, /speckit.brainstorm, /questions_ideas) + 4×CLAUDE.md→AGENTS.md (:2/:20/:63/:70) | 2 | 1 | 2 | Smoke (каждый /name существует; grep CLAUDE.md = 0) | Automated (loop grep) |
| FR-007 | FR | base-green отменена (CLAUDE.md секция + AGENTS.md:571), sweep-reds ушёл, _tasks таблица выпилена из CLAUDE.md | 3 | 2 | 6 | EP + негатив (grep base-green\|sweep-reds = 0 в обоих файлах; _tasks в CLAUDE.md = 0; AGENTS.md `_*`-канон НЕ тронут: Hard Rule #23 жив) | Automated (grep) |
| FR-008 | FR | Principle XIV: 9 чеклистов привязаны к plan Constitution Check + qa-signoff | 4 | 2 | 8 | EP (constitution XIV section; speckit.plan.md + speckit.qa-signoff.md ссылаются на перечень) | Automated (grep) + analyze gate |
| FR-009 | FR | knowledge/patterns/ + INDEX.md (status: empty) | 1 | 1 | 1 | Smoke (dir + файл существуют) | Automated (ls) |
| FR-010 | FR | dialog-capture.mjs удалён; dialog doctor fail задокументирован (F6, ADR-008) | 1 | 1 | 1 | Smoke (файл отсутствует; settings.json нетронут; packages/ не менялся) | Automated (ls + git diff) |
| FR-011 | FR | Principle V dual-role note (template inventory vs consumer) | 2 | 1 | 2 | Smoke (grep «dual role» в constitution) | Automated (grep) |
| FR-012 | FR | ops-покрытие через operational-readiness чеклист; Principle XV не добавлен | 2 | 1 | 2 | Smoke (grep -E "^### (Principle )?XV\.?" = 0, анкорировано — F8.2; operational-readiness в XIV-перечне) | Automated (grep) |
| FR-013 | FR | .gemini N/A пометка в Principle I | 1 | 1 | 1 | Smoke (пометка N/A рядом с .gemini/) | Automated (grep) |
| NFR-001 | NFR | AGENTS.md ≤ +60 строк; constitution ≤ +50 строк вне changelog | 2 | 2 | 4 | BVA-lite (wc -l дельта против границ 60/50) | Automated (wc -l) |
| NFR-002 | NFR | каждый FR имеет grep/командно-исполнимый AC | 3 | 1 | 3 | Smoke (18/18 требований со строкой AC) | Manual (аудит, этот отчёт) + analyze |
| NFR-003 | NFR | ноль изменений под src/ packages/ electron/ docker/ .github/workflows/ | 5 | 2 | 10 | Негативная (git diff --name-only против path-фильтра = пусто) | Automated (git diff) |
| NFR-004 | NFR | прежние имена стадий snapshot-stage работают | 4 | 2 | 8 | Негативные (exit 0 на всех 6 старых именах) | Automated (exit-code тест) |
| NFR-005 | NFR | Intent Routing ровно в одном always-on файле | 2 | 1 | 2 | Smoke (секция = 1 в AGENTS.md, 0 в CLAUDE.md) | Automated (grep) |

**Максимум Risk Score: 10 (NFR-003).** Порог 20 (DT/ST/EC/UAT) не достигнут ни одним требованием; band 15–19 пуст; распределение: 2×High-Medium (8–9: FR-002, FR-003, FR-008, NFR-003, NFR-004), 6×Medium (6–7), 7×Low (1–5).

**Traceability chain**: Finding (аудит 2026-11-15, L1A path:line) → FR → AC (grep/exit-код) → Task (implement, evidence XII.4) → SC-001..005 чек-лист. RTM-покрытие: 18/18 требований имеют ≥1 верификационную технику; «Risk ≥ 20 → DT+ST+EC+UAT» — пусто по построению.
