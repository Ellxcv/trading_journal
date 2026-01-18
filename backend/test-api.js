const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  try {
    console.log('🧪 Testing Backend API...\n');

    // Test 1: Register User
    console.log('1️⃣ Testing User Registration...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      email: 'trader@example.com',
      password: 'Password123!',
      name: 'Test Trader'
    });
    
    console.log('✅ Registration successful!');
    console.log('User:', registerResponse.data.user);
    console.log('Token:', registerResponse.data.access_token.substring(0, 20) + '...\n');
    
    const token = registerResponse.data.access_token;

    // Test 2: Get Profile
    console.log('2️⃣ Testing Get Profile...');
    const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile retrieved!');
    console.log('Profile:', profileResponse.data, '\n');

    // Test 3: Create Trade
    console.log('3️⃣ Testing Create Trade...');
    const tradeResponse = await axios.post(`${API_BASE}/trades`, {
      symbol: 'BTCUSDT',
      type: 'LONG',
      status: 'CLOSED',
      entryPrice: 45000,
      entryDate: '2024-01-15T10:00:00Z',
      quantity: 0.1,
      exitPrice: 46500,
      exitDate: '2024-01-16T14:30:00Z',
      commission: 10,
      strategy: 'Breakout',
      notes: 'Test trade from API test'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Trade created!');
    console.log('Trade ID:', tradeResponse.data.id);
    console.log('P&L:', tradeResponse.data.netProfitLoss, '\n');

    // Test 4: Get All Trades
    console.log('4️⃣ Testing Get All Trades...');
    const tradesResponse = await axios.get(`${API_BASE}/trades`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Trades retrieved!');
    console.log('Total trades:', tradesResponse.data.data.length);
    console.log('Pagination:', tradesResponse.data.meta, '\n');

    // Test 5: Get Statistics
    console.log('5️⃣ Testing Trade Statistics...');
    const statsResponse = await axios.get(`${API_BASE}/trades/statistics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Statistics retrieved!');
    console.log('Win Rate:', statsResponse.data.winRate.toFixed(2) + '%');
    console.log('Total P&L:', statsResponse.data.totalProfitLoss);
    console.log('Profit Factor:', statsResponse.data.profitFactor, '\n');

    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAPI();
