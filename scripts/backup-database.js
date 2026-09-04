const fs = require('node:fs');
const path = require('node:path');

const src = path.resolve(__dirname, '../database/vktraders.sqlite');
const backupDir = path.resolve(__dirname, '../database/backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const dest = path.join(backupDir, `vktraders_backup_${timestamp}.sqlite`);

fs.copyFileSync(src, dest);
console.log(`✅ Backup successfully created at: ${dest}`);
