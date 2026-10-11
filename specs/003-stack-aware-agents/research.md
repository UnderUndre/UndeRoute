# Technical Research: Stack-Aware Agent Fleet Synchronization

> "Э-э-эксперименты!" — Александр Пушной & «Галилео»
> "Удалённый код — отлаженный код. В чужой сифон не лезем, но черновой код спайка подлежит безусловному уничтожению." — Сидорович (_S.T.A.L.K.E.R._)
> "Хрен его знает, на кой ляд тебе этот микросервис сдался, но я в чужой легаси не лезу: хочешь дропнуть — значит, есть за что." — Сидорович (_S.T.A.L.K.E.R._)

**Feature**: `003-stack-aware-agents`
**Date**: 2026-10-10, rev 2 — 2026-10-11
**Status**: Completed (rev 2)

---

## 1. Decision: Manifest Discovery & Parsing

### Decision

- Обнаружение — `git ls-files -z` (только tracked-файлы); walker — только вне git. Глубина, denylist и `realpath` — как в spec FR-001.
- npm: `JSON.parse` после снятия BOM; только `dependencies` и `devDependencies`.
- PyPI: TOML разбирает `confbox`. Ключи PEP 621 (`project.dependencies` — массив внутри таблицы `[project]`, а не отдельная таблица), `project.optional-dependencies`, PEP 735 `dependency-groups`, Poetry (`tool.poetry.dependencies`, `tool.poetry.group.*.dependencies`); `requirements*.txt` построчно; `Pipfile` (`[packages]`, `[dev-packages]`). Имена нормализуются по PEP 503.
- Lockfile-файлы не читаются. Маркеры проверяются только на наличие по списку обнаруженных путей; JS/TS-конфиги не исполняются и не парсятся.
- Go и Rust в этом релизе не сканируются.

### Rationale

- **Безопасность (NIST SP 800-218 SSDF)**: код репозитория не исполняется — ни `import()`/`eval()`/`require()` конфигов, ни загрузка `helpers.config.ts` в `status` и `doctor`.
- **Детерминизм**: `git ls-files` видит то же, что CI; ворктри `.claude/worktrees/*`, venv и gitignored-файлы в выборку не попадают.
- **Корректность**: сканер по заголовкам секций не видит `project.dependencies`: это ключ, а не таблица. `confbox` (MIT) уже установлен как зависимость `c12@2.0.4` (`confbox@^0.1.8`), поэтому прямая зависимость не добавляет нового кода.
- **Go и Rust**: в каталоге нет ни одного скилла для них, парсер был бы кодом без потребителя.

### Alternatives Considered

1. _Динамический импорт конфигураций_ — отклонён: риск RCE и несовместимость рантаймов.
2. _Полнотекстовый grep_ — отклонён: ложные срабатывания на комментариях.
3. _Самописный TOML-сканер_ — отклонён: не покрывает ключи PEP 621, инлайн-таблицы и многострочные массивы.
4. _Только собственный walker_ — оставлен как fallback вне git: он не учитывает `.gitignore` и расходится с CI.

---

## 2. Decision: Matrix as Template Data

### Decision

Правила «пакет/маркер → скиллы» лежат в `.claude/stack-matrix.json` шаблона рядом с каталогом скиллов. CLI их только читает и валидирует (`regen`, FR-009). Консьюмер переопределяет правила в `helpers-stack.json`.

### Rationale

- Principle I: конфигурация AI остаётся в `.claude/`, CLI ничего не хардкодит.
- Матрица и каталог версионируются вместе, поэтому версии CLI и шаблона не расходятся по набору правил.
- `helpers.config.ts` — манифест апстрима: он грузится из `sourceDir`, а его появление у консьюмера включает self-sync guard. Для консьюмерского override он не подходит, а его загрузка в `status` и `doctor` означала бы исполнение TS из PR в CI.
- `.helpers/` попадает в `.gitignore` при `helpers init`, поэтому override лежит в корне: `helpers-stack.json`.
- Удалённого реестра нет (NFR-004).

### Alternatives Considered

1. _TS-константа в CLI_ — отклонена решением пользователя (2026-10-11): правила отрываются от каталога, Principle I.
2. _Триггеры во frontmatter каждого `SKILL.md`_ — отклонено: неизвестные ключи frontmatter скиллов могут попасть в другие инструменты, а правила с несколькими скиллами и `mutexGroup` удобнее держать в одном месте.
3. _Сетевой реестр_ — отклонён (NFR-004).

---

## 3. Decision: Base from Upstream + Binding Overlay

### Decision

- Base — строка `skills:` апстримного рендера агента (не локальная строка и не константа).
- Матрица только гейтит стековые имена: `remove` — gated-имена base без сработавшего правила, `add` — недостающие имена сработавших правил.
- Дельта хранится в lock (`stack: { base, add, remove }`) и применяется любым sync после `mergeSlots`. Канонический хеш привязанной записи нормализует строку `skills:`.

### Rationale

