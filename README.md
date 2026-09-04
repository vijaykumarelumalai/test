# VK Traders - Labour Attendance, Wage & Loan Management System

Production-grade full-stack mobile-first web application for **VK Traders**. Built to manage worker attendance, daily wage computations, cash advances, worker loans, and automated month-end payroll ledgers.

---

## Key Features
- **Super Admin Command Center:** High-fidelity dashboard matching the client's visual reference with 5 KPI summary cards, inline daily attendance marking table with Present/Absent/Half-Day buttons, variable wage text boxes, analytics donut and bar charts, and recent activity feeds.
- **Sequential Labour IDs (`VK-001`...):** Atomic sequential ID generation.
- **Worker Default Credentials:** Automatic 4-digit PIN generation (last 4 digits of phone number).
- **Bilingual Onboarding Messages (Tamil & English):** Welcome SMS templates and instant one-click WhatsApp dispatch link (`wa.me`) at $0 cost.
- **Advances & Loan Ledger:** Track cash advances and long-term amortized employee loans with monthly salary deductions.
- **Deterministic Wage Calculations:** Net Payable = (Days Worked × Rate) - Advances - Loan Deductions.
- **Scheduled Notifications:** Daily reminders at 9:00 AM and 8:00 PM; month-end automatic payroll generation on 28th/29th/30th/31st.
- **Worker Mobile Portal:** Clean mobile self-service view for workers to check attendance, earnings, advances, and net balance from anywhere.

---

## How to Run

```bash
# Start the full-stack server (Serves both API and compiled React PWA frontend)
npm run server
```
Then open **`http://localhost:5000`** in your browser.

---

## Running Automated Tests
```bash
node tests/wage-calculator.test.js
node tests/api-integration.test.js
```

---

## Backup and Disaster Recovery
```bash
# Create database backup
node scripts/backup-database.js

# Restore database
node scripts/restore-database.js <backup_filename>
```
