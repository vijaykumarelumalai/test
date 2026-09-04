# Software Requirements Specification (SRS)
## Project: VK Traders - Labour Attendance, Wage & Loan Management System
**Document Version:** 1.1.0  
**Current State:** REQUIREMENTS_APPROVED  
**Company:** VK Traders  
**ID Schema:** `VK-001`, `VK-002`, `VK-003`...  
**Date:** 2026-09-04  

---

## 1. Executive Summary & Business Objective
The **VK Traders Labour Management System** is a mobile-responsive, production-grade enterprise platform designed to manage worker profiles, daily attendance, variable daily wage calculations, cash advances, worker loans, and automated month-end salary generation for VK Traders.

It replaces paperwork and mental arithmetic with a 100% deterministic, auditable system. The application features a dedicated **Super Admin Dashboard** (with embedded quick-attendance marking, real-time analytics, and reminder triggers) and a **Worker Mobile Self-Service Portal** (accessible via Mobile Number + 4-digit PIN).

---

## 2. Organization Details & Naming Standard
* **Organization Name:** VK Traders
* **Worker ID Format:** `VK-001`, `VK-002`, `VK-003` (strictly sequential, 3-digit zero-padded).
* **Worker Default PIN:** Last 4 digits of the worker's registered mobile phone number.
* **Onboarding Notifications (Bilingual Tamil & English):**
  * **Permanent Labour Welcome SMS/Message:**
    * *English:* "You are onboarded as a permanent worker at VK Traders. Welcome to the VK Traders family! Have a good day. Your ID: {LABOUR_ID}, PIN: {PIN}."
    * *Tamil:* "நீங்கள் வி.கே ட்ரேடர்ஸில் நிரந்தரப் பணியாளராக சேர்க்கப்பட்டுள்ளீர்கள். வி.கே ட்ரேடர்ஸ் குடும்பத்திற்கு உங்களை அன்புடன் வரவேற்கிறோம்! இனிய நாளாக அமையட்டும். உங்கள் பணியாளர் எண்: {LABOUR_ID}, பின்: {PIN}."
  * **Temporary Labour Welcome SMS/Message:**
    * *English:* "Welcome to VK Traders! You are registered as temporary daily-wage labour. Your ID: {LABOUR_ID}, PIN: {PIN}."
    * *Tamil:* "வி.கே ட்ரேடர்ஸுக்கு உங்களை வரவேற்கிறோம்! உங்கள் பணியாளர் எண்: {LABOUR_ID}, பின்: {PIN}."

---

## 3. Core Modules & Granular Specification

### Module 1: Dashboard (Central Command Center)
* **Top Metric Cards:**
  1. **Total Labour Count** (Total active workers, with month-over-month trend %)
  2. **Permanent Labour Count** (Count of permanent workers)
  3. **Temporary Labour Count** (Count of temporary daily-wage workers)
  4. **Amount Paid to Labour** (Gross wages payable/paid for the current month in ₹)
  5. **Total Advances & Loans** (Outstanding cash advances and active loan balances in ₹)
* **Direct Daily Attendance Marking Widget:**
  * Displays today's date with date-picker override.
  * Search & Filter bar (Filter by All, Site/Department, Permanent, Temporary).
  * Quick table: Checkbox, #, Labour ID (`VK-XXX`), Name, Type Badge, Department/Site, Action Buttons (`Present` in Green, `Absent` in Red, `Half Day` in Yellow).
  * Primary Action: **"Save Attendance"** button with immediate optimistic feedback and server persistence.
* **Visual Analytical Widgets:**
  * **Attendance Overview (Today):** Radial/donut chart showing Total Workers, Present count, Absent count, Half-day count.
  * **Payment & Advances (This Month):** Side-by-side comparison bar chart (Amount Paid vs Advances Issued).
* **Recent Activity Tables:**
  * **Recent Labour Added:** Name, Type, Onboarding Date.
  * **Recent Payments / Disbursements:** Name, Amount (₹), Date.
  * **Pending Advances / Active Loans:** Name, Amount (₹), Date.

---

### Module 2: Labour Management (Worker Directory)
* **Worker Profile Creation:**
  * Auto-generates `VK-XXX` sequential ID.
  * Fields: Full Name, Mobile Phone (10 digits), Worker Type (`Permanent` / `Temporary`), Department/Site (e.g. Construction Site A, Site B, Maintenance), Default Daily Wage (₹), Joining Date, Photo (optional), Emergency Contact.
  * Auto-sets PIN to the last 4 digits of phone number.
  * Instant SMS / WhatsApp trigger with bilingual Tamil/English greeting.
* **Worker Status Lifecycle:**
  * Active / On-Leave / Inactive (Soft delete to protect financial audit trail).

---

### Module 3: Attendance Management
* **Status Rules & Math:**
  * `Present`: 1.0 Day.
  * `Half-Day`: 0.5 Day.
  * `Absent`: 0.0 Day.
* **Daily Rate Flexibility:**
  * Each worker defaults to their profile daily rate, with instant inline wage adjustment for special days.
* **Audit & Retroactive Corrections:**
  * Ability to navigate to past dates and adjust attendance with audit logs.

---

### Module 4: Advances Tracking
* **Cash Advances Ledger:**
  * Log cash/UPI advances given during the work week/month.
  * Fields: Worker, Date, Advance Amount (₹), Payment Mode (Cash/UPI/Bank), Reason, Status (`Deducted` / `Pending Settlement`).
  * Editable records with balance recalculation.

---

### Module 5: Loan Management
* **Worker Loans System:**
  * Distinct from short-term daily advances (loans are larger sums amortized across multiple pay cycles).
  * Fields: Worker ID, Loan Principal Amount (₹), Disbursed Date, Repayment Mode (Fixed monthly/weekly deduction), Deduction per Cycle (₹), Balance Remaining (₹), Loan Status (`Active` / `Repaid`).
  * Auto-deduction integration into month-end salary calculation.

---

### Module 6: Reports & Automated Exports
* **Automated Month-End Payroll Generation:**
  * Runs on the 28th, 29th, 30th, or 31st (month-end 23:59).
  * Calculates: `Net Payable = (Days Worked × Daily Rate) - Advances Deducted - Loan Deductions`.
  * Generates printable PDF Salary Slips and Excel/CSV summary ledgers.
  * In-app one-click download & optional email delivery to Super Admin.

---

### Module 7: Notifications & Reminders
* **Daily Attendance Reminders:**
  * Morning Reminder window: **9:00 AM – 10:00 AM**.
  * Night Reminder window: **8:00 PM – 9:00 PM**.
  * Checks if attendance for today is marked; triggers in-app notification badge and alert banner.
* **In-App Notification Center:**
  * Dropdown bell icon tracking unread alerts, loan installments, and monthly reports.

---

### Module 8: Settings & Company Profile
* Company Name: VK Traders.
* Contact, Site list, Default shift timings, Notification preferences, Google OAuth setup.

---

### Module 9: Worker Mobile View (User Dashboard)
* Dedicated clean mobile login: Phone + 4-digit PIN.
* Read-only view:
  * Monthly attendance calendar (green/yellow/red dots).
  * Days worked summary (Present / Half-day / Absent).
  * Gross earnings this month.
  * Advances taken & Loan balances.
  * Estimated net payable balance.
