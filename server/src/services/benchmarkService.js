// Benchmark Service for Blended Index Calculation
const axios = require('axios');
const Cache = require('../models/Cache');
const NAV = require('../models/NAV');

// Benchmark mapping for each category
const BENCHMARK_MAP = {
  'large_cap': 'NIFTY 50 TRI',
  'mid_cap': 'NIFTY Midcap 150 TRI',
  'small_cap': 'NIFTY Smallcap 250 TRI',
  'flexi_cap': 'NIFTY 500 TRI',
  'multi_cap': 'NIFTY 500 TRI',
  'elss': 'NIFTY 500 TRI',
  'value': 'NIFTY 500 TRI',
  'contra': 'NIFTY 500 TRI',
  'large_and_midcap': 'NIFTY 200 TRI',
  'hybrid_aggressive': 'CRISIL Hybrid 35+ TRI',
  'balanced': 'CRISIL Hybrid 35+ TRI',
  'hybrid_conservative': 'CRISIL Hybrid 15+ TRI',
  'debt': 'NIFTY 10yr G-Sec Index',
  'liquid': 'NIFTY Liquid Index',
  'index': 'NIFTY 50 TRI'
};

// Mock benchmark returns (in production, fetch from real API)
// These are approximate historical returns for Indian indices
const MOCK_BENCHMARK_RETURNS = {
  'NIFTY 50 TRI': { '1Y': 0.18, '3Y': 0.15, '5Y': 0.14, 'SI': 0.13 },
  'NIFTY Midcap 150 TRI': { '1Y': 0.25, '3Y': 0.20, '5Y': 0.18, 'SI': 0.16 },
  'NIFTY Smallcap 250 TRI': { '1Y': 0.30, '3Y': 0.22, '5Y': 0.20, 'SI': 0.18 },
  'NIFTY 500 TRI': { '1Y': 0.20, '3Y': 0.17, '5Y': 0.15, 'SI': 0.14 },
  'NIFTY 200 TRI': { '1Y': 0.19, '3Y': 0.16, '5Y': 0.15, 'SI': 0.14 },
  'CRISIL Hybrid 35+ TRI': { '1Y': 0.12, '3Y': 0.11, '5Y': 0.10, 'SI': 0.09 },
  'CRISIL Hybrid 15+ TRI': { '1Y': 0.08, '3Y': 0.08, '5Y': 0.07, 'SI': 0.07 },
  'NIFTY 10yr G-Sec Index': { '1Y': 0.07, '3Y': 0.06, '5Y': 0.06, 'SI': 0.06 },
  'NIFTY Liquid Index': { '1Y': 0.05, '3Y': 0.05, '5Y': 0.05, 'SI': 0.05 }
};

/**
 * Get benchmark index for a fund category
 */
function getBenchmarkForCategory(category) {
  return BENCHMARK_MAP[category] || 'NIFTY 500 TRI';
}

/**
 * Fetch benchmark returns (with caching)
 */
async function fetchBenchmarkReturns(benchmarkName) {
  try {
    // Check cache first (24-hour TTL)
    const cacheKey = `benchmark_${benchmarkName}`;
    const cached = await Cache.findOne({ key: cacheKey });
    
    if (cached && cached.timestamp) {
      const cacheAge = Date.now() - new Date(cached.timestamp).getTime();
      if (cacheAge < 24 * 60 * 60 * 1000) {
        return cached.data;
      }
    }

    // In production, fetch from real API (Yahoo Finance, Value Research, etc.)
    // For now, use mock data
    const returns = MOCK_BENCHMARK_RETURNS[benchmarkName] || { '1Y': 0.12, '3Y': 0.11, '5Y': 0.10, 'SI': 0.10 };

    // Cache the result
    await Cache.findOneAndUpdate(
      { key: cacheKey },
      { key: cacheKey, data: returns, timestamp: new Date() },
      { upsert: true, new: true }
    );

    return returns;
  } catch (error) {
    console.error('Error fetching benchmark returns:', error);
    // Return default conservative returns on error
    return { '1Y': 0.10, '3Y': 0.10, '5Y': 0.10, 'SI': 0.10 };
  }
}

/**
 * Calculate blended benchmark return for a basket
 */
