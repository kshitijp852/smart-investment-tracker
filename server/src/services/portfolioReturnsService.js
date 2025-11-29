const NAV = require('../models/NAV');

/**
 * Calculate portfolio returns based on holdings using CAGR
 * @param {Array} holdings - Array of {schemeCode, allocation, percentage} or {schemeCode, units, investmentDate}
 * @param {number} projectionYears - Years to project into future (optional)
 */
async function calculatePortfolioReturns(holdings, projectionYears = null) {
  try {
    const results = [];
    let totalInvested = 0;
    let totalCurrentValue = 0;
    let weightedCAGR = 0;
    let totalWeight = 0;
    
    for (const holding of holdings) {
      const { schemeCode, units, investmentDate, allocation, percentage } = holding;
      
      // Handle two types of holdings: actual holdings or portfolio allocations
      if (units && investmentDate) {
        // Actual holding with investment history
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
        
        const latestNAV = await NAV.getLatestNAV(schemeCode);
        
        if (!latestNAV) {
          results.push({
            schemeCode,
            error: 'Latest NAV not found'
          });
          continue;
        }
        
        const investedAmount = units * investmentNAV.nav;
        const currentValue = units * latestNAV.nav;
        
        // Calculate CAGR
        const days = Math.floor(
          (latestNAV.date - investmentNAV.date) / (1000 * 60 * 60 * 24)
        );
        const years = days / 365;
        const cagr = years > 0 
          ? Math.pow(currentValue / investedAmount, 1 / years) - 1
          : 0;
        
        totalInvested += investedAmount;
        totalCurrentValue += currentValue;
        
        const weight = investedAmount / (totalInvested || 1);
        weightedCAGR += cagr * weight;
        totalWeight += weight;
        
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
          absoluteReturn: currentValue - investedAmount,
          cagr: parseFloat((cagr * 100).toFixed(2)),
          days
        });
      } else if (allocation || percentage) {
        // Portfolio allocation (for projections)
        const investedAmount = allocation || 0;
        const weight = (percentage || 0) / 100;
        
        // Calculate CAGR for this fund (use projection years or default to 3)
        const years = projectionYears || 3;
        const cagr = await calculateFundCAGR(schemeCode, years);
        
        if (cagr === null) {
          results.push({
            schemeCode,
            error: 'Insufficient NAV history'
          });
          continue;
        }
        
        const latestNAV = await NAV.getLatestNAV(schemeCode);
        
        totalInvested += investedAmount;
        weightedCAGR += cagr * weight;
        totalWeight += weight;
        
        // Project future value using CAGR
        const projectedValue = investedAmount * Math.pow(1 + cagr, years);
        
        results.push({
          schemeCode,
          schemeName: latestNAV?.schemeName || 'Unknown',
          category: latestNAV?.category || 'Unknown',
          allocation: investedAmount,
          percentage: percentage || 0,
          cagr: parseFloat((cagr * 100).toFixed(2)),
          projectedValue: parseFloat(projectedValue.toFixed(2)),
          expectedGain: parseFloat((projectedValue - investedAmount).toFixed(2)),
          years: years
        });
        
        totalCurrentValue += projectedValue;
      }
    }
    
    // Normalize weighted CAGR
    const portfolioCAGR = totalWeight > 0 ? weightedCAGR / totalWeight : weightedCAGR;
    
    // Calculate portfolio-level metrics
    const portfolioReturn = {
      totalInvested,
      totalCurrentValue,
      totalReturn: totalCurrentValue - totalInvested,
      portfolioCAGR: parseFloat((portfolioCAGR * 100).toFixed(2)),
      projectionYears: projectionYears
    };
    
    return {
      success: true,
      portfolio: portfolioReturn,
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
 * Calculate CAGR for a fund using NAV history
 * @param {string} schemeCode
 * @param {number} years - Number of years to look back
 * @returns {number|null} - CAGR as decimal (e.g., 0.10 for 10%)
 */
async function calculateFundCAGR(schemeCode, years) {
  try {
    const latestNAV = await NAV.findOne({ schemeCode })
      .sort({ date: -1 })
      .limit(1);
    
    if (!latestNAV) {
      return null;
    }
    
    const days = years * 365;
    const startDate = new Date(latestNAV.date);
    startDate.setDate(startDate.getDate() - days);
    
    const historicalNAV = await NAV.findOne({
      schemeCode,
      date: { $lte: startDate }
    }).sort({ date: -1 }).limit(1);
    
    if (!historicalNAV) {
      return null;
    }
    
    // Calculate actual years between dates
    const actualDays = Math.floor(
      (latestNAV.date - historicalNAV.date) / (1000 * 60 * 60 * 24)
    );
    const actualYears = actualDays / 365;
    
    if (actualYears <= 0) {
      return null;
    }
    
    // CAGR = (ending_value / beginning_value)^(1/years) - 1
    const cagr = Math.pow(latestNAV.nav / historicalNAV.nav, 1 / actualYears) - 1;
    
    return cagr;
  } catch (error) {
    console.error(`Error calculating CAGR for ${schemeCode}:`, error);
    return null;
  }
}

/**
 * Calculate returns for different time periods using CAGR
 * @param {string} schemeCode
 */
async function calculatePeriodReturns(schemeCode) {
  try {
    const latestNAV = await NAV.getLatestNAV(schemeCode);
    
    if (!latestNAV) {
      throw new Error('Scheme not found');
    }
    
    const periods = {
      '1M': 30 / 365,
      '3M': 90 / 365,
      '6M': 180 / 365,
      '1Y': 1,
      '3Y': 3,
      '5Y': 5
    };
    
    const returns = {};
    
    for (const [period, years] of Object.entries(periods)) {
      const cagr = await calculateFundCAGR(schemeCode, years);
      
      if (cagr !== null) {
        const absoluteReturn = cagr * 100;
        
        returns[period] = {
          cagr: parseFloat((cagr * 100).toFixed(2)),
          absoluteReturn: parseFloat(absoluteReturn.toFixed(2)),
          years: years
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
  calculatePeriodReturns,
  calculateFundCAGR
};
