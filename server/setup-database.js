const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function setupDatabase() {
  console.log('🔧 Setting up PostgreSQL database...\n');
  
  const config = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres', // Connect to default database first
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
  };

  console.log('📋 Configuration:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Password: ${config.password ? '***' + config.password.slice(-2) : 'not set'}\n`);

  let pool;
  try {
    pool = new Pool(config);
    console.log('🔌 Testing connection...');
    await pool.query('SELECT version()');
    console.log('✅ Connected to PostgreSQL!\n');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\n💡 Solutions:');
    console.error('   1. Check if PostgreSQL service is running');
    console.error('   2. Verify the password in server/.env matches your PostgreSQL password');
    console.error('   3. Try resetting PostgreSQL password (see instructions below)');
    process.exit(1);
  }

  try {
    // Check if database exists
    console.log('🔍 Checking if database exists...');
    const checkResult = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'recipe_generator']
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Database already exists\n');
    } else {
      console.log('📦 Creating database...');
      await pool.query(
        `CREATE DATABASE ${process.env.DB_NAME || 'recipe_generator'}`
      );
      console.log('✅ Database created successfully\n');
    }

    // Close connection to default database
    await pool.end();

    // Connect to the new database
    const dbConfig = {
      ...config,
      database: process.env.DB_NAME || 'recipe_generator'
    };
    
    const dbPool = new Pool(dbConfig);
    console.log('🔌 Connecting to recipe_generator database...');
    await dbPool.query('SELECT 1');
    console.log('✅ Connected to recipe_generator database\n');

    console.log('✅ Database setup complete!');
    console.log('\n📝 Next step: Run migrations');
    console.log('   cd server');
    console.log('   npm run migrate\n');

    await dbPool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (pool) await pool.end();
    process.exit(1);
  }
}

setupDatabase();