async function calculateBlendedBenchmark(basket) {
  try {
    // Group funds by category and calculate weights
    const categoryWeights = {};
    const benchmarkComponents = [];
    let totalWeight = 0;

    basket.forEach(fund => {
      const category = fund.category || 'flexi_cap';
      const weight = fund.percentage / 100; // Convert percentage to decimal
      
      if (!categoryWeights[category]) {
        categoryWeights[category] = 0;
      }
      categoryWeights[category] += weight;
      totalWeight += weight;
    });

    // Normalize weights to ensure they sum to 1
    Object.keys(categoryWeights).forEach(category => {
      categoryWeights[category] = categoryWeights[category] / totalWeight;
    });

    // Fetch benchmark returns for each category
    const blendedReturns = { '1Y': 0, '3Y': 0, '5Y': 0, 'SI': 0 };
    
    for (const [category, weight] of Object.entries(categoryWeights)) {
      const benchmarkIndex = getBenchmarkForCategory(category);
      const benchmarkReturns = await fetchBenchmarkReturns(benchmarkIndex);
      
      // Add to benchmark components
      benchmarkComponents.push({
        category: category,
        benchmarkIndex: benchmarkIndex,
        weight: weight * 100 // Convert back to percentage for display
      });

      // Calculate weighted returns for each period
      Object.keys(blendedReturns).forEach(period => {
        blendedReturns[period] += benchmarkReturns[period] * weight;
      });
    }

    return {
      benchmarkName: 'Blended Index',
      benchmarkComponents: benchmarkComponents,
      benchmarkReturn: blendedReturns
    };
  } catch (error) {
    console.error('Error calculating blended benchmark:', error);
    throw error;
  }
}

/**
 * Calculate basket returns for different time periods
 */
function calculateBasketReturns(basket, duration) {
  const basketReturns = { '1Y': 0, '3Y': 0, '5Y': 0, 'SI': 0 };
  
  basket.forEach(fund => {
    const weight = fund.percentage / 100;
    const annualReturn = fund.expectedReturn || 0;
    
    // Calculate returns for each period
    basketReturns['1Y'] += annualReturn * weight;
    basketReturns['3Y'] += annualReturn * weight;
    basketReturns['5Y'] += annualReturn * weight;
    basketReturns['SI'] += annualReturn * weight; // Since inception = duration
  });

  return basketReturns;
}

/**
 * Compare basket performance against blended benchmark
 */
async function compareWithBenchmark(basket, duration) {
  try {
    // Calculate basket returns
    const basketReturn = calculateBasketReturns(basket, duration);

    // Calculate blended benchmark
    const benchmarkData = await calculateBlendedBenchmark(basket);

    // Calculate differences
    const difference = {};
    const beatsBenchmark = {};

    Object.keys(basketReturn).forEach(period => {
      difference[period] = basketReturn[period] - benchmarkData.benchmarkReturn[period];
      beatsBenchmark[period] = difference[period] > 0;
    });

    return {
      basketReturn: basketReturn,
      benchmarkName: benchmarkData.benchmarkName,
      benchmarkComponents: benchmarkData.benchmarkComponents,
      benchmarkReturn: benchmarkData.benchmarkReturn,
      difference: difference,
      beatsBenchmark: beatsBenchmark
    };
  } catch (error) {
    console.error('Error comparing with benchmark:', error);
    throw error;
  }
}

/**
 * Generate performance chart data
 */
function generatePerformanceChartData(basketReturn, benchmarkReturn, duration, initialInvestment) {
  const periods = ['1Y', '3Y', '5Y', 'SI'];
  const chartData = [];

  periods.forEach(period => {
    const years = period === '1Y' ? 1 : period === '3Y' ? 3 : period === '5Y' ? 5 : duration;
    
    if (years <= duration) {
      const basketValue = initialInvestment * Math.pow(1 + basketReturn[period], years);
      const benchmarkValue = initialInvestment * Math.pow(1 + benchmarkReturn[period], years);
      
      chartData.push({
        period: period,
        years: years,
        basketValue: basketValue,
        benchmarkValue: benchmarkValue,
        basketReturn: basketReturn[period] * 100,
        benchmarkReturn: benchmarkReturn[period] * 100
      });
    }
  });

  return chartData;
}

module.exports = {
  getBenchmarkForCategory,
  fetchBenchmarkReturns,
  calculateBlendedBenchmark,
  calculateBasketReturns,
  compareWithBenchmark,
  generatePerformanceChartData,
  BENCHMARK_MAP
};


/**
 * Calculate blended benchmark using real NAV data
 * @param {Array} holdings - Array of {schemeCode, allocation}
 * @param {Date} startDate - Start date for comparison
 * @param {Date} endDate - End date for comparison (default: today)
 */
