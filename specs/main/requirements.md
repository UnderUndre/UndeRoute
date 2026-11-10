# UndeRoute — Living Requirements (specs/main)

> Canonical non-functional/technical constraints (Constitution Principle VIII.6; Technical Constraints moved out of the constitution per 1.3.0). Created 2026-11-10.

## 1. Functional scope (product-level)

- **MVP-1 (Local Core, $0 FOSS)**: локальный IDE-контур, OmniRoute gateway, 9 персон, Sandboxed Plan/Act execution, Local SQLite Audit Trail, клапаны G1–G8 (spec 004).
- **MVP-2 (TG Cloud Relay, $9.99/mo)**: E2E Noise_XX tunnel, OTP pairing, voice-to-code, TWA Monaco diff. **Заблокировано клапаном G9 (untrusted quarantine) — без него relay собирает lethal trifecta в продукте.**
- **MVP-3**: Sync & Relay Pro ($14.99/mo) + Team Hub ($29/user/mo).
- **MVP-4**: Theme Marketplace.

## 2.1. Technical Constraints

- **Runtime**: Node `>=22.22.2 <23 || >=24.0.0 <27` (`package.json#engines`); ESM; Next.js (upstream build `scripts/build/build-next-isolated.mjs`).
- **DB**: SQLite через `better-sqlite3` ^13.0.2; миграция `SQLITE_INIT_MIGRATION` (`src/core/db/schema.ts:49-100`); WAL-режим обязателен для аудита.
- **Sandbox**: Docker-контейнер обязателен для исполнения агента (cap-drop ALL, `--net=none`, `--read-only`, seccomp-профиль `sandbox/seccomp.json`, 512MB/1cpu/pids 64). Без Docker исполнение отказано (fail-closed, Constitution XIII.1).
- **Tests**: node:test runner через tsx (`npm test`, `test:security`, `test:scoped`); integration-тесты Docker — env-gated.
- **Quality gates (repo)**: `npm run lint` → `npm test` → `npm run build` (замена UnderUndre-гейтов по Adaptation v1.9.0).
- **Security invariants**: секреты и prod-креды не попадают в агентный контекст и аудит в сыром виде (маскирование до записи); промпт-слой (персоны) не имеет привилегий.
- **Business plan**: внешний канон `repos/undreplans/docs/projects/underoute/business-plan.md`, pointer `docs/business-plan-pointer.md` (Constitution VII-B.7).
