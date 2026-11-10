# Preliminary RTM — 004-safe-harness-valves (draft, stage 2.5)

> Станет основой `qa/rtm-matrix.md` после `/speckit.tasks` (заполнится колонка Task) и `/speckit.test-design` (TC).

| Req                 | Risk   | Планируемое покрытие (TC)                                                                                         | Тип                                                          | Task (план) |
| ------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------- |
| FR-001              | 15     | TC-001..004 (inspect-проверка + негативы: запись, syscall, mount, fail-closed seccomp)                            | Integration (docker-gated) + Unit                            | T003–T004   |
| FR-002              | 16     | TC-005..008 (байт-в-байт откат, non-git отказ, unprotected-аудит, конфликт-подтверждение, retention BVA 49/50/51) | Integration + Unit                                           | T005–T006   |
| FR-003              | 15     | TC-009..012 (перезапуск/цепочка, corrupt DB отказ, маскирование, retry/пауза при блокировке)                      | Integration + Unit                                           | T002        |
| FR-004              | 16     | TC-013..015 (completion_blocked, SKIPPED≠PASSED, TIMEOUT)                                                         | Unit (state machine)                                         | T007        |
| FR-005              | **20** | TC-016..019 + **DT-005** + **ST-001** + **EC-005** (charter) + UAT-2                                              | Unit + Decision Table + State Transition + Exploratory + UAT | T008–T009   |
| FR-006              | 12     | TC-020..021 (deny .env-чтение, маскирование до записи)                                                            | Unit                                                         | T010        |
| FR-007              | 9      | TC-022..023 (install без решения отклонён, pin enforcement, оффлайн unverified)                                   | Unit                                                         | T011        |
| FR-008              | 6      | TC-024 (valve_config_change аудит; G2–G5 не отключаемы)                                                           | Unit                                                         | T012        |
| NFR-001             | 6      | TC-BENCH-01/02 (гейт p95<50мс, чекпоинт p95<500мс)                                                                | Perf bench                                                   | T014        |
| NFR-002             | 6      | покрывается unit-набором (детерминизм решений)                                                                    | Unit                                                         | T001–T012   |
| NFR-003             | 15     | негативные тесты всех клапанов (TC-004/008/012/019)                                                               | Unit/Integration                                             | сквозное    |
| NFR-004             | 4      | TC-022 (оффлайн-ветка)                                                                                            | Unit                                                         | T011        |
| NFR-005             | 9      | TC-BENCH-03 (медиана ≤5% по 10 задач) + golden benign set                                                         | Perf + Regression                                            | T014–T015   |
| SC-008 / regression | —      | RS-001..003 (см. qa/regression-suite.md)                                                                          | Regression                                                   | T015        |

Правило XII: Risk ≥ 20 → FR-005 имеет Decision Table + State Transition + Exploratory Charter + UAT (все четыре артефакта заложены).
