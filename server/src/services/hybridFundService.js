const FinancialData = require('../models/FinancialData');
const NAV = require('../models/NAV');

/**
 * Hybrid Fund Service
 * Combines curated funds (FinancialData) with real-time NAV data
 */

/**
 * Get curated funds with latest NAV prices
 */
async function getCuratedFundsWithLatestNAV() {
  try {
    // Get all curated funds
    const curatedFunds = await FinancialData.find({ type: 'mutual_fund' }).lean();
    
    // Enrich with latest NAV data
    const enrichedFunds = await Promise.all(
      curatedFunds.map(async (fund) => {
        // Try to find matching NAV data by scheme name
        const latestNAV = await NAV.findOne({
          $or: [
            { schemeCode: fund.symbol },
            { schemeName: { $regex: fund.name, $options: 'i' } }
          ]
        }).sort({ date: -1 }).limit(1);
        
        if (latestNAV) {
          return {
            ...fund,
            latestNAV: latestNAV.nav,
            navDate: latestNAV.date,
            schemeCode: latestNAV.schemeCode,
            realTimeData: true
          };
        }
        
        // Fallback to historical data if no NAV found
        const latestPrice = fund.priceHistory && fund.priceHistory.length > 0
          ? fund.priceHistory[fund.priceHistory.length - 1].close
          : null;
        
        return {
          ...fund,
          latestNAV: latestPrice,
          navDate: fund.priceHistory && fund.priceHistory.length > 0
            ? fund.priceHistory[fund.priceHistory.length - 1].date
            : null,
          realTimeData: false
        };
      })
    );
    
    return enrichedFunds;
  } catch (error) {
    console.error('Error getting curated funds with NAV:', error);
    throw error;
  }
}

/**
 * Update curated fund prices from NAV data
 */
async function syncCuratedFundsWithNAV() {
  try {
    console.log('🔄 Syncing curated funds with NAV data...');
    
    const curatedFunds = await FinancialData.find({ type: 'mutual_fund' });
    let updated = 0;
    let notFound = 0;
    
    for (const fund of curatedFunds) {
      // Try to find matching NAV data
      const latestNAV = await NAV.findOne({
        $or: [
          { schemeCode: fund.symbol },
          { schemeName: { $regex: fund.name, $options: 'i' } }
        ]
      }).sort({ date: -1 }).limit(1);
      
      if (latestNAV) {
        // Update the fund's latest price in priceHistory
        const existingHistory = fund.priceHistory || [];
        const lastHistoryDate = existingHistory.length > 0
          ? existingHistory[existingHistory.length - 1].date
          : null;
        
        // Only add if it's a new date
        if (!lastHistoryDate || new Date(latestNAV.date) > new Date(lastHistoryDate)) {
          existingHistory.push({
            date: latestNAV.date,
            close: latestNAV.nav,
            open: latestNAV.nav,
            high: latestNAV.nav,
            low: latestNAV.nav
          });
          
          fund.priceHistory = existingHistory;
          
          // Store scheme code for future reference
          if (!fund.meta) fund.meta = {};
          fund.meta.schemeCode = latestNAV.schemeCode;
          
          await fund.save();
          updated++;
        }
      } else {
        notFound++;
      }
    }
    
    console.log(`✅ Sync complete: ${updated} updated, ${notFound} not found in NAV data`);
    
    return {
      success: true,
      updated,
      notFound,
      total: curatedFunds.length
    };
  } catch (error) {
    console.error('Error syncing curated funds:', error);
    throw error;
  }
}

/**
 * Get fund details with real-time NAV
 */
async function getFundWithLatestNAV(fundId) {
  try {
    const fund = await FinancialData.findById(fundId).lean();
    
    if (!fund) {
      throw new Error('Fund not found');
    }
    
    // Get latest NAV
    const latestNAV = await NAV.findOne({
      $or: [
        { schemeCode: fund.symbol },
        { schemeCode: fund.meta?.schemeCode },
        { schemeName: { $regex: fund.name, $options: 'i' } }
      ]
    }).sort({ date: -1 }).limit(1);
    
    if (latestNAV) {
      return {
        ...fund,
        latestNAV: latestNAV.nav,
        navDate: latestNAV.date,
        schemeCode: latestNAV.schemeCode,
        realTimeData: true
      };
    }
    
    return {
      ...fund,
      latestNAV: fund.priceHistory && fund.priceHistory.length > 0
        ? fund.priceHistory[fund.priceHistory.length - 1].close
        : null,
      realTimeData: false
    };
  } catch (error) {
    console.error('Error getting fund with NAV:', error);
    throw error;
  }
}

