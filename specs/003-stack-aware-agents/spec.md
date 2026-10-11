# Feature Specification: Stack-Aware Agent Fleet Synchronization

> "Какое ТЗ — такое и ХЗ." — Folk Wisdom
> "Обувать пизду в лапти." — Народная мудрость о художественном пиздеже вместо ТЗ
> "Why don't you explain this to me like I'm five." — Майкл Скотт (_The Office_)
> "Well, I didn't realize you had documentation." — Бабуленька (_Young Sheldon_)

**Feature Branch**: `specs/003-stack-aware-agents` (UndeRoute, ветка планирования; создаёт задача T001)
**Created**: 2026-10-10
**Revised**: 2026-10-11 (rev 2: закрыты находки `reviews/copilot.md` F1–F25; цель реализации — `packages/cli/` самого UndeRoute, Q7)
**Status**: Draft
**Input**: User description: "для каждого репозитория под его конкретный стек обновлять и поддерживать в актуальном состоянии команды агентов (бекендер, фронтендер и тд), менеджить их актуальность, проверять дрифт и т.д."

---

## Терминология

- **Стековые агенты** — агенты, роли которых заданы в матрице: `frontend` → `frontend-specialist`, `backend` → `backend-specialist`, `database` → `database-architect`, `test` → `test-engineer`.
- **Строка `skills:`** — строка с ключом `skills` в первом frontmatter-блоке (между `---` на первой строке файла и следующим `---`). Её читает Claude Code: поле `skills` сабагента предзагружает полное содержимое перечисленных `SKILL.md`. Хук `agent-skills-reminder.sh` читает ту же строку; по Principle VIII он предназначен только для апстрима, и фича от него не зависит.
- **Base** — имена из строки `skills:` **апстримного** рендера агента (fetched source) на момент последнего sync; дубли схлопнуты.
- **Матрица** — `.claude/stack-matrix.json` из шаблона (managed-файл): роли → агенты, правила «пакет/маркер → скиллы», бюджет.
- **Override** — `helpers-stack.json` в корне консьюмера. Файл принадлежит консьюмеру, коммитится, sync его не трогает.
- **Gated-имя роли R** — скилл, перечисленный в `skills` хотя бы одного действующего правила с ролью R.
- **Сработавшее правило** — действующее правило, у которого совпал хотя бы один пакет или маркер-файл и которое не подавлено `mutexGroup`.
- **Дельта роли**: `remove` — gated-имена из base, которых не дало ни одно сработавшее правило; `add` — имена сработавших правил, которых нет в base.
- **Эффективная строка** — base без `remove`, затем `add`.
- **Привязка** — поле `stack` записи агента в `helpers-lock.json`: `{ base, add, remove }`. Создаётся первым `helpers sync --update-stack`. Агент с привязкой называется привязанным.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Stack Sniffer & Skill Gating (Priority: P1) 🎯 MVP

Разработчик в репозитории-консьюмере запускает `helpers sync --update-stack` (бинарник — `helpers`; `clai-helpers` — имя пакета в README). CLI статически читает манифесты прямых зависимостей из tracked-файлов, сопоставляет их с матрицей шаблона и меняет **только** строку `skills:` четырёх стековых агентов: убирает стековые скиллы, для которых в репо нет стека, и добавляет недостающие. Кураторские имена апстрима, которые матрица не гейтит, не трогаются. Дельта сохраняется в lock как привязка, и каждый следующий `sync`, в том числе голый, применяет её снова.

**Why this priority**: Фундаментальная возможность: позволяет каждому репозиторию иметь контекстно-осведомленных агентов без ручного редактирования и без форка/отщепления от апстрима (`eject`).

**Independent Test**: Консьюмер-фикстура: git-репо с `helpers-lock.json`, шаблон с матрицей v1 (FR-002) и текущими апстримными строками агентов; `package.json` с `next@15`, `react`, `@nestjs/core`, `drizzle-orm`. После `helpers sync --update-stack` frontmatter каждого стекового агента разбирается как YAML, а `skills` совпадает со списком из сценария 1. У четырёх записей lock есть `stack`. Затем голый `helpers sync` оставляет строки байт-в-байт, а `helpers status --strict` завершается с 0.

**Acceptance Scenarios** (апстримные строки фикстуры — текущие строки шаблона):

1. **Given** `package.json` с `next@15`, `react`, `@nestjs/core`, `drizzle-orm` (без Tailwind, Playwright, Python и MCP SDK),
   **When** выполняется `helpers sync --update-stack`,
   **Then** строки `skills:` равны: `frontend-specialist` — `clean-code, react-patterns, nextjs-best-practices, frontend-design, lint-and-validate, knowledge-adaptation, ai-engineering-hygiene` (дубль `frontend-design` схлопнут, `tailwind-patterns` убран); `backend-specialist` — `clean-code, nodejs-best-practices, api-patterns, database-design, system-design-patterns, lint-and-validate, knowledge-adaptation, ai-engineering-hygiene, nestjs-expert` (убраны `python-patterns` и `mcp-builder`, добавлен `nestjs-expert`); `database-architect` — без изменений (у `drizzle` нет своего скилла); `test-engineer` — `clean-code, testing-patterns, tdd-workflow, code-review-checklist, lint-and-validate, ai-engineering-hygiene` (убран `webapp-testing`). Остальные байты файлов не меняются, `helpers status --strict` завершается с 0.
