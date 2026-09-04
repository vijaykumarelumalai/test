const assert = require('node:assert');

function calculateDailyEarned(dailyWage, status) {
  let factor = 0.0;
  if (status === 'PRESENT') factor = 1.0;
  else if (status === 'HALF_DAY') factor = 0.5;
  else if (status === 'ABSENT') factor = 0.0;
  return factor * dailyWage;
}

function calculateMonthlyNetPayable(dailyRecords, advances, loanDeduction) {
  const gross = dailyRecords.reduce((sum, r) => sum + calculateDailyEarned(r.wage, r.status), 0);
  const totalDeductions = advances + loanDeduction;
  return Math.max(0, gross - totalDeductions);
}

console.log('--- Running Test Suite: Deterministic Wage Engine (TC-WAG-001 / TC-WAG-002) ---');

// Test 1: Full Day Present
assert.strictEqual(calculateDailyEarned(800, 'PRESENT'), 800, 'Present must yield 100% daily wage');

// Test 2: Half Day
assert.strictEqual(calculateDailyEarned(800, 'HALF_DAY'), 400, 'Half-day must yield 50% daily wage');

// Test 3: Absent
assert.strictEqual(calculateDailyEarned(800, 'ABSENT'), 0, 'Absent must yield 0 wage');

// Test 4: Full Month Calculation
const sampleDays = [
  { wage: 800, status: 'PRESENT' },
  { wage: 800, status: 'PRESENT' },
  { wage: 800, status: 'HALF_DAY' },
  { wage: 800, status: 'ABSENT' },
  { wage: 1000, status: 'PRESENT' } // wage override day
];
// Gross = 800 + 800 + 400 + 0 + 1000 = 3000
const advances = 500;
const loanDeduction = 500;
const net = calculateMonthlyNetPayable(sampleDays, advances, loanDeduction);

assert.strictEqual(net, 2000, 'Net payable should be 3000 - 500 - 500 = 2000');

console.log('✅ ALL WAGE CALCULATION TESTS PASSED.');
