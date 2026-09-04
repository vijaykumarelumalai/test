# Architecture Specification - VK Traders Labour Management System
**Document Version:** 1.0.0  
**Current State:** ARCHITECTURE  
**Target Platform:** Mobile-First Responsive PWA + Web Dashboard  
**Date:** 2026-09-04  

---

## 1. System Overview & Architectural Topology

```
                  ┌────────────────────────────────────────────────────────┐
                  │                       CLIENT TIER                      │
                  │  Mobile App (PWA) / Desktop Web Application (React)    │
                  │   - Super Admin Command Center (Matching UI Mockup)    │
                  │   - Labour Mobile Self-Service Portal (Phone + PIN)    │
                  └───────────────────────────┬────────────────────────────┘
                                              │ HTTPS / REST API / JSON
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │                      API GATEWAY                       │
                  │  Express.js / Node.js TypeScript REST Server (v1)      │
                  │   - JWT Auth & Role-Based Access Control (RBAC)        │
                  │   - Rate Limiting & Input Validation (Zod)             │
                  │   - Error Handling Middleware & Audit Logging          │
                  └───────────────┬────────────────────────┬───────────────┘
                                  │                        │
                 Internal Calls   │                        │ Scheduled Crons
                                  ▼                        ▼
        ┌────────────────────────────────────┐   ┌──────────────────────────────┐
        │          CORE SERVICES             │   │    BACKGROUND WORKERS        │
        │ - Worker & Labour ID Engine        │   │ - Daily Reminder Scheduler   │
        │ - Attendance & Wage Math Engine    │   │   (9:00 AM & 8:00 PM checks) │
        │ - Advances & Loan Amortization     │   │ - Month-End Payroll Engine   │
        │ - Bilingual SMS / WhatsApp Service │   │   (28th/29th/30th/31st runs) │
        │ - Report Exporter (PDF & Excel)    │   │ - In-App Notification Engine │
        └─────────────────┬──────────────────┘   └──────────────┬───────────────┘
                          │                                     │
                          └──────────────────┬──────────────────┘
                                             ▼
                  ┌────────────────────────────────────────────────────────┐
                  │                      DATA TIER                         │
                  │  Relational Database (SQLite Local / PostgreSQL Prod)   │
                  │   - Strict Foreign Keys, Indexes, Unique Constraints   │
                  │   - Deterministic Financial Records & Audit Log        │
                  └────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack & Justification

| Layer | Technology | Selection Rationale |
|---|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS + Lucide Icons | Lightning-fast build times, mobile-first responsive utility styling, zero-latency state transitions, matches high-fidelity UI mockup. |
| **Mobile PWA** | Web App Manifest + Service Worker | Installable on Android & iOS homescreens like a native app with offline shell, zero App Store approval delays, $0 developer license fees. |
| **Charts** | Recharts / Chart.js | Lightweight, responsive donut & bar charts for Today's Attendance and Monthly Payments vs Advances. |
| **Backend** | Node.js + Express.js (TypeScript) | High concurrency, type-safe API contracts, fast JSON serialization, massive ecosystem for scheduling and PDF/Excel generation. |
| **Database** | SQLite (Dev) / PostgreSQL (Prod) | Zero-friction local setup with file persistence; seamlessly scalable to free-tier cloud PostgreSQL (Supabase/Neon). |
| **Scheduling** | `node-cron` | Lightweight in-process scheduler for 9-10 AM & 8-9 PM attendance check triggers and month-end automated salary ledger compilation. |
| **Messaging** | Bilingual Notification Service (Tamil & English) | Automatic message generation for Permanent & Temporary workers with one-tap WhatsApp deep link dispatch ($0 cost) + SMS gateway extensibility. |
| **Report Engine** | PDFKit / jsPDF + SheetJS (XLSX) | Client/server automated PDF pay-slip rendering and downloadable multi-column attendance Excel spreadsheets. |

---

## 3. Security & Threat Modeling

| Threat | Risk Level | Mitigation Strategy | Verification Test |
|---|---|---|---|
| **Worker Data Snooping** | High | Workers authenticate strictly via phone + 4-digit PIN; RBAC middleware enforces tenant isolation so a worker can query only their own `worker_id`. | TC-SEC-001: Worker token cannot access `/api/v1/workers` or other workers' summaries. |
| **Wage Calculation Tampering** | Critical | Client inputs never compute balances. Daily wage rate and net payable formulas are strictly calculated on the backend. | TC-SEC-002: Backend validates attendance factor (1.0, 0.5, 0.0) and recomputes all totals. |
| **Brute Force on Worker PINs** | Medium | Rate-limiting on `/api/v1/auth/worker-login` (max 5 failed attempts per 15 minutes per IP). | TC-SEC-003: 6th invalid PIN attempt returns HTTP 429 Too Many Requests. |
| **Audit Loss on Record Edit** | High | Soft deletion for workers (`is_active: false`); all attendance wage overrides and advance edits include modified timestamps and admin audit logs. | TC-SEC-004: Deactivating a worker preserves past attendance and financial summaries. |

---

## 4. Performance & SLA Targets

```
Metric                             Target SLA           Verification
API Response Time (p95)            < 250 ms             Automated load test
Dashboard Render Time              < 800 ms             Lighthouse audit
Database Query Latency             < 20 ms              Indexed primary/foreign keys
Report Compilation (100+ workers)  < 2.5 seconds        Bulk aggregation benchmark
Mobile Touch Latency               < 100 ms             Hardware accelerated CSS
```
