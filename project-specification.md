# VK Traders - Labour Attendance, Wage & Loan Management System
## Production-Grade Project Specification & Operational Guide

---

## 1. Project Overview
* **Client / Organization:** VK Traders
* **Worker ID Format:** `VK-001`, `VK-002`, `VK-003`... (Atomic, sequential)
* **Default Worker PIN:** Last 4 digits of the worker's 10-digit mobile number
* **Worker Types Supported:** Permanent Labour & Temporary Labour (Both on Daily Wage rates)
* **Mathematical Precision:** 100% deterministic calculation (`Gross = Σ(Factor × Rate)`, `Net = Gross - Advances - Loans`). Overtime strictly excluded per client instruction.

---

## 2. Core Modules Implemented

### 1. Super Admin Command Center (Matching UI Mockup)
* **Top 5 KPI Metric Cards:**
  * Total Labour Count (Blue card with trend indicator)
  * Permanent Labour (Emerald Green card)
  * Temporary Labour (Orange card)
  * Amount Paid to Labour (Current Month) (Purple card in ₹)
  * Total Advances & Loans (Crimson/Rose Red card in ₹)
* **Inline Attendance Marking Table:**
  * Interactive toggles: `Present` (1.0x, Green), `Absent` (0.0x, Red), `Half-Day` (0.5x, Yellow).
  * Direct inline editable Daily Wage (₹) text box.
  * "Mark All Present" shortcut.
  * Filter by site/department, worker type, or search by name/ID.
  * "Save Attendance" button with instant feedback.
* **Analytical Charts:**
  * Attendance Overview (Today): Donut progress chart showing Total, Present, Absent, Half-Day.
  * Cashflow Comparison: Side-by-side comparison bars for Amount Paid vs Advances.
* **Recent Activity Feeds:**
  * Recent Labour Added, Recent Payments, Pending Advances / Active Loans.

### 2. Labour Directory & Onboarding Engine
* Sequential ID generator starting at `VK-001`.
* Auto-assigns PIN as last 4 digits of phone.
* Generates Bilingual Tamil & English Welcome Message:
  * Permanent Worker Tamil: *"நீங்கள் வி.கே ட்ரேடர்ஸில் நிரந்தரப் பணியாளராக சேர்க்கப்பட்டுள்ளீர்கள். வி.கே ட்ரேடர்ஸ் குடும்பத்திற்கு உங்களை அன்புடன் வரவேற்கிறோம்!..."*
  * Temporary Worker Tamil: *"வி.கே ட்ரேடர்ஸுக்கு உங்களை வரவேற்கிறோம்!..."*
* Direct 1-click **WhatsApp** dispatch deep link (`wa.me`) for $0 instant messaging.

### 3. Advances & Loan Management
* Cash advances ledger: date, amount, payment mode (Cash/UPI/Bank), reason.
* Worker Loan system: loan ID (`LN-001`), principal, monthly deduction, balance remaining, repayment actions.

### 4. Automated Month-End Payroll & Reports
* Auto-compiles on month-end (28th/29th/30th/31st).
* Calculates days worked, gross wages, advance deductions, loan deductions, and net payable balance.
* Direct CSV export and printable ledger.

### 5. Automated Schedulers & Reminders
* 9:00 AM – 10:00 AM Morning Attendance reminder check.
* 8:00 PM – 9:00 PM Night Attendance closing alert check.
* In-app notification center with unread badge counter.

### 6. Labour Mobile Self-Service Portal
* Mobile-optimized view (PWA installable).
* Login: Mobile Number + 4-digit PIN.
* Shows days worked, gross wages earned, advances taken, and remaining net payable balance.
* Day-by-day attendance history list with colored status pills.

---

## 3. Quick Start & Execution Commands

```bash
# 1. Start full-stack server (Serves both API and React Web/Mobile UI)
npm run server

# 2. Access the Application in any browser:
http://localhost:5000

# 3. Super Admin Demo Login:
- URL: http://localhost:5000/
- Role: Super Admin (all access)

# 4. Worker Mobile Portal Demo Login:
- Click "Worker Mobile View" on the bottom left sidebar
- Phone: 9840111111
- PIN: 1111 (Ramesh Kumar VK-001)

# 5. Run Automated Tests:
node tests/wage-calculator.test.js
node tests/api-integration.test.js

# 6. Create Database Backup:
node scripts/backup-database.js
```
