# Regression Suite — 004-safe-harness-valves (stage 5.5)

## RS-001 — Golden benign set (SC-008, NFR-005)

10 законных задач (эталонный набор, исполняется до/после клапанов):

1. создать/отредактировать файл в workspace; 2. запустить unit-тест; 3. `npm run lint` + автофикс; 4. `rm -rf node_modules` внутри workspace (allowlist); 5. установить зависимость с явным approve+pin; 6. `git commit`/`git push` в test-remote (не force); 7. refactor: переименование символа через repo-map; 8. чтение публичных конфигов репо; 9. генерация отчёта в workspace; 10. откат по чекпоинту без конфликтов.

**Критерий**: 0 ложных блокировок; медиана оверхеда клапанов ≤ 5% wall-clock (TC-BENCH-03).

## RS-002 — Upstream-сьюты

`npm test` (unit, включая `tests/unit/db`, `tests/unit/security`) — зелёные без регрессий; `npm run lint` — чисто; `npm run build` — собирается. Audit-logger rewrite (T002) не ломает существующие вызовы `logEvent/getSessionLogs` (контракт сохранён).

## RS-003 — Негативная регрессия гейтов

Повторный прогон негативного набора (TC-004, TC-008, TC-010, TC-019, D6) после любых правок политики: все block-сценарии остаются заблокированными; allowlist-исключения не расширяются молча (версия политики меняется → аудит `valve_config_change`).

## Правила

- Регрессия обязательна перед qa-signoff (stage 8.5) и перед каждым merge в main.
- Docker-зависимые кейсы без Docker помечаются SKIPPED с меткой (не PASSED).
