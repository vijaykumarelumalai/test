const { db, get, query } = require('./index');
const crypto = require('node:crypto');

function hashPin(pin) {
  // Simple sha256 salt+hash for PIN demonstration
  return crypto.createHash('sha256').update(`vktraders_salt_${pin}`).digest('hex');
}

console.log('Seeding VK Traders Database...');

// Insert System Settings
const settings = [
  ['company_name', 'VK Traders'],
  ['morning_reminder_time', '09:00'],
  ['night_reminder_time', '20:00'],
  ['super_admin_email', 'admin@vktraders.com'],
  ['contact_phone', '+91 98765 43210'],
  ['currency_symbol', '₹']
];

const insertSetting = db.prepare('INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)');
for (const [k, v] of settings) {
  insertSetting.run(k, v);
}

// Insert Workers (Starting with VK-001)
const initialWorkers = [
  { labour_id: 'VK-001', name: 'Ramesh Kumar', phone: '9840111111', type: 'PERMANENT', dept: 'Construction Site A', wage: 800, date: '2025-01-10' },
  { labour_id: 'VK-002', name: 'Suresh M', phone: '9840222222', type: 'TEMPORARY', dept: 'Construction Site A', wage: 750, date: '2025-02-15' },
  { labour_id: 'VK-003', name: 'Kavitha R', phone: '9840333333', type: 'PERMANENT', dept: 'Maintenance', wage: 700, date: '2025-01-05' },
  { labour_id: 'VK-004', name: 'Arun Prakash', phone: '9840444444', type: 'TEMPORARY', dept: 'Construction Site B', wage: 850, date: '2025-03-01' },
  { labour_id: 'VK-005', name: 'Selvam T', phone: '9840555555', type: 'TEMPORARY', dept: 'Construction Site B', wage: 800, date: '2025-03-12' },
  { labour_id: 'VK-006', name: 'Priya S', phone: '9840666666', type: 'PERMANENT', dept: 'Construction Site A', wage: 900, date: '2025-02-01' },
  { labour_id: 'VK-007', name: 'Dinesh R', phone: '9840777777', type: 'TEMPORARY', dept: 'Maintenance', wage: 650, date: '2025-04-10' },
  { labour_id: 'VK-008', name: 'Mani K', phone: '9840888888', type: 'PERMANENT', dept: 'Construction Site A', wage: 850, date: '2025-01-20' },
  { labour_id: 'VK-009', name: 'Lalitha M', phone: '9840999991', type: 'PERMANENT', dept: 'Construction Site B', wage: 750, date: '2025-02-18' },
  { labour_id: 'VK-010', name: 'Vikram P', phone: '9840999992', type: 'TEMPORARY', dept: 'Construction Site A', wage: 800, date: '2025-03-22' }
];

