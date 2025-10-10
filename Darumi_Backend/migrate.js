const fs = require('fs');
const path = require('path');
const connection = require('./db');

const migrationsDir = path.join(__dirname, 'migrations');

function runSql(sql) {
  return new Promise((resolve, reject) => {
    connection.query(sql, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
}

async function runMigrations() {
  try {
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
      const full = path.join(migrationsDir, file);
      const sql = fs.readFileSync(full, 'utf8');
      console.log(`Running migration: ${file}`);
      await runSql(sql);
      console.log(`Applied: ${file}`);
    }
    console.log('All migrations applied');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigrations();


