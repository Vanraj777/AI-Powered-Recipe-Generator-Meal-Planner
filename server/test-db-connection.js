const {Pool} = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432
});
pool.query('SELECT version()').then(r => {
  console.log(' Connected! PostgreSQL version:', r.rows[0].version.split(',')[0]);
  process.exit(0);
}).catch(e => {
  console.log(' Failed with password "postgres"');
  console.log('   Error:', e.message);
  process.exit(1);
});
