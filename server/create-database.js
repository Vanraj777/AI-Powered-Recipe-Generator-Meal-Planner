const {Pool} = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432
});

async function setup() {
  try {
    // Check if database exists
    const check = await pool.query(\"SELECT 1 FROM pg_database WHERE datname = 'recipe_generator'\");
    if (check.rows.length > 0) {
      console.log(' Database recipe_generator already exists');
    } else {
      // Create database
      await pool.query('CREATE DATABASE recipe_generator');
      console.log(' Database recipe_generator created successfully');
    }
    process.exit(0);
  } catch (e) {
    console.log(' Error:', e.message);
    if (e.message.includes('password')) {
      console.log('');
      console.log('  Password authentication failed!');
      console.log('   Please update DB_PASSWORD in server/.env with your PostgreSQL password');
    }
    process.exit(1);
  }
}
setup();