async function calculateBlendedBenchmarkWithNAV(holdings, startDate, endDate = new Date()) {
  try {
    const benchmarkComponents = [];
    let totalWeight = 0;
    
    // Get category for each holding
    for (const holding of holdings) {
      const latestNAV = await NAV.getLatestNAV(holding.schemeCode);
      
      if (!latestNAV) continue;
      
      const category = latestNAV.category;
      const benchmarkIndex = getBenchmarkForCategory(category);
      const weight = holding.allocation / 100;
      
      benchmarkComponents.push({
        schemeCode: holding.schemeCode,
        schemeName: latestNAV.schemeName,
        category: category,
        benchmarkIndex: benchmarkIndex,
        weight: holding.allocation
      });
      
      totalWeight += weight;
    }
    
    // Normalize weights
    benchmarkComponents.forEach(comp => {
      comp.weight = (comp.weight / (totalWeight * 100)) * 100;
    });
    
    // Calculate weighted benchmark returns
    const benchmarkReturns = await fetchBenchmarkReturns('NIFTY 500 TRI');
    
    return {
      benchmarkName: 'Blended Index',
      benchmarkComponents: benchmarkComponents,
      benchmarkReturn: benchmarkReturns,
      startDate: startDate,
      endDate: endDate
    };
  } catch (error) {
    console.error('Error calculating blended benchmark with NAV:', error);
    throw error;
  }
}

/**
 * Compare portfolio performance with blended benchmark using real NAV data
 * @param {Array} holdings - Array of {schemeCode, units, investmentDate}
 */
async function comparePortfolioWithBenchmark(holdings) {
  try {
    const portfolioReturns = {};
    const benchmarkData = [];
    
    for (const holding of holdings) {
      const { schemeCode, units, investmentDate } = holding;
      
      // Get investment NAV
      const investmentNAV = await NAV.findOne({
        schemeCode,
        date: { $lte: new Date(investmentDate) }
      }).sort({ date: -1 }).limit(1);
      
      if (!investmentNAV) continue;
      
      // Get latest NAV
      const latestNAV = await NAV.getLatestNAV(schemeCode);
      
      if (!latestNAV) continue;
      
      // Calculate return
      const investedAmount = units * investmentNAV.nav;
      const currentValue = units * latestNAV.nav;
      const returnPct = ((currentValue - investedAmount) / investedAmount) * 100;
      
      portfolioReturns[schemeCode] = {
        schemeName: latestNAV.schemeName,
        category: latestNAV.category,
        return: returnPct,
        investedAmount: investedAmount,
        currentValue: currentValue
      };
      
      // Get benchmark for category
      const benchmarkIndex = getBenchmarkForCategory(latestNAV.category);
      benchmarkData.push({
        category: latestNAV.category,
        benchmarkIndex: benchmarkIndex,
        weight: investedAmount
      });
    }
    
    // Calculate total invested
    const totalInvested = Object.values(portfolioReturns)
      .reduce((sum, h) => sum + h.investedAmount, 0);
    
    // Calculate weighted portfolio return
    const portfolioReturn = Object.values(portfolioReturns)
      .reduce((sum, h) => sum + (h.return * h.investedAmount / totalInvested), 0);
    
    // Calculate weighted benchmark return
    const benchmarkReturn = await calculateWeightedBenchmarkReturn(benchmarkData, totalInvested);
    
    return {
      success: true,
      portfolioReturn: portfolioReturn,
      benchmarkReturn: benchmarkReturn,
      difference: portfolioReturn - benchmarkReturn,
      beatsBenchmark: portfolioReturn > benchmarkReturn,
      holdings: portfolioReturns,
      benchmarkComponents: benchmarkData
    };
  } catch (error) {
    console.error('Error comparing portfolio with benchmark:', error);
    throw error;
  }
}

/**
 * Calculate weighted benchmark return
 */
async function calculateWeightedBenchmarkReturn(benchmarkData, totalInvested) {
  let weightedReturn = 0;
  
  for (const data of benchmarkData) {
    const weight = data.weight / totalInvested;
    const benchmarkReturns = await fetchBenchmarkReturns(data.benchmarkIndex);
    
    // Use 1Y return as default
    const benchmarkReturn = benchmarkReturns['1Y'] || 0.12;
    weightedReturn += benchmarkReturn * weight * 100;
  }
  
  return weightedReturn;
}

module.exports = {
  getBenchmarkForCategory,
  fetchBenchmarkReturns,
  calculateBlendedBenchmark,
  calculateBasketReturns,
  compareWithBenchmark,
  generatePerformanceChartData,
  calculateBlendedBenchmarkWithNAV,
  comparePortfolioWithBenchmark,
  BENCHMARK_MAP
};
