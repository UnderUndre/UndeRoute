# RTM Matrix — 004-safe-harness-valves (stage 5.5, ISO/IEC/IEEE 29119-3)

> Трассировка: FR/NFR ↔ Task ↔ TC ↔ Evidence. Коммиты/PR проставляются в имплементации (Principle XII: FR ↔ Task ↔ Commit/PR ↔ TC ↔ Bug).

| Req         | Risk   | Task       | Test cases                                             | Нужен Commit/PR |
| ----------- | ------ | ---------- | ------------------------------------------------------ | --------------- |
| FR-001      | 15     | T004       | TC-001, TC-002, TC-003, TC-004 (docker-gated)          | impl            |
| FR-002      | 16     | T005, T006 | TC-005, TC-006, TC-007, TC-008 (BVA 49/50/51)          | impl            |
| FR-003      | 15     | T002       | TC-009, TC-010, TC-011, TC-012                         | impl            |
| FR-004      | 16     | T007       | TC-013, TC-014, TC-015                                 | impl            |
| FR-005      | **20** | T008, T009 | TC-016..019, **DT-005**, **ST-001**, **EC-005**, UAT-2 | impl            |
| FR-006      | 12     | T010       | TC-020, TC-021                                         | impl            |
| FR-007      | 9      | T011       | TC-022, TC-023                                         | impl            |
| FR-008      | 6      | T012       | TC-024                                                 | impl            |
| NFR-001     | 6      | T014       | TC-BENCH-01, TC-BENCH-02                               | impl            |
| NFR-002     | 6      | T001–T012  | покрывается unit-детерминизмом (TC-016 прогон дважды)  | impl            |
| NFR-003     | 15     | сквозное   | TC-004, TC-008, TC-010, TC-019 (fail-closed негативы)  | impl            |
| NFR-004     | 4      | T011       | TC-022 (offline-ветка)                                 | impl            |
| NFR-005     | 9      | T014, T015 | TC-BENCH-03 + RS-001                                   | impl            |
| SC-001..008 | —      | T004..T015 | см. test-cases.md §SC                                  | impl            |

Покрытие: каждый FR/NFR имеет ≥1 TC; FR-005 (Risk 20) — все 4 артефакта (DT/ST/EC/UAT). RTM полон без пробелов.