2. **Given** Python-репозиторий без `package.json`, где `pyproject.toml` содержит в таблице `[project]` ключ `dependencies = ["fastapi>=0.110", "SQLAlchemy[asyncio]>=2"]`,
   **When** выполняется `helpers sync --update-stack`,
   **Then** у `backend-specialist` остаются `python-patterns` и `api-patterns`, убраны `nodejs-best-practices` и `mcp-builder`; у `frontend-specialist` убраны `react-patterns`, `nextjs-best-practices` и `tailwind-patterns`; `helpers doctor --stack --verbose` перечисляет пакеты `pypi:fastapi` и `pypi:sqlalchemy`.
3. **Given** монорепозиторий: `apps/web/package.json` с `next@^14.2.0`, `apps/admin/package.json` с `next@^15.0.0` и неотслеживаемая копия `.claude/worktrees/x/package.json` с `prisma`,
   **When** выполняется `helpers sync --update-stack`,
   **Then** правило `nextjs` срабатывает, в отчёте есть `version_conflict` (MEDIUM, `npm:next`, major 14 и 15), exit не меняется; `prisma` не обнаружен, потому что ворктри не tracked; дублей имён нет.

---

### User Story 2 - Stack Drift Detection & CI Gate (Priority: P2)

`helpers doctor --stack` и `helpers status --strict` пересчитывают ожидаемую строку `skills:` привязанных агентов по текущим манифестам, матрице, override и base из lock и сравнивают её с фактической. Lockfile пакетов не читаются: транзитивные зависимости drift не дают. Пока привязок нет, `status` ведёт себя как в 1.0.0 (opt-in).

**Why this priority**: Агент не должен работать с устаревшим стеком: например, после миграции с Prisma на Drizzle или после появления NestJS.

**Independent Test**: В привязанной фикстуре удалить `prisma` (при `prisma-expert` в строке `database-architect`) и добавить `@nestjs/core`. `helpers status --strict` завершается с 2, `helpers status --json` остаётся массивом, `helpers doctor --stack --json` содержит `orphaned_stack` и `unmapped_stack`.

**Acceptance Scenarios**:

1. **Given** привязанный репозиторий, где строка `database-architect` содержит `prisma-expert` (его добавил прошлый `--update-stack`), после чего `prisma` удалён из зависимостей, а `@nestjs/core` добавлен,
   **When** запускается `helpers doctor --stack`,
   **Then** вывод содержит `[DRIFT: ORPHANED] .claude/agents/database-architect.md: prisma-expert (rule prisma did not fire)`, `[DRIFT: UNMAPPED] .claude/agents/backend-specialist.md: nestjs-expert (rule nestjs: npm:@nestjs/core)` и строку `Run 'helpers sync --update-stack'`; exit 2. Битый манифест даёт `[WARN] Malformed manifest` и на exit не влияет.
2. **Given** в привязанном `backend-specialist` руками добавлен `typescript-expert` и удалён `clean-code`,
   **When** запускается `helpers status --strict`,
   **Then** exit 2, а `helpers doctor --stack --json` содержит `unexpected_skill` (`typescript-expert`) и `missing_base` (`clean-code`).
3. **Given** консьюмер без привязок (ни разу не запускал `--update-stack`),
   **When** запускаются `helpers status --strict`, `helpers status --json` и `helpers doctor`,
   **Then** вывод и exit-коды совпадают с 1.0.0; `helpers doctor --stack` печатает `[PREVIEW]` с тем, что изменил бы `--update-stack`, и завершается с 0.

---

### User Story 3 - Local Rules via Named Slot `STACK_RULES` (Priority: P3)

Локальные правила команды пишутся в тело именованного слота `<!-- HELPERS:CUSTOM START: STACK_RULES -->` … `<!-- HELPERS:CUSTOM END: STACK_RULES -->`. Шаблон объявляет этот слот пустым в теле четырёх стековых агентов: `mergeSlots` переносит тела только в слоты, которые есть в апстримном рендере, поэтому слот, добавленный одним консьюмером, sync бы удалил.

**Why this priority**: Ни один автоматический детектор не покроет 100% внутренних договоренностей команды. Необходим безопасный механизм ручной кастомизации без потери связи с апстримом.

**Independent Test**: Консьюмер заполняет `STACK_RULES`, апстрим меняет тело агента. `helpers sync` и `helpers sync --update-stack` сохраняют тело слота байт-в-байт, а правка тела не даёт drift в `helpers status --strict`. При непарном маркере не записывается ни один файл прогона, exit 1.

**Acceptance Scenarios**:

