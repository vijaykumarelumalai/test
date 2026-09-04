# ADR-003: Authentication & Authorization Strategy
**Status:** Approved  
**Date:** 2026-09-04  

## Context
Two distinct user groups exist with fundamentally different requirements:
1. **Super Admin:** Requires Google OAuth (Single Sign-On) and/or secure master credentials with access to all financial data, reports, and controls.
2. **Workers (Labour):** Need a simple, zero-friction mobile login using only their Registered Phone Number + 4-digit PIN (defaulted to last 4 digits of their phone).

## Decision
- Implement standard JWT (JSON Web Token) based session handling with Role-Based Access Control (`role: 'SUPER_ADMIN' | 'LABOUR'`).
- Super Admin: Supports Google OAuth verification + local master bypass/credentials for quick setup.
- Labour: Phone + bcrypt-hashed 4-digit PIN. Token payload embeds `workerId`, strictly scoping queries so labourers cannot access peer records.
