const { Client } = require('pg');

// List password yang akan dicoba (urut dari yang paling mungkin)
const passwords = [
  '', // kosong
  'postgres',
  'password',
  'admin',
  '123456',
  '12345',
  'root',
  'postgres123',
  'Postgres123',
  'password123',
  'admin123',
  'qwerty',
  '12345678',
  '123456789',
  '1234',
  '123',
  'test',
  'postgresql',
  'postgre',
  'miegoreng',
  // Tambahkan password lain yang mungkin Anda gunakan
];

async function testPassword(password) {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // coba konek ke database default
    password: password,
    port: 5433,
    connectionTimeoutMillis: 3000, // timeout 3 detik
  });

  try {
    await client.connect();
    console.log(`✅✅✅ PASSWORD DITEMUKAN: "${password}" ✅✅✅`);
    console.log(`Gunakan password ini di koneksi Anda:`);
    console.log(`postgresql://postgres:${password}@localhost:5433/trading_journal`);
    await client.end();
    return true;
  } catch (err) {
    // Jangan tampilkan error untuk setiap percobaan agar tidak spam
    return false;
  }
}

async function testAll() {
  console.log('🔍 Mencoba koneksi dengan berbagai password...\n');
  
  for (let i = 0; i < passwords.length; i++) {
    const pwd = passwords[i];
    process.stdout.write(`Mencoba password ${i + 1}/${passwords.length}: "${pwd || '(kosong)'}"... `);
    
    const success = await testPassword(pwd);
    
    if (success) {
      process.stdout.write('BERHASIL!\n\n');
      return;
    } else {
      process.stdout.write('gagal\n');
    }
    
    // Tunggu sebentar antar percobaan
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n❌❌❌ Tidak ada password yang cocok dari list ❌❌❌');
  console.log('\n💡 Coba solusi lain:');
  console.log('1. Reset password PostgreSQL');
  console.log('2. Cek password di pgAdmin jika pernah tersimpan');
  console.log('3. Coba password lain yang mungkin Anda gunakan');
}

// Jalankan test
testAll().catch(console.error);