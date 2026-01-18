const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:miegoreng@127.0.0.1:5433/trading_journal'
});

async function test() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL!');
    const res = await client.query('SELECT version()');
    console.log('PostgreSQL:', res.rows[0].version);
    await client.end();
    console.log('✅ Connection works perfectly!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();
