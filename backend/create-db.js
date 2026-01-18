const { Client } = require('pg');

async function createDatabase() {
  // Connect to default postgres database first
  const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'postgres',
    password: 'miegoreng',
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');
    
    // Create trading_journal database
    await client.query('CREATE DATABASE trading_journal;');
    console.log('✅ Database "trading_journal" created successfully!');
    
    await client.end();
  } catch (err) {
    if (err.code === '42P04') {
      console.log('ℹ️ Database "trading_journal" already exists');
    } else {
      console.error('❌ Error:', err.message);
    }
  }
}

createDatabase();
