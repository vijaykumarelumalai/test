const fs = require('node:fs');
const path = require('node:path');

const backupDir = path.resolve(__dirname, '../database/backups');
const target = path.resolve(__dirname, '../database/vktraders.sqlite');

const backupFile = process.argv[2];

if (!backupFile) {
  console.log('Usage: node scripts/restore-database.js <backup_filename>');
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.sqlite'));
  console.log('Available backups:\n', files.join('\n'));
  process.exit(1);
}

const source = path.join(backupDir, backupFile);
if (!fs.existsSync(source)) {
  console.error(`❌ Backup file not found: ${source}`);
  process.exit(1);
}

fs.copyFileSync(source, target);
console.log(`✅ Database successfully restored from: ${source}`);
