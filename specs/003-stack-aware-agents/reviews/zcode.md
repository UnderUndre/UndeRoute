# SpecKit Review: 003-stack-aware-agents

**Reviewer**: zcode
**Reviewed at**: 2026-10-11T02:41:29Z
**Updated at**: 2026-10-11T03:20:00Z
**Commit**: 5f75d99319d2fcb18f8fad400801d7015e31b13c (review written against this HEAD; artifact fixes are uncommitted working tree)
**Artifacts reviewed**: spec.md, plan.md, tasks.md, data-model.md, contracts/cli-interface.md, quickstart.md, research.md, checklists/requirements.md, reviews/analyze.md, `.specify/memory/constitution.md` (v1.5.0). Code lens (read-only): `under-ai-helpers/packages/cli` (`slots.ts`, `sync.ts`, `status.ts`, `doctor.ts`, `drift.ts`, `parse.ts`, `claude-to-gemini-agent.ts`, `types/common.ts`, `package.json` 0.6.0) and root `helpers-lock.json`.

## Summary

Изначальный план писал стековые `skills:` в managed-файл и обещал слот, который текущий парсер не видит. Это держало CRITICAL: `status --strict` стал бы вечно красным, а `STACK_RULES` молча потерялся бы.

2026-10-11 артефакты переписаны под ревью. Транспорт — именованный слот `SKILLS`, парсер расширяется до имён и падает на непарном маркере до записи. MAJOR-устаревание снято. Версия фичи — `0.7.0`, не `3.9.0`. Принципов X и XI в проверке больше нет. Код CLI этим коммитом не менялся: задачи T020 и T011 ещё впереди, поэтому закрытие контрактное, не runtime.

## Findings

Находки ниже — исходное ревью. Колонка Status фиксирует правку артефактов 2026-10-11. Код пакета ещё не написан.

