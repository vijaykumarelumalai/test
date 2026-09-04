# ADR-001: Technology Stack Selection
**Status:** Approved  
**Date:** 2026-09-04  

## Context
VK Traders requires a mobile-friendly Labour Attendance, Wage, and Loan Management platform with a high-fidelity Super Admin command center matching the client's visual mockup, as well as a frictionless worker mobile portal. Free-tier deployment feasibility is mandatory.

## Decision
Adopt **React 18 + Vite + Tailwind CSS** for the frontend, configured as a **Mobile Progressive Web App (PWA)**, with an **Express.js (TypeScript) REST API** backend.

## Alternatives Considered
1. *Flutter / React Native:* Great native performance, but requires Google Play / Apple App Store developer subscriptions ($99/year Apple, $25 Google) and lengthy app review processes for every update.
2. *Next.js Full-Stack:* Viable, but monolithic deployment limits easy separation of persistent cron schedulers on some free serverless tiers.
3. *Vite React PWA + Node REST API:* **Chosen.** Can be installed on any Android/iOS phone with 1 tap, zero app store friction, $0 cost, instant over-the-air updates, and full desktop browser responsiveness.

## Consequences
- Single codebase delivers both the desktop Super Admin dashboard and mobile worker portal.
- Zero hosting barrier for Phase 1.