- `computeSyncPlan` ставит `update` каждому managed-файлу, а `applySyncPlan` сохраняет только тела слотов (`packages/cli/src/cli/sync.ts`). Без привязки строка вне слота откатывалась бы каждым sync.
- Фиксированная таблица `baseSkills` в коде вырезала бы кураторские имена апстрима (`ai-engineering-hygiene`, `knowledge-adaptation`, `system-design-patterns`, `webapp-testing` и другие) и сделала бы `status --strict` красным у всех консьюмеров на апгрейде.
- Нормализация вместо перезаписи `sourceCanonicalHash` сохраняет смысл хеша (апстрим) и не даёт вечного diff в `helpers diff`.

### Alternatives Considered

1. _Хранить полный список скиллов_ — отклонено: замораживает base, апстримные правки строки не доходят до консьюмера.
2. _Sidecar без записи во frontmatter_ (zcode, alt #1) — отклонено: Claude Code берёт скиллы из frontmatter, sidecar он не читает.
3. _Именованный слот вокруг строки_ — отклонено раньше (Q5): HTML-комментарий внутри YAML frontmatter ломает парсинг.

---

## 4. Decision: Drift Detection & CI Opt-in

### Decision

- Ожидаемая строка пересчитывается из текущих входов и сравнивается с фактической целиком: `unmapped_stack`, `orphaned_stack`, `missing_base`, `unexpected_skill` (HIGH), `order_only` (MEDIUM) и другие типы из spec FR-006.
- `status --strict` проверяет стек только при наличии привязок; `status --json` не меняется; подробности — в `doctor --stack --json`.
- `version_conflict` — только информация: правила не зависят от версии.

### Rationale

- Прежняя таксономия не ловила пропажу base-имени, а правило `drizzle-orm → database-design` дублировало base-скилл и ничего не меняло.
- Opt-in убирает «красный CI у всех на апгрейде» и не ломает парсеры `status --json`.

---

## 5. Decision: Named Slots

### Decision

Одна грамматика маркеров (`core/slot-markers.ts`) для `slots.ts` и `hash.ts`; именованные слоты сливаются по имени, безымянные — по порядку; весь план проверяется до первой записи; непустой именованный слот не теряется молча. Шаблон объявляет пустой `STACK_RULES` в стековых агентах.

### Rationale

- `canonicalHash` пересканирует контент собственными регэкспами (`packages/cli/src/core/hash.ts`). Если расширить только `slots.ts`, правка `STACK_RULES` станет файловым drift.
- `mergeSlots` переносит тела только в слоты, которые есть в апстримном рендере: слот, добавленный одним консьюмером, sync удалил бы.
- `validateSlotPairing` уже есть в `slots.ts`, но sync его не вызывал.

---

## 6. Decision: Transport to the Agent (Claude Code)

### Decision

Строку `skills:` прежде всего читает Claude Code: поле `skills` сабагента предзагружает **полное** содержимое перечисленных `SKILL.md`, не больше 32 имён ([Create custom subagents → Preload skills into subagents](https://code.claude.com/docs/en/sub-agents)). Хук `agent-skills-reminder.sh` — дополнительное напоминание; по Principle VIII он предназначен только для апстрима.

- Документация показывает `skills` YAML-списком; строка через запятую явно описана только для `tools`. Формат вывода выбирает проба T003.
- Бюджет считается в байтах `SKILL.md` и в именах (NFR-003). Строка frontend из шаблона без дубля `frontend-design` весит около 53 КБ `SKILL.md`, backend — около 56 КБ, backend с `nestjs-expert` после привязки из quickstart — около 65 КБ.

### Probe T003 (Principle XI)

- Timebox: 0.5 дня. Метрика: число предзагруженных скиллов для `skills: probe-a, probe-b` и `skills: [probe-a, probe-b]` (ожидается 2 из 2).
- Утилизация: scratch-репозиторий удаляется, в пакет ничего не переносится, тестов на спайк нет.
- Результат: _заполняет T003 — версия Claude Code, число предзагруженных скиллов по каждому формату, выбранный `SKILLS_LINE_FORMAT`._

---

## 7. Spike Governance (Principle XI)

- Перф-спайка не было. Цифры прошлой ревизии (1.2 мс на парсинг `package.json`, 0.3 мс на матрицу из 30 правил) — оценка без воспроизводимого скрипта, обход дерева в ней не измерялся. Как валидация NFR-001 они не используются.
- NFR-001 подтверждает бенч T033 (3 прогрева, 30 прогонов, p95 и p99 на `ubuntu-latest`), написанный с нуля.
- Единственный спайк — проба T003; её код в пакет не попадает.
- Реализация ляжет в `packages/cli/src/core/stack/` UndeRoute и в точечные правки `slots.ts`, `hash.ts`, `drift.ts`, `sync.ts`, `status.ts`, `diff.ts`, `regen.ts`, `doctor.ts`. Планирование — ветка `specs/003-stack-aware-agents`, код — ветка `003-stack-aware-agents`, обе в UndeRoute (Principle IX).
