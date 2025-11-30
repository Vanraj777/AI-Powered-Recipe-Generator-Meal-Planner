const { Pool } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 PostgreSQL Password Tester\n');
console.log('This will help you find the correct PostgreSQL password.\n');

rl.question('Enter your PostgreSQL password (or press Enter to skip): ', (password) => {
  if (!password) {
    console.log('\n✅ Skipped - app works without database!');
    rl.close();
    process.exit(0);
  }

  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: password,
    port: 5432,
  });

  pool.query('SELECT version()')
    .then(result => {
      console.log('\n✅ SUCCESS! Password is correct!');
      console.log('   PostgreSQL version:', result.rows[0].version.split(',')[0]);
      console.log('\n📝 Update server/.env:');
      console.log(`   DB_PASSWORD=${password}`);
      rl.close();
      process.exit(0);
    })
    .catch(error => {
      console.log('\n❌ Password incorrect:', error.message);
      console.log('\n💡 Try again or skip - app works without database!');
      rl.close();
      process.exit(1);
    });
});

