# Requirement Traceability Matrix (RTM) - VK Traders
**Current State:** REQUIREMENTS_APPROVED  
**Company:** VK Traders  
**Date:** 2026-09-04  

| Req ID | Module | Role | Feature Summary | Priority | DB Entity | API Route | UI Component | Test Case ID | Status |
|---|---|---|---|---|---|---|---|---|---|
| REQ-001 | Labour | Super Admin | Auto-generate sequential Labour ID starting at `VK-001` | P0 | `workers` | `POST /api/v1/workers` | `WorkerCreateModal` | TC-WRK-001 | Approved |
| REQ-002 | Auth | Super Admin / Labour | Worker PIN auto-generation (last 4 digits of phone) & login | P0 | `workers` | `POST /api/v1/auth/worker-login` | `WorkerLoginForm` | TC-AUTH-001 | Approved |
| REQ-003 | Onboarding | Super Admin / Labour | Bilingual SMS/WhatsApp welcome trigger (Tamil & English) | P1 | `sms_logs`, `notifications` | `POST /api/v1/workers/:id/welcome-msg` | `WorkerWelcomeToast` | TC-MSG-001 | Approved |
| REQ-004 | Dashboard | Super Admin | 5 KPI Cards: Total, Permanent, Temporary, Monthly Wages, Advances | P0 | Multiple / Aggregation | `GET /api/v1/dashboard/metrics` | `MetricCardsRow` | TC-DSH-001 | Approved |
| REQ-005 | Dashboard | Super Admin | Inline quick daily attendance table with Present/Absent/Half-Day | P0 | `attendance` | `POST /api/v1/attendance/save-daily` | `DashboardAttendanceWidget` | TC-ATT-001 | Approved |
| REQ-006 | Dashboard | Super Admin | Analytics charts: Attendance donut & Payments vs Advances bar | P1 | Aggregation view | `GET /api/v1/dashboard/charts` | `AttendanceDonut`, `CashFlowBar` | TC-DSH-002 | Approved |
| REQ-007 | Attendance | Super Admin | Variable daily wage override per worker during attendance entry | P0 | `attendance` | `POST /api/v1/attendance` | `WageOverrideInput` | TC-WAG-001 | Approved |
| REQ-008 | Advances | Super Admin | Record & edit cash advances (Worker, Amount, Date, Remarks) | P0 | `advances` | `POST /api/v1/advances`, `PUT /api/v1/advances/:id` | `AdvancesTableScreen` | TC-ADV-001 | Approved |
| REQ-009 | Loan | Super Admin | Worker Loan tracking with monthly deduction & balance tracking | P0 | `loans`, `loan_repayments` | `POST /api/v1/loans`, `GET /api/v1/loans` | `LoanManagementScreen` | TC-LON-001 | Approved |
| REQ-010 | Report | Super Admin | Automated month-end payroll ledger (PDF/Excel download & email) | P0 | `monthly_payrolls` | `GET /api/v1/reports/monthly-ledger` | `MonthlyReportScreen` | TC-REP-001 | Approved |
| REQ-011 | Notification | Super Admin | Daily reminders (9-10 AM morning & 8-9 PM night) | P1 | `reminders` | Background cron scheduler | `ReminderBanner` | TC-NOTIF-001 | Approved |
| REQ-012 | Settings | Super Admin | Company profile (VK Traders), shift times, sites, auth config | P1 | `settings` | `GET /api/v1/settings`, `PUT /api/v1/settings` | `SettingsScreen` | TC-SET-001 | Approved |
| REQ-013 | Worker View | Labour | Mobile read-only personal attendance & wage dashboard | P1 | `workers`, `attendance`, `advances` | `GET /api/v1/labour/my-summary` | `LabourMobileHome` | TC-LBR-001 | Approved |
