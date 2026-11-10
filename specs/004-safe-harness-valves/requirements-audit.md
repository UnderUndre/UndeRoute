# Requirements Audit — 004-safe-harness-valves (Stage 2.5, Constitution XII)

**Дата**: 2026-11-10 · **Аудитор**: ZCode (GLM) · **Статус спеки**: rev 2 (clarify: Q1–Q5 resolved)
**Метод**: ISO/IEC/IEEE 29148:2018 — Verifiability / Consistency / Completeness / Unambiguity; **Risk = Impact (1–5) × Probability (1–5)**.
**Гейт**: verdict REJECTED блокирует `/speckit.plan`; bypass только `--override-gate "<reason>"` (логируется).

## 1. Критерии и оценки

| Req                      | Verifiable                                  | Ambiguity                                                      | Completeness | Risk (I×P)   | Примечание                                                                                                                                                               |
| ------------------------ | ------------------------------------------- | -------------------------------------------------------------- | ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-001 Sandbox           | ✓ (docker inspect, негативные тесты)        | нет (writedirs конкретизируются в плане: /workspace rw + /tmp) | ✓            | **5×3=15**   | SC-001 measurable                                                                                                                                                        |
| FR-002 Checkpoints       | ✓ (байт-в-байт diff, US2.1)                 | нет (retention 50/500MB — Q2)                                  | ✓            | **4×4=16**   | конфликт-сценарий покрыт US2.3                                                                                                                                           |
| FR-003 Audit             | ✓ (перезапуск + запрос, US3.1)              | нет (surface — Q1: `/api/audit`)                               | ✓            | **5×3=15**   | corrupt-DB fail-closed покрыт US3.3                                                                                                                                      |
| FR-004 Verify gates      | ✓ (unit state machine, SC-004)              | нет (timeout 600s — Q3)                                        | ✓            | **4×4=16**   | SKIPPED ≠ PASSED закреплено                                                                                                                                              |
| FR-005 Destructive gate  | ✓ (one-shot по хешу, негатив SC-005)        | нет (алиас AWAITING_TOOL_APPROVAL, drift note)                 | ✓            | **5×4=20** ⚠ | **Risk ≥ 20 → обязательны Decision Table + State Transition + Exploratory Charter + UAT** (выполнено в qa/test-cases.md: DT-005, ST-001, EC-005; uat-scenarios.md UAT-2) |
| FR-006 Secret guard      | ✓ (маскирование в аудите US3.1)             | нет                                                            | ✓            | 4×3=12       | deny env в агентный контекст не пробрасывается                                                                                                                           |
| FR-007 Dependency gate   | ✓ (SC-006)                                  | нет (unpinned=block — Q4)                                      | ✓            | 3×3=9        | оффлайн-деградация определена                                                                                                                                            |
| FR-008 Policy & override | ✓ (valve_config_change, SC-007)             | нет                                                            | ✓            | 3×2=6        | G2/G3/G4/G5 не disable-able                                                                                                                                              |
| NFR-001 Latency          | ✓ (бенч: 3 прогрева/30 прогонов)            | нет                                                            | ✓            | 3×2=6        | Windows ×2 не блокирует                                                                                                                                                  |
| NFR-002 Determinism      | ✓ (одинаковые входы → одинаковые решения)   | нет                                                            | ✓            | 3×2=6        | ts исключён из сравнения                                                                                                                                                 |
| NFR-003 Fail-closed      | ✓ (негативные тесты startup_refused)        | нет                                                            | ✓            | **5×3=15**   | Constitution XIII.1                                                                                                                                                      |
| NFR-004 Offline          | ✓ (registry check деградирует в unverified) | нет                                                            | ✓            | 2×2=4        | —                                                                                                                                                                        |
| NFR-005 Overhead ≤5%     | ✓ (медиана по 10 задач)                     | нет                                                            | ✓            | 3×3=9        | Kill Criteria (a)                                                                                                                                                        |

## 2. Findings

- **F1 (note)**: FR-005 Risk=20 — глубокое QA-покрытие обязательно; в test-design заложено (DT-005, ST-001, EC-005, UAT-2). Не дефект.
- **F2 (note)**: 5 открытых NEEDS CLARIFICATION спецификации закрыты в rev 2 (Q1–Q5); в тексте не осталось NEEDS CLARIFICATION-маркеров.
- **F3 (note)**: отрицательные acceptance-сценарии (Constitution XIII.3) присутствуют на каждый security-FR: US1.2 (seccomp отказ), US1.3 (mount отказ), US2.2 (non-git отказ), US3.3 (corrupt DB отказ), US4.1 (самопризнание отклонено), US5.1 (само-апрув отклонён), US6.1 (install без решения отклонён).
- **F4 (LOW)**: wording US5/Independent Test использует имя `AWAITING_DESTRUCTIVE_APPROVAL`, FR-005 (rev 2) — алиас `AWAITING_TOOL_APPROVAL`. Не двусмысленность уровня REJECT: семантика идентична, план фиксирует реализацию. Рекомендация: при `/speckit.review` сверить.
- **F5 (LOW)**: срок kill-criteria «через 30 дней после релиза» — измеримо при существовании release-процесса; релизный контур 004 определяется в плане (метрики из FR-008-аудита). Уточнено в plan.md §Risks.

## 3. Verdict

- **PASS** — требований REJECT-класса (неверифицируемых, противоречивых, неполных до уровня блокировки) не найдено.
- Предварительная трассировка: [qa/preliminary-rtm.md](qa/preliminary-rtm.md).
- Гейт `/speckit.plan` — открыт.