/**
 * Search all funds (curated + NAV database)
 */
async function searchAllFunds(query, options = {}) {
  try {
    const { limit = 50, category, includeNonCurated = true } = options;
    
    // Search curated funds
    const curatedQuery = {
      type: 'mutual_fund',
      name: { $regex: query, $options: 'i' }
    };
    
    if (category) {
      curatedQuery['meta.category'] = { $regex: category, $options: 'i' };
    }
    
    const curatedFunds = await FinancialData.find(curatedQuery)
      .limit(limit)
      .lean();
    
    const results = curatedFunds.map(fund => ({
      ...fund,
      isCurated: true,
      source: 'curated'
    }));
    
    // If we want non-curated funds and haven't hit the limit
    if (includeNonCurated && results.length < limit) {
      const navQuery = {
        schemeName: { $regex: query, $options: 'i' }
      };
      
      if (category) {
        navQuery.category = { $regex: category, $options: 'i' };
      }
      
      const navFunds = await NAV.aggregate([
        { $match: navQuery },
        { $sort: { date: -1 } },
        {
          $group: {
            _id: '$schemeCode',
            schemeName: { $first: '$schemeName' },
            category: { $first: '$category' },
            nav: { $first: '$nav' },
            date: { $first: '$date' }
          }
        },
        { $limit: limit - results.length }
      ]);
      
      // Add NAV funds that aren't already in curated list
      const curatedCodes = new Set(
        curatedFunds.map(f => f.meta?.schemeCode).filter(Boolean)
      );
      
      navFunds.forEach(navFund => {
        if (!curatedCodes.has(navFund._id)) {
          results.push({
            symbol: navFund._id,
            name: navFund.schemeName,
            type: 'mutual_fund',
            meta: { category: navFund.category },
            latestNAV: navFund.nav,
            navDate: navFund.date,
            isCurated: false,
            source: 'nav'
          });
        }
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error searching all funds:', error);
    throw error;
  }
}

/**
 * Get fund by scheme code (from either source)
 */
async function getFundBySchemeCode(schemeCode) {
  try {
    // Try curated funds first
    const curatedFund = await FinancialData.findOne({
      $or: [
        { symbol: schemeCode },
        { 'meta.schemeCode': schemeCode }
      ]
    }).lean();
    
    if (curatedFund) {
      // Enrich with latest NAV
      const latestNAV = await NAV.getLatestNAV(schemeCode);
      
      return {
        ...curatedFund,
        latestNAV: latestNAV ? latestNAV.nav : null,
        navDate: latestNAV ? latestNAV.date : null,
        isCurated: true,
        source: 'curated'
      };
    }
    
    // Fall back to NAV database
    const latestNAV = await NAV.getLatestNAV(schemeCode);
    
    if (latestNAV) {
      return {
        symbol: latestNAV.schemeCode,
        name: latestNAV.schemeName,
        type: 'mutual_fund',
        meta: { category: latestNAV.category },
        latestNAV: latestNAV.nav,
        navDate: latestNAV.date,
        isCurated: false,
        source: 'nav'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting fund by scheme code:', error);
    throw error;
  }
}

/**
 * Map AMFI category to internal category
 */
function mapAMFICategory(amfiCategory) {
  const categoryMap = {
    'Large Cap': 'large_cap',
    'Mid Cap': 'mid_cap',
    'Small Cap': 'small_cap',
    'Multi Cap': 'flexi_cap',
    'Flexi Cap': 'flexi_cap',
    'ELSS': 'elss',
    'Hybrid': 'balanced',
    'Debt': 'debt',
    'Liquid': 'liquid',
    'Banking': 'debt',
    'PSU': 'debt'
  };
  
  for (const [key, value] of Object.entries(categoryMap)) {
    if (amfiCategory.includes(key)) {
      return value;
    }
  }
  
  return 'other';
}

module.exports = {
  getCuratedFundsWithLatestNAV,
  syncCuratedFundsWithNAV,
  getFundWithLatestNAV,
  searchAllFunds,
  getFundBySchemeCode,
  mapAMFICategory
};
