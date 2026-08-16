# 🌐 Business Plan: UndeRoute (OmniRoute + Agentic AI Coding & Character PaaS)

**Version:** 3.0 (Dual-Track US Strategic & Commercial Edition)  
**Date:** 2026-08-14  
**Brand:** `UndeRoute` (`underoute.dev`)  
**Status:** **Pre-revenue — Phase A Launch: 0 paying users / 0 closed nodes.**  
**Language:** RU

> **Hard Law (Phase A & Strategic Execution):**
>
> 1. **Dual-Track Execution**: Продукт четко разделен на **Security Infrastructure Core** (Zero-Trust Sandboxing, Noise_XX Protocol, AST Tree-Sitter) для юридического IP, грантов и петиций на визу США (EB-2 NIW / O-1A), и **Commercial App Layer** (Темы персонажей, Telegram Stars, Cloud Relay) для генерации денежного потока.
> 2. **MVP-1**: 100% Local-First Open-Source IDE Core (Theme Engine + Sandboxed Plan/Act execution). Никакого сетевого оверхеда и облаков в первом релизе.
> 3. **MVP-2**: Telegram Remote Relay ($9.99/mo) подключается только поверх проверенного локального агента.
> 4. **MVP-3**: Cloud Sync & Entitlement ($14.99/mo).
> 5. **MVP-4**: Marketplace & WoT Integrations.

---

## 🧾 Changelog

### v3.0 ← v2.0

| #   | Was                  | Now                                                                                       | Why (link spec slug if any)                                |
| :-- | :------------------- | :---------------------------------------------------------------------------------------- | :--------------------------------------------------------- |
| 1   | Commercial-only plan | Dual-Track Positioning (US Immigration / EB-2 NIW / O-1 Security Core + B2C/B2B PaaS App) | Alignment with `underoute-for-usa-visa.md` strategic paper |

---

## 📖 1. Executive Summary & Staged Roadmap

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ DUAL-TRACK STRATEGIC POSITIONING                                            │
│                                                                             │
│ 🛡️ TRACK 1: SECURITY CORE (US Immigration EB-2 NIW / O-1A / IP Portfolio)  │
│ └── Zero-Trust Agent Sandbox (seccomp/nsjail) + Noise_XX Protocol + Whitepaper│
│                                                                             │
│ 🚀 TRACK 2: COMMERCIAL PAAS APP (Cashflow & User Growth)                    │
│ └── 9 Character Themes + TG Cloud Relay ($9.99) + Sync Pro + Skin Market    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ 1b. Strategic Alignment: US Immigration & National Importance (EB-2 NIW / O-1A)

Для подтверждения национальной значимости проекта в США по прецеденту **Matter of Dhanasar (26 I&N Dec. 884)** техническое ядро вынесено в отдельный открытый фреймворк безопасности:

### 3-Prong Dhanasar Alignment

1. **Prong 1: Substantial Merit & National Importance (Кибербезопасность ИИ-агентов)**:
   - В 2026 году автономные AI-агенты получают доступ к терминалу. UndeRoute решает критическую проблему кибербезопасности США: **zero-trust изоляция (nsjail/seccomp/cap-drop), cgroups лимиты (512MB/1 core), E2E протокол Noise_XX и неприкосновенность хостовых секретов**.
   - _Endeavor Title_: «Разработка и внедрение zero-trust архитектур безопасного исполнения кода и криптографических протоколов управления автономными AI-агентами для защиты IT-инфраструктуры США».

2. **Prong 2: Well Positioned to Advance the Endeavor (Метрики и Hard Evidence)**:
   - **Whitepaper**: Публикация технического документа _"Hardening Autonomous AI Agent Execution: Sandboxing, Syscall Filtering, and Mutual Zero-Knowledge Remote Attestation via Noise_XX"_ на arXiv / HackerNews.
   - **Open-Source Hard Metrics**: Рост 500+ звёзд на GitHub, тысячи скачиваний пакета npm/docker, форки и открытые PR.
   - **Expert Opinion Letters**: 4–6 независимых рекомендательных писем от US Tech Leads и экспертов по кибербезопасности.

3. **Prong 3: Benefit of Waiving Labor Certification (Отмена PERM)**:
   - Скорость развития AI-агентов требует сквозного открытого стандарта безопасности. Распространение открытого ядра UndeRoute ускоряет внедрение стандартов безопасности во всех IT-компаниях США.

---

## 💰 2. Staged Offer Ladder & Pricing

| Release   | SKU                   | Scope (fixed)                                                                                                   | Price                       | Pay Terms                  |
| :-------- | :-------------------- | :-------------------------------------------------------------------------------------------------------------- | :-------------------------- | :------------------------- |
| **MVP-1** | **Local Core**        | Local IDE, OmniRoute Gateway, 9 Base Personas (UGC/CDN), Sandboxed Plan/Act Execution, Local SQLite Audit Trail | **$0** (FOSS)               | Free forever               |
| **MVP-2** | **TG Cloud Relay**    | E2E Noise_XX Remote Tunnel, OTP Pairing, Voice-to-Code, Telegram Mini App (TWA) Monaco Diff Viewer              | **$9.99 / mo** (600 Stars)  | Monthly Auto-Renew         |
| **MVP-3** | **Sync & Relay Pro**  | Multi-device E2E Sync (Session History, Persona Configs, Repo Map Cache), Entitlement Engine                    | **$14.99 / mo** (900 Stars) | Monthly Auto-Renew         |
| **MVP-3** | **Team Hub PaaS**     | Shared Team Workspaces, Office GPU Balancer, Centralized API Keys, Audit Logs                                   | **$29 / user / mo**         | Monthly / Annual           |
| **MVP-4** | **Theme Marketplace** | Creator Skins & Custom Personas                                                                                 | **$1.99–$9.99**             | 70% Creator / 30% Platform |

---

## 📊 5. Unit Economics & OPEX Floor

### OPEX Floor (MVP-2 / MVP-3 Phase)

| Item                                                     | Estimate (Phase A) |
| :------------------------------------------------------- | :----------------- |
| Relay Infra (2x Hetzner VPS + Cloudflare)                | $25 / mo           |
| Sync & Auth Storage (Supabase Postgres + Object Storage) | $15 / mo           |
| Payment Gateway Fees (~20% average)                      | ~20% от выручки    |
| **TOTAL FIXED OPEX**                                     | **~$40 / mo**      |

### Deal Math (Breakeven @ MVP-2)

| Metric                  | Value              |
| :---------------------- | :----------------- |
| **Target ARPU**         | $11.49 / mo        |
| **Fixed Monthly OPEX**  | $40.00 / mo        |
| **Breakeven Point**     | **4 paying users** |
| **Gross Profit Margin** | **68% – 76%**      |

---

## 🎯 Summary

- **Двойное позиционирование**: Идеологическое и инженерное ядро (Zero-Trust Sandbox, Noise_XX) пакуется как научный/стратегический фреймворк кибербезопасности США (EB-2 NIW / O-1A), а потребительское приложение (Темы, Telegram Remote, PaaS) генерирует коммерческий поток.
- Финансовая модель сверхустойчивая: точка безубыточности — всего **4 платящих пользователя**.