| ID  | Severity | Status | Area                      | Finding                                                                                                        | Resolution in artifacts                                                                                                                                                                        |
| --- | -------- | ------ | ------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | CRITICAL | CLOSED | Consistency / Principle I | Запись `skills:` вне слота красилась `detectSourceDrift` как файловый drift.                                   | FR-003 пишет только тело слота `SKILLS`. Байты вне слота не меняются. `slotsHash` пересчитывается. Голый `sync` слот не пересобирает.                                                          |
| F2  | CRITICAL | CLOSED | Hidden contract           | Именованный `STACK_RULES` текущий `parseSlots` не видит. Незакрытый START молча теряет тело. Merge по индексу. | FR-006 и T020 расширяют `core/slots.ts`: имя маркера, merge по имени, exit 1 до записи. T019 покрывает оба слота. Research больше не утверждает, что парсер это уже умеет.                     |
| F3  | HIGH     | CLOSED | SemVer / Principle IV     | План писал MINOR `v3.9.0` при пакете `0.6.0`.                                                                  | План: `0.7.0` через `/bump`. Контракт и quickstart зовут бинарник `helpers`.                                                                                                                   |
| F4  | HIGH     | CLOSED | Transpile gap             | Gemini и Copilot срезают `skills`, план помечал это PASS.                                                      | FR-003 и SC-001 ограничены `.claude/agents`. Трансформеры этим релизом не меняются. T022 говорит об этом в README.                                                                             |
| F5  | HIGH     | CLOSED | Failure modes / CI        | Битый манифест был одновременно warn и exit 1. `--json` у status и doctor обещал один shape.                   | Битый манифест — warn, exit 0. HIGH → exit 2. `DoctorResult.exitCode` расширяется до `0 \| 1 \| 2` задачей T016. `status --json` без strict остаётся массивом; со strict — `{ files, stack }`. |
| F6  | HIGH     | CLOSED | Missing behavior          | `outdated_version` без правила. `scannedAt` ломал детерминизм. Quickstart звал несуществующий `sqlite-expert`. | Тип снят. `scannedAt` не хешируется. Префиксы `[DRIFT: ORPHANED]` и `[DRIFT: UNMAPPED]`, скилл `database-design`.                                                                              |
| F7  | HIGH     | CLOSED | Security                  | `bun.lockb` и lockfile как списки пакетов. Marker `*.config.js` мог быть исполнен. Не было задачи на symlink.  | FR-001: lockfile только метка менеджера. Marker — `exists()`. T009 включает `realpath` внутри `rootDir` и лимит 2 МиБ.                                                                         |
| F8  | MEDIUM   | CLOSED | NFR-003                   | «120 строк тела» нечем измерить, стек пишется во frontmatter.                                                  | NFR-003: ≤ 15 имён. 16-е — finding `skill_budget` HIGH. T008 это тестирует.                                                                                                                    |
| F9  | MEDIUM   | CLOSED | Monorepo                  | Конфликт двух major не был определён. Walker не был задачей. T014 лежал в unit.                                | US1 сценарий 3: `version_conflict` MEDIUM, без тихого выбора. T009 — `walk.ts`. T014 — `tests/integration`.                                                                                    |
| F10 | MEDIUM   | CLOSED | CLI ownership             | Флаг `--update-stack` был и в `sync.ts`, и в корневом `cli.ts`.                                                | T011 объявляет флаг в `cli/sync.ts`. T012 явно запрещает корневой `cli.ts`. Граф: T012 не блокирует T011, T020 блокирует T011.                                                                 |
| F11 | MEDIUM   | CLOSED | Constitution fiction      | План ссылался на Principle X и XI, которых нет в v1.5.0.                                                       | Ссылки сняты. T003 больше не гейт. В `analyze.md` добавлена пометка, что старый PASS по X/XI недействителен.                                                                                   |
| F12 | MEDIUM   | CLOSED | Base skills               | База читалась бы из текущего агента, replace и append расходились.                                             | FR-002 фиксирует `baseSkills` по ролям. Слот `SKILLS` пересобирается целиком из матрицы. Orphan — имя в слоте, которого матрица больше не даёт.                                                |
| F13 | LOW      | CLOSED | Commercial                | Внутренний CLI, не SKU.                                                                                        | Без изменений. Бизнес-план не требуется.                                                                                                                                                       |
| F14 | LOW      | CLOSED | Ops tasks                 | T002 звал несуществующий `check:licenses`. План писал `commander` и `picocolors`.                              | T002 смотрит `package.json`. План пишет `citty` и `consola`.                                                                                                                                   |

## Commercial / business plan notes

- Plans loaded: none for this repo. Чужие планы в `aitwin.site/` и `.history/` контрактом `clai-helpers` не являются. Waiver не требуется.
- Focus laws / SKU floors checked: n/a.
- Drift: none.

## Alternative approaches considered

1. **Sidecar вместо правки канона.** Стек писать в `.helpers/stack-profile.json`, а рантайм агента подмешивать skills на старте сессии. `sourceCanonicalHash` не врёт, drift — это diff sidecar и sniffer, а не diff managed-файла. Дороже в рантайме, дешевле в инвариантах sync. Автор выбрал запись во frontmatter и этот вариант не разобрал.
2. **Именованный слот вокруг одной строки `skills:`.** Укладывается в текущий merge, если парсер выучит имена. Минус: frontmatter внутри HTML-комментария часть тулов не читает.
3. **Профили в `helpers.config.ts` вместо сниффера.** Это уже kill criteria спеки (ложные CI >1%). Годится как fallback, не как старт. Порог не операционален: знаменатель 1% не задан.

## VERDICT

```yaml
verdict: PASS
reviewer: zcode
reviewed_at: 2026-10-11T02:41:29Z
updated_at: 2026-10-11T03:20:00Z
commit: 5f75d99319d2fcb18f8fad400801d7015e31b13c
critical_count: 0
high_count: 0
medium_count: 0
low_count: 0
note: Artifact contract closed. CLI code not implemented yet. analyze.md on 403ebef is stale.
```