const insertWorker = db.prepare(`
  INSERT OR IGNORE INTO workers (labour_id, name, phone, worker_type, department, daily_wage, pin_hash, joining_date)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const w of initialWorkers) {
  const pin = w.phone.slice(-4);
  insertWorker.run(w.labour_id, w.name, w.phone, w.type, w.dept, w.wage, hashPin(pin), w.date);
}

// Retrieve inserted workers map
const workers = query('SELECT * FROM workers');
const workerMap = new Map(workers.map(w => [w.labour_id, w]));

// Today's date
const today = new Date().toISOString().split('T')[0];

// Insert Attendance for Today
const insertAttendance = db.prepare(`
  INSERT OR REPLACE INTO attendance (worker_id, date, status, wage_factor, effective_daily_wage, earned_amount, remarks)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const sampleTodayAttendance = [
  { id: 'VK-001', status: 'PRESENT', wage_factor: 1.0 },
  { id: 'VK-002', status: 'PRESENT', wage_factor: 1.0 },
  { id: 'VK-003', status: 'HALF_DAY', wage_factor: 0.5 },
  { id: 'VK-004', status: 'PRESENT', wage_factor: 1.0 },
  { id: 'VK-005', status: 'ABSENT', wage_factor: 0.0 },
  { id: 'VK-006', status: 'PRESENT', wage_factor: 1.0 },
  { id: 'VK-007', status: 'HALF_DAY', wage_factor: 0.5 },
  { id: 'VK-008', status: 'PRESENT', wage_factor: 1.0 },
  { id: 'VK-009', status: 'PRESENT', wage_factor: 1.0 },
  { id: 'VK-010', status: 'PRESENT', wage_factor: 1.0 }
];

for (const att of sampleTodayAttendance) {
  const w = workerMap.get(att.id);
  if (w) {
    const earned = w.daily_wage * att.wage_factor;
    insertAttendance.run(w.id, today, att.status, att.wage_factor, w.daily_wage, earned, '');
  }
}

// Insert Advances
const insertAdvance = db.prepare(`
  INSERT INTO advances (worker_id, date, amount, payment_mode, reason, status)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const advancesData = [
  { id: 'VK-008', amount: 5000, date: '2026-09-01', reason: 'Medical expenses' },
  { id: 'VK-001', amount: 3000, date: '2026-09-02', reason: 'Family function' },
  { id: 'VK-002', amount: 2500, date: '2026-09-03', reason: 'Bike repair' },
  { id: 'VK-004', amount: 4000, date: '2026-08-28', reason: 'House rent advance' },
  { id: 'VK-005', amount: 3500, date: '2026-08-29', reason: 'Festival advance' }
];

for (const adv of advancesData) {
  const w = workerMap.get(adv.id);
  if (w) {
    insertAdvance.run(w.id, adv.date, adv.amount, 'CASH', adv.reason, 'PENDING');
  }
}

// Insert Loans
const insertLoan = db.prepare(`
  INSERT OR IGNORE INTO loans (worker_id, loan_id, principal_amount, disbursed_date, monthly_deduction, balance_remaining, status, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const loansData = [
  { id: 'VK-001', loan_id: 'LN-001', principal: 25000, date: '2025-06-01', deduction: 2500, balance: 15000, notes: 'Emergency medical loan' },
  { id: 'VK-003', loan_id: 'LN-002', principal: 15000, date: '2025-08-15', deduction: 1500, balance: 9000, notes: 'Children school fees' }
];

for (const l of loansData) {
  const w = workerMap.get(l.id);
  if (w) {
    insertLoan.run(w.id, l.loan_id, l.principal, l.date, l.deduction, l.balance, 'ACTIVE', l.notes);
  }
}

// Insert Notifications
const insertNotification = db.prepare(`
  INSERT INTO notifications (type, title, message, tamil_message, is_read)
  VALUES (?, ?, ?, ?, ?)
`);

insertNotification.run(
  'ATTENDANCE_REMINDER',
  'Daily Attendance Reminder (Morning)',
  'Please record attendance for all active labourers for today.',
  'இன்றைய தினத்திற்கான அனைத்து பணியாளர்களின் வருகைப் பதிவை பதிவு செய்யவும்.',
  0
);

insertNotification.run(
  'ONBOARDING',
  'Welcome to VK Traders',
  'You are onboarded as a permanent worker at VK Traders. Welcome to the VK Traders family! Have a good day. Your ID: VK-001, PIN: 1111.',
  'நீங்கள் வி.கே ட்ரேடர்ஸில் நிரந்தரப் பணியாளராக சேர்க்கப்பட்டுள்ளீர்கள். வி.கே ட்ரேடர்ஸ் குடும்பத்திற்கு உங்களை அன்புடன் வரவேற்கிறோம்! இனிய நாளாக அமையட்டும். உங்கள் பணியாளர் எண்: VK-001, பின்: 1111.',
  0
);

insertNotification.run(
  'MONTH_END_REPORT',
  'Monthly Payroll Snapshot Ready',
  'Automated salary report generated and available for download.',
  'மாதாந்திர சம்பள அறிக்கை வெற்றிகரமாக உருவாக்கப்பட்டது.',
  1
);

console.log('Database seeding successfully completed.');
