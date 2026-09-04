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

// Default system settings initialization (No mock labourers or test financial data)
console.log('VK Traders Database initialized with clean operational settings.');

