# QA Contour Waiver (Constitution XII, chore-only carve-out)

- **Feature**: 006-constitution-wiring-fix
- **Waived**: `/speckit.test-design` (Stage 5.5) и `/speckit.qa-signoff` (Stage 8.5).
- **Not waived**: `/speckit.requirements-audit` (Stage 2.5) и `/speckit.analyze` — остаются гейтами этой спеки.
- **Reason**: ноль runtime-поверхности (NFR-003: только `.md`/`.json`/`.sh`); acceptance criteria каждого FR grep/командно-исполнимы (NFR-002), чек-лист SC-001 заменяет RTM/UAT артефакты. При выборе Q1a (CI workflow) проверка pinned-actions/least-privilege включается в analyze (STRIDE условие спеки).
- **Date**: 2026-11-15
