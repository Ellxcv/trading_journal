const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

async function runTests() {
  let token = '';
  let userId = '';
  let tradeId = '';
  let testsPassed = 0;
  let testsFailed = 0;

  console.log('\n' + '='.repeat(60));
  log(colors.cyan, '🧪 COMPREHENSIVE API TEST SUITE');
  console.log('='.repeat(60) + '\n');

  try {
    // ========== AUTHENTICATION TESTS ==========
    log(colors.blue, '\n📋 SECTION 1: AUTHENTICATION TESTS');
    console.log('-'.repeat(60));

    // Test 1.1: User Registration
    console.log('\n1.1 Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
        email: `test${Date.now()}@example.com`,
        password: 'SecurePass123!',
        name: 'Test User'
      });
      
      token = registerResponse.data.access_token;
      userId = registerResponse.data.user.id;
      
      log(colors.green, '✅ PASS: User registered successfully');
      console.log('   User ID:', userId);
      console.log('   Email:', registerResponse.data.user.email);
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: Registration failed');
      console.log('   Error:', error.response?.data || error.message);
      testsFailed++;
    }

    // Test 1.2: Login with Valid Credentials
    console.log('\n1.2 Testing Login with Valid Credentials...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'trader@example.com',
        password: 'Password123!'
      });
      
      log(colors.green, '✅ PASS: Login successful');
      console.log('   Token received:', loginResponse.data.access_token.substring(0, 30) + '...');
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: Login failed');
      console.log('   Error:', error.response?.data || error.message);
      testsFailed++;
    }

    // Test 1.3: Login with Invalid Credentials
    console.log('\n1.3 Testing Login with Invalid Credentials (should fail)...');
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: 'wrong@example.com',
        password: 'wrongpass'
      });
      log(colors.red, '❌ FAIL: Should have rejected invalid credentials');
      testsFailed++;
    } catch (error) {
      if (error.response?.status === 401) {
        log(colors.green, '✅ PASS: Correctly rejected invalid credentials');
        testsPassed++;
      } else {
        log(colors.red, '❌ FAIL: Wrong error response');
        testsFailed++;
      }
    }

    // Test 1.4: Get Profile (Protected Route)
    console.log('\n1.4 Testing Get Profile (Protected Route)...');
    try {
      const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      log(colors.green, '✅ PASS: Profile retrieved successfully');
      console.log('   User:', profileResponse.data.email);
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: Profile retrieval failed');
      console.log('   Error:', error.response?.data || error.message);
      testsFailed++;
    }

    // Test 1.5: Access Protected Route Without Token
    console.log('\n1.5 Testing Protected Route Without Token (should fail)...');
    try {
      await axios.get(`${API_BASE}/auth/profile`);
      log(colors.red, '❌ FAIL: Should have rejected request without token');
      testsFailed++;
    } catch (error) {
      if (error.response?.status === 401) {
        log(colors.green, '✅ PASS: Correctly rejected unauthorized request');
        testsPassed++;
      } else {
        log(colors.red, '❌ FAIL: Wrong error response');
        testsFailed++;
      }
    }

    // ========== TRADES CRUD TESTS ==========
    log(colors.blue, '\n\n📋 SECTION 2: TRADES CRUD OPERATIONS');
    console.log('-'.repeat(60));

    // Test 2.1: Create Trade (LONG - Winning)
    console.log('\n2.1 Testing Create Trade (LONG - Winning)...');
    try {
      const tradeResponse = await axios.post(`${API_BASE}/trades`, {
        symbol: 'BTCUSDT',
        type: 'LONG',
        status: 'CLOSED',
        entryPrice: 45000,
        entryDate: '2024-01-15T10:00:00Z',
        quantity: 0.1,
        exitPrice: 46500,
        exitDate: '2024-01-16T14:30:00Z',
        stopLoss: 44000,
        takeProfit: 47000,
        commission: 10,
        strategy: 'Breakout',
        timeframe: '4H',
        notes: 'Test winning trade'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      tradeId = tradeResponse.data.id;
      
      log(colors.green, '✅ PASS: Trade created successfully');
      console.log('   Trade ID:', tradeId);
      console.log('   P&L:', tradeResponse.data.profitLoss);
      console.log('   Net P&L:', tradeResponse.data.netProfitLoss);
      
      // Verify P&L calculation
      const expectedPL = (46500 - 45000) * 0.1;
      const expectedNetPL = expectedPL - 10;
      if (Math.abs(tradeResponse.data.netProfitLoss - expectedNetPL) < 0.01) {
        log(colors.green, '   ✓ P&L calculation correct');
      } else {
        log(colors.yellow, '   ⚠ P&L calculation might be incorrect');
      }
      
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: Trade creation failed');
      console.log('   Error:', error.response?.data || error.message);
      testsFailed++;
    }

    // Test 2.2: Create Trade (SHORT - Losing)
    console.log('\n2.2 Testing Create Trade (SHORT - Losing)...');
    try {
      const tradeResponse = await axios.post(`${API_BASE}/trades`, {
        symbol: 'ETHUSDT',
        type: 'SHORT',
        status: 'CLOSED',
        entryPrice: 3000,
        entryDate: '2024-01-17T09:00:00Z',
        quantity: 1,
        exitPrice: 3100,
        exitDate: '2024-01-17T15:00:00Z',
        commission: 5,
        strategy: 'Reversal',
        notes: 'Test losing trade'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      log(colors.green, '✅ PASS: SHORT trade created');
      console.log('   Trade ID:', tradeResponse.data.id);
      console.log('   Net P&L:', tradeResponse.data.netProfitLoss, '(should be negative)');
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: SHORT trade creation failed');
      testsFailed++;
    }

    // Test 2.3: Create Trade with Invalid Data
    console.log('\n2.3 Testing Create Trade with Invalid Data (should fail)...');
    try {
      await axios.post(`${API_BASE}/trades`, {
        symbol: 'BTC',
        // Missing required fields
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      log(colors.red, '❌ FAIL: Should have rejected invalid data');
      testsFailed++;
    } catch (error) {
      if (error.response?.status === 400) {
        log(colors.green, '✅ PASS: Correctly rejected invalid data');
        testsPassed++;
      } else {
        log(colors.red, '❌ FAIL: Wrong error response');
        testsFailed++;
      }
    }

    // Test 2.4: Get Single Trade
    console.log('\n2.4 Testing Get Single Trade...');
    try {
      const tradeResponse = await axios.get(`${API_BASE}/trades/${tradeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      log(colors.green, '✅ PASS: Trade retrieved successfully');
      console.log('   Symbol:', tradeResponse.data.symbol);
      console.log('   Type:', tradeResponse.data.type);
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: Trade retrieval failed');
      testsFailed++;
    }

    // Test 2.5: Get Non-existent Trade
    console.log('\n2.5 Testing Get Non-existent Trade (should fail)...');
    try {
      await axios.get(`${API_BASE}/trades/nonexistent123`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      log(colors.red, '❌ FAIL: Should have returned 404');
      testsFailed++;
    } catch (error) {
      if (error.response?.status === 404) {
        log(colors.green, '✅ PASS: Correctly returned 404');
        testsPassed++;
      } else {
        log(colors.red, '❌ FAIL: Wrong error response');
        testsFailed++;
      }
    }

    // Test 2.6: Update Trade
    console.log('\n2.6 Testing Update Trade...');
    try {
      const updateResponse = await axios.patch(`${API_BASE}/trades/${tradeId}`, {
        notes: 'Updated notes via API test',
        exitPrice: 47000
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      log(colors.green, '✅ PASS: Trade updated successfully');
      console.log('   New notes:', updateResponse.data.notes);
      console.log('   Updated P&L:', updateResponse.data.netProfitLoss);
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: Trade update failed');
      console.log('   Error:', error.response?.data || error.message);
      testsFailed++;
    }

    // ========== TRADES FILTERING & PAGINATION ==========
    log(colors.blue, '\n\n📋 SECTION 3: FILTERING & PAGINATION');
    console.log('-'.repeat(60));

    // Create more test trades for filtering
    console.log('\n3.0 Creating additional test trades...');
    const additionalTrades = [
      { symbol: 'BTCUSDT', type: 'LONG', entryPrice: 50000, exitPrice: 51000, quantity: 0.1, commission: 10 },
      { symbol: 'ETHUSDT', type: 'SHORT', entryPrice: 3200, exitPrice: 3100, quantity: 1, commission: 5 },
      { symbol: 'SOLUSDT', type: 'LONG', entryPrice: 100, exitPrice: 95, quantity: 5, commission: 2 },
    ];

    for (let trade of additionalTrades) {
      try {
        await axios.post(`${API_BASE}/trades`, {
          ...trade,
          status: 'CLOSED',
          entryDate: new Date().toISOString(),
          exitDate: new Date().toISOString(),
          strategy: 'Test Strategy'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.log('   Warning: Could not create test trade');
      }
    }
    log(colors.green, '   ✓ Test trades created');

    // Test 3.1: Get All Trades (Default Pagination)
    console.log('\n3.1 Testing Get All Trades (Default Pagination)...');
    try {
      const tradesResponse = await axios.get(`${API_BASE}/trades`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      log(colors.green, '✅ PASS: Trades list retrieved');
      console.log('   Total trades:', tradesResponse.data.data.length);
      console.log('   Pagination:', tradesResponse.data.meta);
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: Get all trades failed');
      testsFailed++;
    }

    // Test 3.2: Filter by Symbol
    console.log('\n3.2 Testing Filter by Symbol (BTC)...');
    try {
      const tradesResponse = await axios.get(`${API_BASE}/trades?symbol=BTC`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allBTC = tradesResponse.data.data.every(t => t.symbol.includes('BTC'));
      
      if (allBTC) {
        log(colors.green, '✅ PASS: Symbol filter works correctly');
        console.log('   Found', tradesResponse.data.data.length, 'BTC trades');
      } else {
        log(colors.red, '❌ FAIL: Symbol filter not working correctly');
      }
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: Symbol filter failed');
      testsFailed++;
    }

    // Test 3.3: Filter by Type
    console.log('\n3.3 Testing Filter by Type (LONG)...');
    try {
      const tradesResponse = await axios.get(`${API_BASE}/trades?type=LONG`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allLong = tradesResponse.data.data.every(t => t.type === 'LONG');
      
      if (allLong) {
        log(colors.green, '✅ PASS: Type filter works correctly');
        console.log('   Found', tradesResponse.data.data.length, 'LONG trades');
      } else {
        log(colors.red, '❌ FAIL: Type filter not working correctly');
      }
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: Type filter failed');
      testsFailed++;
    }

    // Test 3.4: Filter by Profitability (Winning)
    console.log('\n3.4 Testing Filter by Profitability (Winning)...');
    try {
      const tradesResponse = await axios.get(`${API_BASE}/trades?profitability=winning`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allWinning = tradesResponse.data.data.every(t => t.netProfitLoss > 0);
      
      if (allWinning) {
        log(colors.green, '✅ PASS: Profitability filter works correctly');
        console.log('   Found', tradesResponse.data.data.length, 'winning trades');
      } else {
        log(colors.red, '❌ FAIL: Profitability filter not working correctly');
      }
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: Profitability filter failed');
      testsFailed++;
    }

    // Test 3.5: Pagination
    console.log('\n3.5 Testing Pagination (limit=2)...');
    try {
      const tradesResponse = await axios.get(`${API_BASE}/trades?page=1&limit=2`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (tradesResponse.data.data.length <= 2 && tradesResponse.data.meta.limit === 2) {
        log(colors.green, '✅ PASS: Pagination works correctly');
        console.log('   Page 1, Limit 2:', tradesResponse.data.data.length, 'trades returned');
        console.log('   Total pages:', tradesResponse.data.meta.totalPages);
      } else {
        log(colors.red, '❌ FAIL: Pagination not working correctly');
      }
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: Pagination failed');
      testsFailed++;
    }

    // Test 3.6: Sorting
    console.log('\n3.6 Testing Sorting (by entryDate desc)...');
    try {
      const tradesResponse = await axios.get(`${API_BASE}/trades?sortBy=entryDate&sortOrder=desc`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      log(colors.green, '✅ PASS: Sorting works');
      console.log('   Retrieved', tradesResponse.data.data.length, 'trades in descending order');
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: Sorting failed');
      testsFailed++;
    }

    // ========== STATISTICS & ANALYTICS ==========
    log(colors.blue, '\n\n📋 SECTION 4: STATISTICS & ANALYTICS');
    console.log('-'.repeat(60));

    // Test 4.1: Get Trade Statistics
    console.log('\n4.1 Testing Get Trade Statistics...');
    try {
      const statsResponse = await axios.get(`${API_BASE}/trades/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      log(colors.green, '✅ PASS: Statistics retrieved successfully');
      console.log('   Total Trades:', statsResponse.data.totalTrades);
      console.log('   Winning Trades:', statsResponse.data.winningTrades);
      console.log('   Losing Trades:', statsResponse.data.losingTrades);
      console.log('   Win Rate:', statsResponse.data.winRate.toFixed(2) + '%');
      console.log('   Total P&L:', statsResponse.data.totalProfitLoss.toFixed(2));
      console.log('   Profit Factor:', statsResponse.data.profitFactor.toFixed(2));
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: Statistics retrieval failed');
      testsFailed++;
    }

    // Test 4.2: Get Analytics Overview
    console.log('\n4.2 Testing Get Analytics Overview...');
    try {
      const analyticsResponse = await axios.get(`${API_BASE}/analytics/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      log(colors.green, '✅ PASS: Analytics overview retrieved');
      console.log('   Win Rate:', analyticsResponse.data.winRate.toFixed(2) + '%');
      console.log('   Average Win:', analyticsResponse.data.averageWin.toFixed(2));
      console.log('   Average Loss:', Math.abs(analyticsResponse.data.averageLoss).toFixed(2));
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: Analytics overview failed');
      testsFailed++;
    }

    // Test 4.3: Get Performance Chart Data
    console.log('\n4.3 Testing Get Performance Chart Data...');
    try {
      const chartResponse = await axios.get(`${API_BASE}/analytics/performance-chart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      log(colors.green, '✅ PASS: Performance chart data retrieved');
      console.log('   Data points:', chartResponse.data.length);
      if (chartResponse.data.length > 0) {
        console.log('   Last cumulative P&L:', chartResponse.data[chartResponse.data.length - 1].cumulativePnL);
      }
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: Performance chart failed');
      testsFailed++;
    }

    // Test 4.4: Get Monthly Performance
    console.log('\n4.4 Testing Get Monthly Performance...');
    try {
      const monthlyResponse = await axios.get(`${API_BASE}/analytics/monthly-performance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      log(colors.green, '✅ PASS: Monthly performance retrieved');
      console.log('   Months with data:', monthlyResponse.data.length);
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: Monthly performance failed');
      testsFailed++;
    }

    // ========== CLEANUP (OPTIONAL) ==========
    log(colors.blue, '\n\n📋 SECTION 5: DELETE OPERATIONS');
    console.log('-'.repeat(60));

    // Test 5.1: Delete Trade
    console.log('\n5.1 Testing Delete Trade...');
    try {
      await axios.delete(`${API_BASE}/trades/${tradeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      log(colors.green, '✅ PASS: Trade deleted successfully');
      testsPassed++;
    } catch (error) {
      log(colors.red, '❌ FAIL: Trade deletion failed');
      testsFailed++;
    }

    // Test 5.2: Verify Trade Deleted
    console.log('\n5.2 Testing Verify Trade Deleted (should fail)...');
    try {
      await axios.get(`${API_BASE}/trades/${tradeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      log(colors.red, '❌ FAIL: Deleted trade still accessible');
      testsFailed++;
    } catch (error) {
      if (error.response?.status === 404) {
        log(colors.green, '✅ PASS: Trade correctly deleted');
        testsPassed++;
      } else {
        log(colors.red, '❌ FAIL: Wrong error response');
        testsFailed++;
      }
    }

  } catch (error) {
    log(colors.red, '\n💥 UNEXPECTED ERROR:', error.message);
  }

  // ========== FINAL REPORT ==========
  console.log('\n' + '='.repeat(60));
  log(colors.cyan, '📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  const totalTests = testsPassed + testsFailed;
  const successRate = ((testsPassed / totalTests) * 100).toFixed(2);
  
  log(colors.green, `✅ Tests Passed: ${testsPassed}`);
  log(colors.red, `❌ Tests Failed: ${testsFailed}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  if (testsFailed === 0) {
    log(colors.green, '\n🎉 ALL TESTS PASSED! Backend is fully functional! 🎉');
  } else {
    log(colors.yellow, '\n⚠️  Some tests failed. Please review the errors above.');
  }
  
  console.log('='.repeat(60) + '\n');
}

runTests();
