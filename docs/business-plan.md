# 🌐 Business Plan: UndeRoute (OmniRoute + Agentic AI Coding & Character PaaS)

**Version:** 2.0 (Staged Release Architecture Edition)  
**Date:** 2026-08-14  
**Brand:** `UndeRoute` (`underoute.dev`)  
**Status:** **Pre-revenue — Phase A Launch: 0 paying users / 0 closed nodes.**  
**Language:** RU

> **Hard Law (Phase A & MVP-1):**
>
> 1. **MVP-1**: 100% Local-First Open-Source IDE Core (Theme Engine + Sandboxed Plan/Act execution). Никакого сетевого оверхеда, платёжек и облаков в первом релизе.
> 2. **MVP-2**: Telegram Remote Relay ($9.99/mo) подключается только поверх проверенного локального агента.
> 3. **MVP-3**: Cloud Sync & Entitlement ($14.99/mo).
> 4. **MVP-4**: Marketplace & WoT Integrations.

---

## 🧾 Changelog

### v2.0 ← v1.2

| #   | Was                            | Now                                                                                                  | Why (link spec slug if any)               |
| :-- | :----------------------------- | :--------------------------------------------------------------------------------------------------- | :---------------------------------------- |
| 1   | Monolithic single-release plan | Staged Release Architecture (MVP-1 Local Core → MVP-2 Remote → MVP-3 Sync/Billing → MVP-4 Ecosystem) | Full architectural review audit alignment |

---

## 📖 1. Executive Summary & Staged Roadmap

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGED RELEASE ARCHITECTURE                                                 │
│                                                                             │
│ [MVP-1] Local Agentic IDE Core ($0)                                         │
│ └── Local Web IDE + 9 Personas (UGC/CDN) + Sandboxed Plan/Act Execution     │
│                                                                             │
│ [MVP-2] Remote Telegram Bridge ($9.99/mo Hero SKU)                          │
│ └── Noise_XX E2E Tunnel + Device Registry + OTP Pairing + Remote Approvals │
│                                                                             │
│ [MVP-3] Cloud Sync & Entitlement ($14.99/mo Pro)                            │
│ └── E2E Multi-Device History Sync + Entitlement Engine + TG Stars Billing   │
│                                                                             │
│ [MVP-4] Ecosystem & R&D                                                     │
│ └── Theme Creator Marketplace (70/30) + Offline WoT Replay Analyzer         │
└─────────────────────────────────────────────────────────────────────────────┘
```

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
