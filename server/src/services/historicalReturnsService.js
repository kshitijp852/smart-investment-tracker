const NAV = require('../models/NAV');

/**
 * Calculate historical returns for a fund based on NAV data
 * @param {string} schemeCode - Fund scheme code
 * @param {number} days - Number of days to look back
 * @returns {number|null} - Return percentage or null if data unavailable
 */
async function calculateHistoricalReturn(schemeCode, days) {
  try {
    // Get latest NAV
    const latestNAV = await NAV.findOne({ schemeCode })
      .sort({ date: -1 })
      .limit(1);
    
    if (!latestNAV) {
      return null;
    }
    
    // Calculate target date
    const targetDate = new Date(latestNAV.date);
    targetDate.setDate(targetDate.getDate() - days);
    
    // Get NAV at target date (or nearest previous)
    const historicalNAV = await NAV.findOne({
      schemeCode,
      date: { $lte: targetDate }
    })
      .sort({ date: -1 })
      .limit(1);
    
    if (!historicalNAV) {
      return null;
    }
    
    // Calculate return
    const returnValue = (latestNAV.nav - historicalNAV.nav) / historicalNAV.nav;
    
    return returnValue;
  } catch (error) {
    console.error(`Error calculating historical return for ${schemeCode}:`, error);
    return null;
  }
}

/**
 * Calculate portfolio historical returns for multiple time periods
 * @param {Array} basket - Array of funds with {symbol, schemeCode, allocation, percentage}
 * @returns {Object} - Returns for 1Y, 3Y, 5Y
 */
async function calculatePortfolioHistoricalReturns(basket) {
  try {
    const periods = {
      '1Y': 365,
      '3Y': 1095,
      '5Y': 1825
    };
    
    const portfolioReturns = {};
    
    for (const [period, days] of Object.entries(periods)) {
      let weightedReturn = 0;
      let totalWeight = 0;
      let fundsWithData = 0;
      
      for (const fund of basket) {
        let schemeCode = fund.schemeCode;
        
        // If no schemeCode, try to find it
        if (!schemeCode) {
          schemeCode = await findSchemeCodeForFund(fund.symbol, fund.name);
        }
        
        if (!schemeCode) {
          console.log(`No scheme code found for fund: ${fund.name || fund.symbol}`);
          continue;
        }
        
        const fundReturn = await calculateHistoricalReturn(schemeCode, days);
        
        if (fundReturn !== null) {
          const weight = fund.percentage / 100;
          weightedReturn += fundReturn * weight;
          totalWeight += weight;
          fundsWithData++;
        }
      }
      
      // Only include period if we have data for at least 50% of funds
      if (fundsWithData >= basket.length * 0.5 && totalWeight > 0) {
        portfolioReturns[period] = weightedReturn / totalWeight;
      } else {
        portfolioReturns[period] = null;
      }
    }
    
    return portfolioReturns;
  } catch (error) {
    console.error('Error calculating portfolio historical returns:', error);
    throw error;
  }
}

/**
 * Find scheme code for a fund by symbol or name
 * @param {string} symbol - Fund symbol
 * @param {string} name - Fund name
 * @returns {string|null} - Scheme code or null
 */
async function findSchemeCodeForFund(symbol, name) {
  try {
    // If symbol already looks like a scheme code (numeric), return it
    if (/^\d+$/.test(symbol)) {
      return symbol;
    }
    
    // Try to find NAV record by symbol or name
    const navRecord = await NAV.findOne({
      $or: [
        { schemeCode: symbol },
        { schemeName: { $regex: name, $options: 'i' } }
      ]
    }).sort({ date: -1 }).limit(1);
    
    if (navRecord) {
      return navRecord.schemeCode;
    }
    
    return null;
  } catch (error) {
    console.error(`Error finding scheme code for ${symbol}:`, error);
    return null;
  }
}

/**
 * Calculate blended benchmark returns using historical data
 * @param {Array} basket - Array of funds with category information
 * @param {Object} benchmarkReturns - Benchmark returns from benchmarkService
 * @returns {Object} - Benchmark returns for 1Y, 3Y, 5Y
 */
function calculateBlendedBenchmarkReturns(basket, benchmarkReturns) {
  try {
    const periods = ['1Y', '3Y', '5Y'];
    const blendedReturns = {};
    
    // Calculate category weights
    const categoryWeights = {};
    let totalWeight = 0;
    
    basket.forEach(fund => {
      const category = fund.category || 'flexi_cap';
      const weight = fund.percentage / 100;
      
      if (!categoryWeights[category]) {
        categoryWeights[category] = 0;
      }
      categoryWeights[category] += weight;
      totalWeight += weight;
    });
    
    // Normalize weights
    Object.keys(categoryWeights).forEach(category => {
      categoryWeights[category] = categoryWeights[category] / totalWeight;
    });
    
    // Calculate weighted benchmark returns for each period
    periods.forEach(period => {
      let weightedReturn = 0;
      
      Object.entries(categoryWeights).forEach(([category, weight]) => {
        // Get benchmark return for this category and period
        const benchmarkReturn = benchmarkReturns[period] || 0;
        weightedReturn += benchmarkReturn * weight;
      });
      
      blendedReturns[period] = weightedReturn;
    });
    
    return blendedReturns;
  } catch (error) {
    console.error('Error calculating blended benchmark returns:', error);
    throw error;
  }
}

/**
 * Compare portfolio with benchmark using historical NAV data
 * @param {Array} basket - Array of funds
 * @param {Object} benchmarkData - Benchmark data from benchmarkService
 * @returns {Object} - Comparison results
 */
async function comparePortfolioWithBenchmarkHistorical(basket, benchmarkData) {
  try {
    // Calculate portfolio historical returns
    const basketReturn = await calculatePortfolioHistoricalReturns(basket);
    
    // Get benchmark returns
    const benchmarkReturn = benchmarkData.benchmarkReturn;
    
    // Calculate differences
    const difference = {};
    const beatsBenchmark = {};
    
    ['1Y', '3Y', '5Y'].forEach(period => {
      if (basketReturn[period] !== null && benchmarkReturn[period] !== undefined) {
        difference[period] = basketReturn[period] - benchmarkReturn[period];
        beatsBenchmark[period] = difference[period] > 0;
      } else {
        difference[period] = null;
        beatsBenchmark[period] = false;
      }
    });
    
    return {
      basketReturn,
      benchmarkReturn,
      difference,
      beatsBenchmark,
      benchmarkComponents: benchmarkData.benchmarkComponents
    };
  } catch (error) {
    console.error('Error comparing portfolio with benchmark:', error);
    throw error;
  }
}

module.exports = {
  calculateHistoricalReturn,
  calculatePortfolioHistoricalReturns,
  calculateBlendedBenchmarkReturns,
  comparePortfolioWithBenchmarkHistorical,
  findSchemeCodeForFund
};
