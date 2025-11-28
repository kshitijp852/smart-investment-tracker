const NAV = require('../models/NAV');

/**
 * Calculate portfolio returns based on holdings
 * @param {Array} holdings - Array of {schemeCode, units, investmentDate}
 */
async function calculatePortfolioReturns(holdings) {
  try {
    const results = [];
    let totalInvested = 0;
    let totalCurrentValue = 0;
    
    for (const holding of holdings) {
      const { schemeCode, units, investmentDate } = holding;
      
      // Get NAV at investment date
      const investmentNAV = await NAV.findOne({
        schemeCode,
        date: { $lte: new Date(investmentDate) }
      }).sort({ date: -1 }).limit(1);
      
      if (!investmentNAV) {
        results.push({
          schemeCode,
          error: 'Investment NAV not found'
        });
        continue;
      }
      
      // Get latest NAV
      const latestNAV = await NAV.getLatestNAV(schemeCode);
      
      if (!latestNAV) {
        results.push({
          schemeCode,
          error: 'Latest NAV not found'
        });
        continue;
      }
      
      // Calculate returns
      const investedAmount = units * investmentNAV.nav;
      const currentValue = units * latestNAV.nav;
      const absoluteReturn = currentValue - investedAmount;
      const percentageReturn = ((currentValue - investedAmount) / investedAmount) * 100;
      
      // Calculate days and annualized return
      const days = Math.floor(
        (latestNAV.date - investmentNAV.date) / (1000 * 60 * 60 * 24)
      );
      const years = days / 365;
      const annualizedReturn = years > 0 
        ? (Math.pow(currentValue / investedAmount, 1 / years) - 1) * 100 
        : 0;
      
      totalInvested += investedAmount;
      totalCurrentValue += currentValue;
      
      results.push({
        schemeCode,
        schemeName: latestNAV.schemeName,
        category: latestNAV.category,
        units,
        investmentDate: investmentNAV.date,
        investmentNAV: investmentNAV.nav,
        currentDate: latestNAV.date,
        currentNAV: latestNAV.nav,
        investedAmount,
        currentValue,
        absoluteReturn,
        percentageReturn,
        annualizedReturn,
        days
      });
    }
    
    // Calculate portfolio-level metrics
    const portfolioReturn = totalInvested > 0 
      ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 
      : 0;
    
    return {
      success: true,
      portfolio: {
        totalInvested,
        totalCurrentValue,
        totalReturn: totalCurrentValue - totalInvested,
        portfolioReturn
      },
      holdings: results
    };
  } catch (error) {
    console.error('Error calculating portfolio returns:', error);
    throw error;
  }
}

/**
 * Calculate XIRR (Extended Internal Rate of Return)
 * @param {Array} cashflows - Array of {date, amount} (negative for investment, positive for redemption)
 */
function calculateXIRR(cashflows) {
  // Simple approximation - for production, use a proper XIRR library
  if (cashflows.length < 2) return 0;
  
  // Sort by date
  cashflows.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const firstDate = new Date(cashflows[0].date);
  const lastDate = new Date(cashflows[cashflows.length - 1].date);
  const years = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365);
  
  if (years === 0) return 0;
  
  const totalInvested = cashflows
    .filter(cf => cf.amount < 0)
    .reduce((sum, cf) => sum + Math.abs(cf.amount), 0);
  
  const totalRedeemed = cashflows
    .filter(cf => cf.amount > 0)
    .reduce((sum, cf) => sum + cf.amount, 0);
  
  if (totalInvested === 0) return 0;
  
  // Simple annualized return approximation
  const xirr = (Math.pow(totalRedeemed / totalInvested, 1 / years) - 1) * 100;
  
  return xirr;
}

/**
 * Calculate returns for different time periods
 * @param {string} schemeCode
 */
async function calculatePeriodReturns(schemeCode) {
  try {
    const latestNAV = await NAV.getLatestNAV(schemeCode);
    
    if (!latestNAV) {
      throw new Error('Scheme not found');
    }
    
    const periods = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      '3Y': 1095,
      '5Y': 1825
    };
    
    const returns = {};
    
    for (const [period, days] of Object.entries(periods)) {
      const startDate = new Date(latestNAV.date);
      startDate.setDate(startDate.getDate() - days);
      
      const startNAV = await NAV.findOne({
        schemeCode,
        date: { $lte: startDate }
      }).sort({ date: -1 }).limit(1);
      
      if (startNAV) {
        const years = days / 365;
        const absoluteReturn = ((latestNAV.nav - startNAV.nav) / startNAV.nav) * 100;
        const annualizedReturn = years > 0 
          ? (Math.pow(latestNAV.nav / startNAV.nav, 1 / years) - 1) * 100 
          : absoluteReturn;
        
        returns[period] = {
          absoluteReturn: parseFloat(absoluteReturn.toFixed(2)),
          annualizedReturn: parseFloat(annualizedReturn.toFixed(2)),
          startDate: startNAV.date,
          startNAV: startNAV.nav,
          endDate: latestNAV.date,
          endNAV: latestNAV.nav
        };
      } else {
        returns[period] = null;
      }
    }
    
    return {
      success: true,
      schemeCode,
      schemeName: latestNAV.schemeName,
      category: latestNAV.category,
      returns
    };
  } catch (error) {
    console.error('Error calculating period returns:', error);
    throw error;
  }
}

module.exports = {
  calculatePortfolioReturns,
  calculateXIRR,
  calculatePeriodReturns
};
