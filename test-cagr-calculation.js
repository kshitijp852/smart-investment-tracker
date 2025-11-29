// Test CAGR Calculation
// This verifies that ₹1,00,000 at 10% CAGR for 10 years = ₹2,59,374

const testCAGR = () => {
  const initialInvestment = 100000;
  const cagr = 0.10; // 10%
  const years = 10;
  
  // Formula: FV = PV × (1 + r)^n
  const futureValue = initialInvestment * Math.pow(1 + cagr, years);
  const expectedGain = futureValue - initialInvestment;
  
  console.log('=== CAGR Calculation Test ===');
  console.log(`Initial Investment: ₹${initialInvestment.toLocaleString('en-IN')}`);
  console.log(`CAGR: ${(cagr * 100).toFixed(2)}%`);
  console.log(`Years: ${years}`);
  console.log(`Future Value: ₹${futureValue.toLocaleString('en-IN', {maximumFractionDigits: 0})}`);
  console.log(`Expected Gain: ₹${expectedGain.toLocaleString('en-IN', {maximumFractionDigits: 0})}`);
  console.log('');
  
  // Verify it's approximately ₹2,59,374
  const expectedFV = 259374;
  const difference = Math.abs(futureValue - expectedFV);
  const isCorrect = difference < 10; // Allow ₹10 difference for rounding
  
  console.log(`Expected: ₹${expectedFV.toLocaleString('en-IN')}`);
  console.log(`Actual: ₹${Math.round(futureValue).toLocaleString('en-IN')}`);
  console.log(`Test: ${isCorrect ? '✅ PASS' : '❌ FAIL'}`);
  
  return isCorrect;
};

// Test portfolio CAGR calculation
const testPortfolioCAGR = () => {
  console.log('\n=== Portfolio CAGR Test ===');
  
  // Portfolio with 3 funds
  const funds = [
    { name: 'Fund A', allocation: 50000, cagr: 0.12, weight: 0.5 },
    { name: 'Fund B', allocation: 30000, cagr: 0.08, weight: 0.3 },
    { name: 'Fund C', allocation: 20000, cagr: 0.10, weight: 0.2 }
  ];
  
  const totalInvestment = 100000;
  const years = 10;
  
  // Calculate weighted CAGR
  const portfolioCAGR = funds.reduce((sum, fund) => sum + (fund.cagr * fund.weight), 0);
  
  console.log('Fund Breakdown:');
  funds.forEach(fund => {
    const fv = fund.allocation * Math.pow(1 + fund.cagr, years);
    console.log(`  ${fund.name}: ₹${fund.allocation.toLocaleString('en-IN')} @ ${(fund.cagr * 100).toFixed(0)}% → ₹${Math.round(fv).toLocaleString('en-IN')}`);
  });
  
  console.log(`\nPortfolio CAGR: ${(portfolioCAGR * 100).toFixed(2)}%`);
  
  // Calculate portfolio future value
  const portfolioFV = totalInvestment * Math.pow(1 + portfolioCAGR, years);
  const portfolioGain = portfolioFV - totalInvestment;
  
  console.log(`Total Investment: ₹${totalInvestment.toLocaleString('en-IN')}`);
  console.log(`Future Value: ₹${Math.round(portfolioFV).toLocaleString('en-IN')}`);
  console.log(`Expected Gain: ₹${Math.round(portfolioGain).toLocaleString('en-IN')}`);
  
  // Verify it's reasonable (should be around ₹2.7 lakhs for 10.6% CAGR)
  const isReasonable = portfolioFV > 200000 && portfolioFV < 400000;
  console.log(`Test: ${isReasonable ? '✅ PASS' : '❌ FAIL'}`);
  
  return isReasonable;
};

// Example API response
const exampleAPIResponse = () => {
  console.log('\n=== Example API Response ===');
  console.log('POST /api/portfolio/returns');
  console.log('Body: {');
  console.log('  "holdings": [');
  console.log('    {"schemeCode": "119551", "allocation": 50000, "percentage": 50},');
  console.log('    {"schemeCode": "119552", "allocation": 30000, "percentage": 30},');
  console.log('    {"schemeCode": "119553", "allocation": 20000, "percentage": 20}');
  console.log('  ],');
  console.log('  "projectionYears": 10');
  console.log('}\n');
  
  const response = {
    success: true,
    portfolio: {
      totalInvested: 100000,
      totalCurrentValue: 259374,
      totalReturn: 159374,
      portfolioCAGR: 10.00,
      projectionYears: 10
    },
    holdings: [
      {
        schemeCode: "119551",
        schemeName: "HDFC Balanced Advantage Fund",
        category: "hybrid",
        allocation: 50000,
        percentage: 50,
        cagr: 12.00,
        projectedValue: 155292,
        expectedGain: 105292,
        years: 10
      },
      {
        schemeCode: "119552",
        schemeName: "ICICI Prudential Liquid Fund",
        category: "liquid",
        allocation: 30000,
        percentage: 30,
        cagr: 8.00,
        projectedValue: 64767,
        expectedGain: 34767,
        years: 10
      },
      {
        schemeCode: "119553",
        schemeName: "SBI Large Cap Fund",
        category: "large_cap",
        allocation: 20000,
        percentage: 20,
        cagr: 10.00,
        projectedValue: 51875,
        expectedGain: 31875,
        years: 10
      }
    ]
  };
  
  console.log(JSON.stringify(response, null, 2));
};

// Run tests
console.log('🧪 Testing CAGR Calculation Logic\n');
const test1 = testCAGR();
const test2 = testPortfolioCAGR();
exampleAPIResponse();

console.log('\n=== Summary ===');
console.log(`Basic CAGR: ${test1 ? '✅' : '❌'}`);
console.log(`Portfolio CAGR: ${test2 ? '✅' : '❌'}`);
console.log(`Overall: ${test1 && test2 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
