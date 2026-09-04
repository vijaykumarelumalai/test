-- Database Schema: VK Traders Labour Management System
-- Engine: SQLite 3 (node:sqlite native)

PRAGMA foreign_keys = ON;

-- 1. Workers Table
CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    labour_id TEXT UNIQUE NOT NULL, -- e.g. VK-001, VK-002
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    worker_type TEXT NOT NULL CHECK (worker_type IN ('PERMANENT', 'TEMPORARY')),
    department TEXT NOT NULL DEFAULT 'Construction Site A',
    daily_wage REAL NOT NULL CHECK (daily_wage >= 0),
    pin_hash TEXT NOT NULL,
    joining_date TEXT NOT NULL,
    emergency_contact TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workers_labour_id ON workers(labour_id);
CREATE INDEX IF NOT EXISTS idx_workers_phone ON workers(phone);

-- 2. Daily Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
    date TEXT NOT NULL, -- YYYY-MM-DD
    status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY')),
    wage_factor REAL NOT NULL CHECK (wage_factor IN (1.0, 0.5, 0.0)),
    effective_daily_wage REAL NOT NULL CHECK (effective_daily_wage >= 0),
    earned_amount REAL NOT NULL CHECK (earned_amount >= 0),
    remarks TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (worker_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_worker_date ON attendance(worker_id, date);

-- 3. Cash Advances Table
CREATE TABLE IF NOT EXISTS advances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
    date TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    payment_mode TEXT NOT NULL DEFAULT 'CASH' CHECK (payment_mode IN ('CASH', 'UPI', 'BANK')),
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SETTLED')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_advances_worker ON advances(worker_id);
CREATE INDEX IF NOT EXISTS idx_advances_date ON advances(date);

-- 4. Long-Term Worker Loans Table
CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
    loan_id TEXT UNIQUE NOT NULL, -- e.g. LN-001
    principal_amount REAL NOT NULL CHECK (principal_amount > 0),
    disbursed_date TEXT NOT NULL,
    monthly_deduction REAL NOT NULL CHECK (monthly_deduction >= 0),
    balance_remaining REAL NOT NULL CHECK (balance_remaining >= 0),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAID_OFF')),
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Loan Repayments Table
CREATE TABLE IF NOT EXISTS loan_repayments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
    date TEXT NOT NULL,
    amount_deducted REAL NOT NULL CHECK (amount_deducted > 0),
    remaining_after REAL NOT NULL CHECK (remaining_after >= 0),
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Month-End Payroll Snapshots Table
CREATE TABLE IF NOT EXISTS monthly_payrolls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month_year TEXT NOT NULL, -- YYYY-MM
    worker_id INTEGER NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
    days_present REAL NOT NULL,
    days_half REAL NOT NULL,
    days_absent REAL NOT NULL,
    gross_wage REAL NOT NULL,
    advances_deducted REAL NOT NULL,
    loan_deducted REAL NOT NULL,
    net_payable REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'GENERATED' CHECK (status IN ('GENERATED', 'PAID')),
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (worker_id, month_year)
);

-- 7. Notifications & Alerts Table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('ATTENDANCE_REMINDER', 'MONTH_END_REPORT', 'LOAN_ALERT', 'ONBOARDING')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    tamil_message TEXT,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Organization & System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
