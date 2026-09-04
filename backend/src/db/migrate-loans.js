const { db } = require('./index');

console.log('Migrating loans table...');

try {
  db.exec("ALTER TABLE loans ADD COLUMN loan_provided_from TEXT DEFAULT 'VK Traders';");
} catch (e) {
  // column might already exist
}

try {
  db.exec("ALTER TABLE loans ADD COLUMN interest_amount REAL DEFAULT 0;");
} catch (e) {
}

try {
  db.exec("ALTER TABLE loans ADD COLUMN total_payable REAL DEFAULT 0;");
} catch (e) {
}

db.exec("UPDATE loans SET total_payable = principal_amount + interest_amount WHERE total_payable = 0;");
console.log('✅ Loans table migration completed successfully.');
