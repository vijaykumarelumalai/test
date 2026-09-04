# ADR-002: Database & Data Modeling Strategy
**Status:** Approved  
**Date:** 2026-09-04  

## Context
The application handles critical financial data: worker daily wage rates, attendance records, advances, and amortized loans. Calculations must be 100% deterministic with strict referential integrity.

## Decision
Adopt a relational schema with **SQLite** for development and local testing, designed with strict SQL syntax compatible with **PostgreSQL** (Supabase / Neon free cloud tier) for cloud deployment.

## Key Rules
- Strict foreign keys (`ON DELETE RESTRICT` for workers with attendance/financial history to prevent accidental audit loss).
- Soft delete (`is_active: boolean`) on workers.
- Sequential Labour IDs formatted as `VK-XXX` (e.g. `VK-001`, `VK-002`) generated atomically.
- All monetary columns represented as fixed precision numeric / integer paisa or cents to eliminate floating-point rounding errors.
