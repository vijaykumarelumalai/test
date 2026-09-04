# ADR-004: Scheduling & Notification Architecture
**Status:** Approved  
**Date:** 2026-09-04  

## Context
Two critical time-based events are mandated by the client:
1. Daily attendance reminders for the Super Admin at **9:00 AM – 10:00 AM** and **8:00 PM – 9:00 PM** if today's attendance has not been completed.
2. Automated monthly wage/payroll compilation on the **last day of each month (28/29/30/31)** at 23:59.
3. Bilingual Tamil/English welcome message dispatch upon worker onboarding.

## Decision
- Utilize `node-cron` inside the backend service for deterministic scheduling.
- Super Admin reminders: Emits real-time in-app notification records visible in the top header bell and modal alert banner.
- Month-End Payroll Engine: Automatically snapshots the month's total days worked, advances, and loan repayments into an immutable `monthly_payrolls` table, ready for instant PDF/Excel export.
- Bilingual SMS: System prepares the pre-formatted Tamil & English message and provides:
  1. Automated in-app SMS log.
  2. One-click instant WhatsApp Web / App direct dispatch link (`wa.me`) for $0 messaging.
  3. Pluggable SMS gateway hook for direct cellular SMS delivery.