1. **Given** заполненный `STACK_RULES` в привязанном `backend-specialist.md`,
   **When** апстрим меняет тело агента и выполняется `helpers sync` (или `helpers sync --update-stack`),
   **Then** тело вне слотов обновлено, тело `STACK_RULES` совпадает байт-в-байт, строка `skills:` соответствует привязке, `helpers status --strict` завершается с 0.
2. **Given** непарный маркер (START без END, END без START, вложенность, повтор имени, END с другим именем),
   **When** выполняется `helpers sync` или `helpers sync --update-stack`,
   **Then** exit 1 до первой записи прогона (план проверяется целиком); `helpers doctor --stack` даёт `unbalanced_slot` (HIGH, exit 2).
3. **Given** локальный `STACK_RULES` с непустым телом, а в новом апстримном рендере такого слота нет,
   **When** выполняется `helpers sync`,
   **Then** exit 1 до записи с подсказкой, как сохранить тело; файлы не меняются.

---

### Edge Cases

- **Битый манифест** (JSON/TOML): `[WARN] Malformed manifest`, файл пропускается. Если найденные манифесты есть, но все битые, `--update-stack` не меняет привязку и строку. Doctor при одних warn завершается с 0.
- **BOM в `package.json`** снимается перед `JSON.parse` и ошибкой не считается.
- **Симлинк манифеста наружу `rootDir`**: не читается, `[WARN] Symlink escaped root`.
- **Не git-репозиторий**: walker с той же глубиной и denylist, `[WARN] Not a git work tree`.
- **Ворктри и копии**: всё под `.claude/` и каталоги denylist не сканируются; в git-режиме неотслеживаемые файлы не видны.
- **Гетерогенный стек**: правила срабатывают независимо, итог — объединение по ролям. Если сработали два правила одного `mutexGroup` с пересечением ролей, на пересечении подавляются оба (`ambiguous_stack`, MEDIUM), пока override не закрепит одно через `pin`.
- **Нет манифестов**: правила срабатывают только по найденным маркерам; gated-имена base без сработавших правил уходят в `remove`, остальные имена base остаются.
- **Скилла из правила нет в каталоге** (частичная установка паков, старый ref шаблона): имя не добавляется, `missing_skill_catalog` (MEDIUM).
- **В шаблоне нет матрицы** (шаблон старше релиза фичи): `--update-stack` завершается с exit 1 «stack matrix not found»; `doctor --stack` печатает INFO и завершается с 0; привязанные агенты проверяются по сохранённой дельте, `matrix_missing` (MEDIUM).
- **Агент `ejected`, `orphaned` или отсутствует**: строка не пишется, привязка не меняется, `agent_missing` (MEDIUM).
- **В апстримном агенте нет строки `skills:`**: base пуст; если эффективный список не пуст, строка вставляется последней строкой первого блока.
- **Один пакет, два известных major**: `version_conflict` (MEDIUM); правило срабатывает по факту наличия пакета.
- **Бюджет**: при превышении `maxSkills` или `maxPreloadBytes` из `add` убираются хвостовые имена, `skill_budget` (MEDIUM). Имена base не убираются никогда; если base уже выше бюджета, это тоже `skill_budget` (MEDIUM) — сигнал апстриму.
- **Kill-switch**: `helpers-stack.json` с `"enabled": false` — привязки не применяются и не проверяются, `--update-stack` завершается с exit 1.
- **Апстрим изменил строку `skills:` привязанного агента**: голый sync берёт новый `base` и применяет сохранённую дельту. Новое gated-имя, для которого в репо нет стека, остаётся в строке, и `doctor --stack` / `status --strict` дают `orphaned_stack` (HIGH) — это намеренный сигнал перезапустить `helpers sync --update-stack`. Имя из `add`, появившееся в `base`, не дублируется.
- **Старый CLI (≤ 1.0.x)** на привязанном репозитории: его sync перепишет записи lock без поля `stack`, и привязка пропадёт. Это фиксирует migration note.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001 (Manifest Discovery & Parsing)**: CLI читает только текст: без `import()`, `eval()`, `require()`, без исполнения `*.config.js` / `*.config.ts` и без загрузки `helpers.config.ts`.
  - **Обнаружение**: в git work tree — `git ls-files -z` (только tracked-файлы, без обхода подмодулей); вне git — walker. В обоих режимах глубина файла — число сегментов repo-relative пути минус 1 (`package.json` в корне — 0, `apps/web/package.json` — 2); допускается ≤ 4. Пропускаются пути, где любой сегмент равен `node_modules`, `.git`, `dist`, `build`, `out`, `.next`, `.nuxt`, `.svelte-kit`, `.turbo`, `.cache`, `coverage`, `target`, `vendor`, `.venv`, `venv`, `.tox`, `__pypackages__`, `.yarn`, `.pnpm-store`, `examples`, `fixtures` или `__fixtures__`, всё под `.claude/` и пути из `helpers-stack.json#scan.exclude`. `realpath` файла обязан оставаться внутри `rootDir`. Файл больше 2 МиБ пропускается (`oversize`). Если манифестов больше 1000, обрабатываются первые 1000 в отсортированном порядке (`manifest_cap`).
  - **npm** (`package.json`): только `dependencies` и `devDependencies`, имена `npm:<name>`. `peerDependencies` и `optionalDependencies` не читаются. UTF-8 BOM снимается.
  - **PyPI**: имена `pypi:<name>` после нормализации PEP 503 (нижний регистр, серии `-`, `_`, `.` → `-`), без extras и маркеров окружения. Источники: в `pyproject.toml` — `project.dependencies` (массив PEP 508 внутри таблицы `[project]`, а не отдельная таблица), `project.optional-dependencies.*`, `dependency-groups.*` (PEP 735; элементы `{include-group = …}` пропускаются), `tool.poetry.dependencies` (кроме `python`) и `tool.poetry.group.*.dependencies`; `requirements*.txt` и `requirements/*.txt` — строки-требования без пустых строк, комментариев и опций (`-r`, `-c`, `-e`, `--…`), для `name @ url` берётся `name`; `Pipfile` — `[packages]` и `[dev-packages]`. TOML разбирает `confbox`; самописный TOML-парсер не допускается.
  - **Lockfile** (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`, `poetry.lock`, `uv.lock`, `Pipfile.lock`) не читается: это не список прямых зависимостей.
  - **Маркер-файлы**: шаблоны `files` из правил сравниваются со списком обнаруженных путей (только факт наличия). Синтаксис шаблона: `*` внутри одного сегмента и ведущий `**/` (любая глубина). Содержимое JS/TS-конфигов не читается.
  - **Go и Rust** в этом релизе не сканируются: в каталоге нет скиллов для этих экосистем.
  - **Версии**: для каждого имени сохраняются все сырые спецификаторы, отсортированные. Major извлекается только из однозначных форм: npm — `X`, `X.y.z`, `^X…`, `~X…`, `X.x`; PyPI — `==X…`, `~=X…`. Все остальные формы (`*`, `latest`, диапазоны, `workspace:`, `catalog:`, `npm:`, git, URL, `file:`) дают `unknown` и в конфликт не попадают.
- **FR-002 (Stack Matrix & Override)**:
  - Матрица — `.claude/stack-matrix.json` в шаблоне (managed-файл, identity-sync). Схема — `StackMatrix` в data-model.md: `schema: 1`, `agents` (роль → имя файла агента без `.md`), `budget` (`maxSkills`, `maxPreloadBytes`), `rules[]` (`id`, `packages?`, `files?`, `skills`, `roles`, `mutexGroup?`, `description`). У правила должен быть хотя бы один из `packages` и `files`. Неизвестные ключи — ошибка схемы.
  - `id` правил, имена скиллов и `mutexGroup` соответствуют `^[a-z0-9]+(-[a-z0-9]+)*$` и не длиннее 64 символов. Роли: `frontend`, `backend`, `database`, `test`.
  - Нормативная матрица v1 (выпускается шаблоном вместе с CLI 1.1.0; порядок — по `id`):

    | id            | packages                                                                                                                            | files                                                                                                                                                     | skills                  | roles    | mutexGroup |
    | ------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------- | ---------- |
    | `drizzle`     | `npm:drizzle-orm`                                                                                                                   | `**/drizzle.config.js`, `**/drizzle.config.mjs`, `**/drizzle.config.cjs`, `**/drizzle.config.ts`                                                          | —                       | database | `orm`      |
    | `mcp-sdk`     | `npm:@modelcontextprotocol/sdk`, `pypi:mcp`, `pypi:fastmcp`                                                                         | —                                                                                                                                                         | `mcp-builder`           | backend  | —          |
    | `nestjs`      | `npm:@nestjs/core`                                                                                                                  | —                                                                                                                                                         | `nestjs-expert`         | backend  | —          |
    | `nextjs`      | `npm:next`                                                                                                                          | `**/next.config.js`, `**/next.config.mjs`, `**/next.config.cjs`, `**/next.config.ts`                                                                      | `nextjs-best-practices` | frontend | —          |
    | `node-server` | `npm:express`, `npm:fastify`, `npm:koa`, `npm:hono`, `npm:@hapi/hapi`, `npm:@nestjs/core`, `npm:next`, `npm:@trpc/server`, `npm:h3` | —                                                                                                                                                         | `nodejs-best-practices` | backend  | —          |
    | `prisma`      | `npm:prisma`, `npm:@prisma/client`                                                                                                  | `**/prisma/schema.prisma`                                                                                                                                 | `prisma-expert`         | database | `orm`      |
    | `python`      | —                                                                                                                                   | `**/pyproject.toml`, `**/requirements*.txt`, `**/requirements/*.txt`, `**/Pipfile`                                                                        | `python-patterns`       | backend  | —          |
    | `react`       | `npm:react`                                                                                                                         | —                                                                                                                                                         | `react-patterns`        | frontend | —          |
    | `tailwind`    | `npm:tailwindcss`                                                                                                                   | `**/tailwind.config.js`, `**/tailwind.config.mjs`, `**/tailwind.config.cjs`, `**/tailwind.config.ts`                                                      | `tailwind-patterns`     | frontend | —          |
    | `web-e2e`     | `npm:@playwright/test`, `npm:playwright`, `npm:cypress`, `npm:puppeteer`, `npm:webdriverio`                                         | `**/playwright.config.js`, `**/playwright.config.mjs`, `**/playwright.config.ts`, `**/cypress.config.js`, `**/cypress.config.mjs`, `**/cypress.config.ts` | `webapp-testing`        | test     | —          |

    `agents`: `frontend` → `frontend-specialist`, `backend` → `backend-specialist`, `database` → `database-architect`, `test` → `test-engineer`. `budget`: `maxSkills` = 15, `maxPreloadBytes` = 98304.

  - Правило с пустым `skills` (`drizzle`) участвует только в `mutexGroup`.
  - **`mutexGroup`**: если сработали два и более правила одной группы с пересечением ролей, на пересечении подавляются все, кроме правила, закреплённого через `pin`; без закрепления — `ambiguous_stack` (MEDIUM). Правила одной группы без пересечения ролей друг друга не гасят.
  - **Override** `helpers-stack.json` в корне консьюмера (коммитится; не в `.helpers/`, потому что `helpers init` добавляет `.helpers/` в `.gitignore`). Схема `StackOverride`: `schema: 1`, `enabled?` (по умолчанию `true`), `disableRules?` (правило удаляется целиком, его имена перестают быть gated), `rules?` (новый `id` добавляет правило, существующий — заменяет), `pin?` (`mutexGroup` → `id` правила), `budget?` (замещает поля бюджета), `scan.exclude?` (шаблоны в синтаксисе FR-001). Файл — JSON, без исполнения; ошибка схемы — exit 1. Поле `stackMatrix` в `HelpersConfig` не вводится: `helpers.config.ts` остаётся манифестом апстрима.
- **FR-003 (Skill Line Computation)**: для роли R и её агента:
  1. `base` — имена из строки `skills:` апстримного рендера агента; дубли схлопнуты, остаётся первое вхождение.
  2. `gated(R)` — объединение `skills` всех действующих (после override) правил с ролью R.
  3. `fired(R)` — `skills` сработавших и не подавленных правил с ролью R; берутся только имена, у которых есть `.claude/skills/<name>/SKILL.md` в состоянии каталога после применения плана sync (иначе `missing_skill_catalog`, MEDIUM).
  4. `remove` — имена из `base`, которые входят в `gated(R)` и не входят в `fired(R)`.
  5. `add` — имена из `fired(R)`, которых нет в `base`; порядок — по `id` правила, внутри правила — как в `skills`.
  6. Бюджет: пока эффективный список длиннее `maxSkills` или суммарный размер его `SKILL.md` больше `maxPreloadBytes`, из `add` убирается последнее имя (`skill_budget`, MEDIUM). Имена из `base` не убираются.
  7. Эффективная строка — `base` без `remove`, затем имена `add`, которых ещё нет в `base` (без дублей).

  Все сортировки — по code units (оператор `<`), не `localeCompare`.

- **FR-004 (Frontmatter Writer)**: меняется только строка `skills:` первого frontmatter-блока стекового агента.
  - Первая строка файла (после необязательного UTF-8 BOM) — `---`, закрывающий `---` — не дальше 100-й строки. Иначе `malformed_frontmatter`.
  - В блоке не больше одной строки с ключом `skills`. Значение — скаляр через запятую (`a, b`) или flow-последовательность (`[a, b]`). Block-список (`skills:` и строки `- a`), повтор ключа или невалидное имя — `malformed_frontmatter`.
  - Если строки нет, а эффективный список не пуст, строка вставляется последней строкой блока перед закрывающим `---`. Строка после закрывающего `---` не пишется.
  - Формат вывода — константа `SKILLS_LINE_FORMAT`, выбранная пробой T003: `skills: a, b` (CSV), если Claude Code разбирает CSV в поле `skills`, иначе `skills: [a, b]`. Хук понимает обе формы.
  - EOL файла (CRLF или LF), BOM и все остальные байты сохраняются.
  - После рендера frontmatter разбирается YAML-парсером (`confbox`), и `skills` сверяется с эффективным списком до записи в staging. Расхождение — abort прогона, exit 10.
- **FR-005 (Binding Lifecycle)**:
  - `helpers sync --update-stack` (флаг в `defineCommand` команды `sync`, не в корневом `cli.ts`) выполняет обычный sync, а для каждого стекового агента со статусом `managed` считает дельту по FR-003, пишет строку и сохраняет в lock `stack: { base, add, remove }`. Первый прогон создаёт привязку (opt-in).
  - Любой `helpers sync`, в том числе голый, для привязанного агента после `mergeSlots` обновляет `stack.base` из апстримного рендера и применяет сохранённые `add` и `remove` (шаги 1, 6 и 7 FR-003); имена `add`, попавшие в новый `base`, удаляются из сохранённого `add`. Манифесты и матрицу голый sync не читает.
  - Канонический хеш привязанной записи считается с нормализацией строки `skills:` первого блока: её значение заменяется плейсхолдером `<<HELPERS:STACK>>`. `sourceCanonicalHash` остаётся хешем апстримного рендера, `localCanonicalHash` — хешем записанного файла; оба нормализованы. Файловый drift строку не видит, её проверяет FR-006. Записи без привязки хешируются как в 1.0.0.
  - До первой записи прогона проверяются слоты всех файлов плана (FR-007) и frontmatter стековых агентов (FR-004). Любая ошибка — exit 1, ни один файл не записан.
  - Если найденные манифесты есть, но все битые, `--update-stack` не меняет привязку.
  - `--dry-run` печатает план, а для каждого агента — старую и новую строку и изменения привязки; не пишет ни файлы, ни lock.
  - Повторный `--update-stack` на тех же входах даёт байт-в-байт тот же файл и тот же lock.
  - Запись идёт через `applySyncPlan` (staging, journal, backup); откат — существующий `helpers recover --rollback`.
  - `helpers diff` применяет привязку к апстримному рендеру перед сравнением, чтобы строка не висела вечным diff.
  - Агент `ejected` или `orphaned`: строка не пишется, привязка не меняется (`agent_missing`, MEDIUM).
  - `helpers-stack.json` с `enabled: false`: привязки не применяются, `--update-stack` завершается с exit 1.
  - Трансформеры Gemini и Copilot поле `skills` срезают; в этом релизе они не меняются.
- **FR-006 (Stack Drift Linter)**: `helpers doctor --stack` (только эта проверка) для каждого привязанного агента считает ожидаемую строку по FR-003 из текущих манифестов, матрицы, override, каталога и `stack.base` из lock и сравнивает её со строкой файла. Если матрицы нет, ожидаемая строка — `stack.base` с сохранёнными `add` и `remove`, плюс `matrix_missing`.
  - HIGH: `unmapped_stack` — имя из `fired(R)`, которое есть в ожидаемой строке, отсутствует в фактической; `missing_base` — имя из base, которое есть в ожидаемой строке и не входит в `fired(R)`, отсутствует в фактической; `orphaned_stack` — лишнее имя в фактической строке, которое gated для R и не входит в `fired(R)`; `unexpected_skill` — любое другое лишнее имя; `malformed_frontmatter`; `unbalanced_slot`.
  - MEDIUM: `ambiguous_stack`, `version_conflict`, `missing_skill_catalog`, `skill_budget`, `order_only` (набор совпадает, порядок — нет), `agent_missing`, `matrix_missing`.
  - LOW: `preview` — для непривязанного агента: что изменил бы `--update-stack`.
  - Предупреждения сканера (`malformed_manifest`, `symlink_escape`, `oversize`, `manifest_cap`, `not_git_repo`) на exit не влияют.
  - Exit: 2 при любом HIGH; 1 при ошибке схемы матрицы или override; 10 при IO-ошибке; иначе 0.
  - `--json` печатает `StackDriftReport` (data-model.md) без абсолютных путей и времени; findings отсортированы по `agentFile`, `type`, `skillName`. `--verbose` дополнительно печатает обнаруженные пакеты.
- **FR-007 (Named Slots)**:
  - Маркер принимает необязательное имя `NAME` = `[A-Z][A-Z0-9_]{0,31}` во всех стилях: `<!-- HELPERS:CUSTOM START[: NAME] -->`, `# HELPERS:CUSTOM START[: NAME]`, `// HELPERS:CUSTOM START[: NAME]`; у END то же имя. Безымянный маркер валиден, как в 1.0.0.
  - Грамматика маркеров одна (`core/slot-markers.ts`) и используется и в `core/slots.ts`, и в `core/hash.ts`: тела всех слотов, включая именованные, исключаются из канонического хеша.
  - Слияние: именованные слоты — по имени, безымянные — по порядковому номеру среди безымянных, как сейчас. Повтор имени в файле, непарный START или END, вложенность и END с другим именем — ошибка.
  - Если локальный именованный слот с непустым телом отсутствует в апстримном рендере, sync завершается с exit 1 до записи: тело не теряется молча.
  - Шаблон объявляет пустой слот `STACK_RULES` в теле четырёх стековых агентов. Строка `skills:` слотом не является.
- **FR-008 (CI Integration)**:
  - `helpers status --strict`: файловый drift — как в 1.0.0; стековая проверка FR-006 — только если в lock есть хотя бы одна привязка и override не выключил фичу. Exit 2 при файловом drift или стековом HIGH.
  - `helpers status --json` в любом режиме печатает тот же массив `StatusEntry`, что в 1.0.0. Подробности стека — только в `helpers doctor --stack --json`. В человеческом выводе `status` при стековых findings печатается блок `[stack]`.
  - Голый `helpers doctor` по-прежнему запускает `status --strict` в проверке `drift.status`; стековый HIGH даёт там fail и exit 1, а в detail — подсказку `Run 'helpers doctor --stack' for details`.
  - Exit-коды — таблица в contracts/cli-interface.md на основе enum `ExitCode`.
- **FR-009 (Upstream Matrix Validation)**: `helpers regen` в апстрим-репо, если в нём есть `.claude/stack-matrix.json`, проверяет схему, уникальность `id`, валидность имён, наличие `.claude/skills/<name>/SKILL.md` для каждого скилла и `.claude/agents/<agent>.md` для каждой роли. Ошибка — exit 1: шаблон с битой матрицей не выпускается.

---

### Non-Functional Requirements (NFR) _(ISO/IEC/IEEE 29148:2018)_

- **NFR-001 (Performance)**: обнаружение, парсинг и расчёт на фикстуре из 10 000 tracked-файлов и 50 манифестов (глубина ≤ 4) укладываются в p95 < 150 мс и p99 < 300 мс на эталонном раннере `ubuntu-latest`. Измеряет бенч T033: 3 прогрева и 30 прогонов в отдельном CI-job. Релиз блокирует только Linux-результат; результат Windows фиксируется с бюджетом ×2 и релиз не блокирует. В unit-тестах таймингов нет.
- **NFR-002 (Determinism)**: одинаковые tracked-манифесты, матрица, override и каталог дают байт-в-байт одинаковые строку, привязку и JSON-отчёт. В них нет времени, абсолютных путей и порядка `readdir`.
- **NFR-003 (Preload Budget)**: эффективная строка содержит не больше `maxSkills` (15) имён, а суммарный размер их `SKILL.md` не больше `maxPreloadBytes` (96 КиБ): Claude Code инжектит эти файлы в контекст сабагента целиком. Урезается только `add` (FR-003).
- **NFR-004 (Offline)**: обнаружение, парсинг, матрица, override, `doctor --stack` и `status --strict` работают без сети. `sync --update-stack` — это sync: ему нужен источник шаблона (сеть или кэш giget с `--offline`), как любому sync.
- **NFR-005 (Compatibility, opt-in)**: у консьюмера без привязок вывод и exit-коды `status`, `status --strict`, `status --json`, `doctor`, `sync` и `diff` на тех же входах (тот же шаблон и lock) совпадают с 1.0.0. Схема lock остаётся `1`, поле `stack` необязательное.

---

### Regulatory & Compliance Screening _(ISO/IEC/IEEE 12207 Phase 0)_

> **Compliance**: N/A (внутренняя CLI-инфраструктура разработки). Business plan: waiver — [business-plan-waiver.md](business-plan-waiver.md) (Principle VII-B.5).

- **Jurisdictions**: N/A.
- **Data Classification**: исходный код, манифесты, имена open-source пакетов (Public / Internal).
- **Kill Criteria (Falsifiability)**: через 30 дней после релиза 1.1.0 берётся выборка — все репозитории из `helpers fleet list --json`, в чьём `helpers-lock.json` есть привязка (если их меньше 5, окно продлевается, пока их не станет 5). Метрика — доля репозиториев, где за окно человеческий коммит (не `helpers sync` и не fleet) правил строку `skills:` привязанного агента, удалял привязку или ставил `"enabled": false`. Если доля ≥ 25% (и это минимум 2 репозитория), в следующем релизе (через `/bump`) стековая проверка в `status --strict` выключается по умолчанию, а привязки остаются только по явному `--update-stack`.

---

### Security & Threat Mitigation (STRIDE) _(NIST SP 800-218 SSDF)_

- **Spoofing**: имена скиллов берутся только из матрицы шаблона и `helpers-stack.json` и проверяются regex из FR-002; путь скилла — `.claude/skills/<name>/SKILL.md` внутри `rootDir`. Из манифестов имена скиллов не берутся.
- **Tampering**: никакого `eval`, `import()` и `require()` файлов репозитория; код stack, `status` и `doctor` не загружает `helpers.config.ts`. Манифесты, матрица и override читаются как данные (JSON, TOML через `confbox`, построчный requirements).
- **Repudiation**: запись идёт через journal и backup `applySyncPlan`; lock хранит `stack { base, add, remove }` и нормализованные канонические хеши; повторный прогон идемпотентен. Сверх того, что sync уже пишет в журнал (runId, command, paths), ничего не добавляется.
- **Information Disclosure**: `.env`, `.env.*`, ключи и `process.env` не читаются; symlink, чей `realpath` выходит за `rootDir`, пропускается; в git-режиме видны только tracked-файлы.
- **Denial of Service**: глубина ≤ 4, denylist каталогов, 2 МиБ на файл, не больше 1000 манифестов.
- **Elevation of Privilege**: отказ sync при `helpers.config.ts` без `--allow-self-sync` сохраняется, `--update-stack` его не обходит. Writer не может вписать во frontmatter новые ключи (`tools`, `permissionMode`, `hooks`): имена проходят regex, block-список и повтор ключа отклоняются, после рендера frontmatter проверяется YAML-парсером.

---

### Key Entities

- **`StackManifest`**: обнаруженные манифесты, пакеты `eco:name` с отсортированными спецификаторами, `versionConflicts`, обнаруженные пути для маркеров, режим (`git` или `walk`), предупреждения.
- **`StackMatrix` / `TechSkillMapping`**: содержимое `.claude/stack-matrix.json` — агенты по ролям, бюджет, правила.
- **`StackOverride`**: содержимое `helpers-stack.json` — `enabled`, `disableRules`, `rules`, `pin`, `budget`, `scan.exclude`.
- **`AgentSkillPlan`**: расчёт FR-003 для одного агента — `base`, `gated`, `fired`, `add`, `remove`, `dropped`, `effective`.
- **`StackBinding`**: поле `stack` записи агента в lock — `{ base, add, remove }`.
- **`StackDriftReport` / `StackDriftFinding`**: результат FR-006.
- **`NamedSlot`**: именованный слот FR-007; имя `STACK_RULES` зарезервировано за стековыми агентами.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: в консьюмер-фикстуре после `helpers sync --update-stack` frontmatter четырёх стековых агентов разбирается YAML-парсером, а `skills` совпадает с ожидаемым списком из US1. Формат строки подтверждён пробой T003: Claude Code предзагружает 2 из 2 тестовых скиллов. Awk хука печатает тот же список (вторичная проверка, только на LF-фикстуре: awk хука не распознаёт `---\r` в CRLF-файлах).
- **SC-002**: `helpers doctor --stack` на фикстуре NFR-001 укладывается в 1 секунду wall-clock, включая старт Node, и печатает findings.
- **SC-003**: цепочка `sync --update-stack` → `sync` → `sync` после изменения тела агента в апстриме не меняет строку `skills:`, а `status --strict` после каждого шага завершается с 0. `eject` не используется.
- **SC-004**: тело `STACK_RULES` после `sync` и `sync --update-stack` совпадает байт-в-байт; правка тела не даёт drift; непарный слот — exit 1 и ни одного записанного файла.
- **SC-005**: golden-тест на одной машине: у фикстуры без привязок вывод и exit-коды `status`, `status --strict`, `status --json` и `doctor` в 1.1.0 совпадают с 1.0.0.

---

## Clarifications & Resolution Log (Phase 2 Clarify)

- **Q1 (2026-10-10, архитектура)**: ядро агента остаётся в апстриме, стековые скиллы — в строке `skills:` первого frontmatter-блока, локальные правила — в слоте `STACK_RULES`. _Уточнено в Q6_: строка хранится как привязка в lock и применяется любым sync.
- **Q2 (2026-10-10, контроль дрифта)**: локально — `helpers doctor --stack`, в CI — `helpers status --strict` (exit 2). _Уточнено в Q6_: в `status` стек проверяется только при наличии привязок; поля `cause` нет, `status --json` не меняется.
- **Q3 (платформа)**: пакет `underoute-clai` (бинарник `helpers`, сейчас `0.6.0`) живёт в апстрим-репо `github:UnderUndre/under-ai-helpers` вместе с шаблоном `.claude/`. Релиз — MINOR `0.7.0` через `/bump`. Папка `repos/under-ai-helpers` в воркспейсе — неотслеживаемый снапшот, а не цель реализации. _Исправлено в Q7_: апстрим — сам UndeRoute.
- **Q4 (2026-10-11, review zcode)**: Gemini и Copilot скиллы не получают; `outdated_version` снят. _Исправлено в Q6_: действующая конституция — UndeRoute v1.7.0, Principles X и XI в ней есть.
- **Q5 (2026-10-11, analyze C1)**: именованный слот `SKILLS` снят, транспорт — строка `skills:` в первом frontmatter-блоке. _Уточнено в Q6_: вместо перезаписи lock-хеша — нормализация строки в каноническом хеше привязанных записей.
- **Q6 (2026-10-11, review copilot F1–F25)**: base — апстримная строка агента; матрица — `.claude/stack-matrix.json` в шаблоне (решение пользователя); override — `helpers-stack.json`; привязка `{ base, add, remove }` в lock применяется любым sync; стековый гейт opt-in, `status --json` не меняется; общая грамматика именованных слотов для `slots.ts` и `hash.ts`, шаблон объявляет `STACK_RULES`; обнаружение через `git ls-files`, TOML через `confbox`; `version_conflict` только информационный; бюджет — по байтам и числу имён; формат строки — по пробе T003; Go и Rust вне релиза. Ветку планирования, коммит и stage-теги пользователь делает сам (T001).
- **Q7 (2026-10-11, подготовка analyze)**: апстрим — сам UndeRoute: в нём tracked `packages/cli/` (`underoute-clai` `1.0.0`, `helpers init` по умолчанию берёт `github:UnderUndre/UndeRoute`), шаблон `.claude/` и `helpers.config.ts`. Обе ветки Principle IX — в UndeRoute; релиз — MINOR через `/bump` (ожидается `1.1.0`); совместимость считается от `1.0.0`. `repos/under-ai-helpers` — устаревший снапшот `0.6.0`.
