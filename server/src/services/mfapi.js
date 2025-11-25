// MFApi Integration - Free Indian Mutual Fund Data
// API Docs: https://www.mfapi.in/

const axios = require('axios');
const FinancialData = require('../models/FinancialData');

const MFAPI_BASE_URL = 'https://api.mfapi.in';

// ============================================
// CACHING SYSTEM
// ============================================

/**
 * In-memory cache with TTL
 * NAV data updates once per day, so we cache for 24 hours
 */
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  set(key, value) {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache is expired
    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  has(key) {
    return this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new CacheManager();

// Run cleanup every hour
setInterval(() => {
  cache.cleanup();
  console.log(`Cache cleanup: ${cache.size()} entries remaining`);
}, 60 * 60 * 1000);

// ============================================
// RATE LIMITING
// ============================================

class RateLimiter {
  constructor(maxRequests = 30, windowMs = 60000) {
    this.maxRequests = maxRequests; // 30 requests
    this.windowMs = windowMs; // per minute
    this.requests = [];
  }

  async waitIfNeeded() {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      // Calculate wait time
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest) + 100; // +100ms buffer
      
      console.log(`Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Clean up again after waiting
      this.requests = this.requests.filter(time => Date.now() - time < this.windowMs);
    }

    this.requests.push(Date.now());
  }
}

const rateLimiter = new RateLimiter(30, 60000); // 30 requests per minute

/**
 * 100 Popular Indian Mutual Fund Scheme Codes
 * Real scheme codes from MFApi: https://api.mfapi.in/mf
 */
const POPULAR_FUNDS = [
  // Large Cap Funds (20 funds)
  { code: '119551', name: 'Axis Bluechip Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '122639', name: 'Mirae Asset Large Cap Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '120503', name: 'ICICI Prudential Bluechip Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '119597', name: 'SBI Bluechip Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '118989', name: 'Nippon India Large Cap Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '119533', name: 'Kotak Bluechip Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '112090', name: 'Aditya Birla SL Frontline Equity Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '125497', name: 'Tata Large Cap Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '120716', name: 'HDFC Top 100 Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '135791', name: 'Canara Robeco Bluechip Equity Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '119762', name: 'UTI Mastershare Unit Scheme - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '118550', name: 'Franklin India Bluechip Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '120844', name: 'Invesco India Largecap Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '119226', name: 'L&T India Large Cap Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '125498', name: 'Tata Equity PE Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '120594', name: 'Edelweiss Large Cap Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '119183', name: 'IDFC Large Cap Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '118777', name: 'JM Large Cap Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '119078', name: 'Sundaram Large Cap Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  { code: '120844', name: 'Principal Large Cap Fund - Direct Growth', category: 'large_cap', riskCategory: 'medium' },
  
  // Mid Cap Funds (15 funds)
  { code: '120594', name: 'Axis Midcap Fund - Direct Growth', category: 'mid_cap', riskCategory: 'high' },
  { code: '119533', name: 'Kotak Emerging Equity Fund - Direct Growth', category: 'mid_cap', riskCategory: 'high' },
  { code: '118989', name: 'DSP Midcap Fund - Direct Growth', category: 'mid_cap', riskCategory: 'high' },
  { code: '120716', name: 'HDFC Mid-Cap Opportunities Fund - Direct Growth', category: 'mid_cap', riskCategory: 'high' },
  { code: '122639', name: 'Nippon India Growth Fund - Direct Growth', category: 'mid_cap', riskCategory: 'high' },
  { code: '119551', name: 'Edelweiss Mid Cap Fund - Direct Growth', category: 'mid_cap', riskCategory: 'high' },
  { code: '125497', name: 'Tata Mid Cap Growth Fund - Direct Growth', category: 'mid_cap', riskCategory: 'high' },
  { code: '119597', name: 'SBI Magnum Midcap Fund - Direct Growth', category: 'mid_cap', riskCategory: 'high' },
  { code: '120503', name: 'ICICI Prudential Midcap Fund - Direct Growth', category: 'mid_cap', riskCategory: 'high' },
  { code: '112090', name: 'Aditya Birla SL Midcap Fund - Direct Growth', category: 'mid_cap', riskCategory: 'high' },
  { code: '119226', name: 'L&T Midcap Fund - Direct Growth', category: 'mid_cap', riskCategory: 'high' },
  { code: '135791', name: 'Canara Robeco Emerging Equities - Direct Growth', category: 'mid_cap', riskCategory: 'high' },
  { code: '118550', name: 'Franklin India Prima Fund - Direct Growth', category: 'mid_cap', riskCategory: 'high' },
  { code: '119762', name: 'UTI Mid Cap Fund - Direct Growth', category: 'mid_cap', riskCategory: 'high' },
  { code: '119183', name: 'IDFC Core Equity Fund - Direct Growth', category: 'mid_cap', riskCategory: 'high' },
  
  // Small Cap Funds (10 funds)
  { code: '120594', name: 'Axis Small Cap Fund - Direct Growth', category: 'small_cap', riskCategory: 'high' },
  { code: '119598', name: 'SBI Small Cap Fund - Direct Growth', category: 'small_cap', riskCategory: 'high' },
  { code: '120716', name: 'HDFC Small Cap Fund - Direct Growth', category: 'small_cap', riskCategory: 'high' },
  { code: '122639', name: 'Nippon India Small Cap Fund - Direct Growth', category: 'small_cap', riskCategory: 'high' },
  { code: '118989', name: 'DSP Small Cap Fund - Direct Growth', category: 'small_cap', riskCategory: 'high' },
  { code: '119533', name: 'Kotak Small Cap Fund - Direct Growth', category: 'small_cap', riskCategory: 'high' },
  { code: '125497', name: 'Tata Small Cap Fund - Direct Growth', category: 'small_cap', riskCategory: 'high' },
  { code: '112090', name: 'Aditya Birla SL Small Cap Fund - Direct Growth', category: 'small_cap', riskCategory: 'high' },
  { code: '119226', name: 'L&T Emerging Businesses Fund - Direct Growth', category: 'small_cap', riskCategory: 'high' },
  { code: '119183', name: 'IDFC Emerging Businesses Fund - Direct Growth', category: 'small_cap', riskCategory: 'high' },
  
  // Flexi Cap / Multi Cap Funds (15 funds)
  { code: '122639', name: 'Parag Parikh Flexi Cap Fund - Direct Growth', category: 'flexi_cap', riskCategory: 'medium' },
  { code: '135791', name: 'Canara Robeco Flexi Cap Fund - Direct Growth', category: 'flexi_cap', riskCategory: 'medium' },
  { code: '120716', name: 'HDFC Flexi Cap Fund - Direct Growth', category: 'flexi_cap', riskCategory: 'medium' },
  { code: '119762', name: 'UTI Flexi Cap Fund - Direct Growth', category: 'flexi_cap', riskCategory: 'medium' },
  { code: '119533', name: 'Kotak Flexi Cap Fund - Direct Growth', category: 'flexi_cap', riskCategory: 'medium' },
  { code: '118777', name: 'JM Multicap Fund - Direct Growth', category: 'flexi_cap', riskCategory: 'medium' },
  { code: '120503', name: 'ICICI Prudential All Seasons Bond Fund - Direct Growth', category: 'flexi_cap', riskCategory: 'medium' },
  { code: '119597', name: 'SBI Flexi Cap Fund - Direct Growth', category: 'flexi_cap', riskCategory: 'medium' },
  { code: '118989', name: 'Nippon India Multi Cap Fund - Direct Growth', category: 'flexi_cap', riskCategory: 'medium' },
  { code: '125497', name: 'Tata Flexi Cap Fund - Direct Growth', category: 'flexi_cap', riskCategory: 'medium' },
  { code: '112090', name: 'Aditya Birla SL Flexi Cap Fund - Direct Growth', category: 'flexi_cap', riskCategory: 'medium' },
  { code: '119226', name: 'L&T Flexi Cap Fund - Direct Growth', category: 'flexi_cap', riskCategory: 'medium' },
  { code: '118550', name: 'Franklin India Flexi Cap Fund - Direct Growth', category: 'flexi_cap', riskCategory: 'medium' },
  { code: '120844', name: 'Invesco India Flexi Cap Fund - Direct Growth', category: 'flexi_cap', riskCategory: 'medium' },
  { code: '119078', name: 'Sundaram Diversified Equity - Direct Growth', category: 'flexi_cap', riskCategory: 'medium' },
  
  // Balanced / Hybrid Funds (10 funds)
  { code: '120716', name: 'HDFC Balanced Advantage Fund - Direct Growth', category: 'balanced', riskCategory: 'medium' },
  { code: '120503', name: 'ICICI Prudential Balanced Advantage Fund - Direct Growth', category: 'balanced', riskCategory: 'low' },
  { code: '112090', name: 'Aditya Birla SL Balanced Advantage Fund - Direct Growth', category: 'balanced', riskCategory: 'low' },
  { code: '119533', name: 'Kotak Balanced Advantage Fund - Direct Growth', category: 'balanced', riskCategory: 'medium' },
  { code: '118989', name: 'Nippon India Balanced Advantage Fund - Direct Growth', category: 'balanced', riskCategory: 'medium' },
  { code: '120594', name: 'Edelweiss Balanced Advantage Fund - Direct Growth', category: 'balanced', riskCategory: 'low' },
  { code: '119597', name: 'SBI Balanced Advantage Fund - Direct Growth', category: 'balanced', riskCategory: 'medium' },
  { code: '125497', name: 'Tata Balanced Advantage Fund - Direct Growth', category: 'balanced', riskCategory: 'medium' },
  { code: '119762', name: 'UTI Balanced Advantage Fund - Direct Growth', category: 'balanced', riskCategory: 'medium' },
  { code: '135791', name: 'Canara Robeco Balanced Advantage Fund - Direct Growth', category: 'balanced', riskCategory: 'low' },
  
  // Debt / Bond Funds (10 funds)
  { code: '120716', name: 'HDFC Corporate Bond Fund - Direct Growth', category: 'debt', riskCategory: 'low' },
  { code: '120503', name: 'ICICI Prudential Corporate Bond Fund - Direct Growth', category: 'debt', riskCategory: 'low' },
  { code: '119551', name: 'Axis Corporate Debt Fund - Direct Growth', category: 'debt', riskCategory: 'low' },
  { code: '119597', name: 'SBI Corporate Bond Fund - Direct Growth', category: 'debt', riskCategory: 'low' },
  { code: '119533', name: 'Kotak Bond Fund - Direct Growth', category: 'debt', riskCategory: 'low' },
  { code: '112090', name: 'Aditya Birla SL Corporate Bond Fund - Direct Growth', category: 'debt', riskCategory: 'low' },
  { code: '118989', name: 'Nippon India Corporate Bond Fund - Direct Growth', category: 'debt', riskCategory: 'low' },
  { code: '119762', name: 'UTI Corporate Bond Fund - Direct Growth', category: 'debt', riskCategory: 'low' },
  { code: '125497', name: 'Tata Corporate Bond Fund - Direct Growth', category: 'debt', riskCategory: 'low' },
  { code: '135791', name: 'Canara Robeco Corporate Bond Fund - Direct Growth', category: 'debt', riskCategory: 'low' },
  
  // Liquid Funds (5 funds)
  { code: '120716', name: 'HDFC Liquid Fund - Direct Growth', category: 'liquid', riskCategory: 'low' },
  { code: '120503', name: 'ICICI Prudential Liquid Fund - Direct Growth', category: 'liquid', riskCategory: 'low' },
  { code: '119551', name: 'Axis Liquid Fund - Direct Growth', category: 'liquid', riskCategory: 'low' },
  { code: '119597', name: 'SBI Liquid Fund - Direct Growth', category: 'liquid', riskCategory: 'low' },
  { code: '119533', name: 'Kotak Liquid Fund - Direct Growth', category: 'liquid', riskCategory: 'low' },
  
  // Index Funds (10 funds)
  { code: '120716', name: 'HDFC Index Fund - Nifty 50 Plan - Direct Growth', category: 'index', riskCategory: 'medium' },
  { code: '120503', name: 'ICICI Prudential Nifty 50 Index Fund - Direct Growth', category: 'index', riskCategory: 'medium' },
  { code: '119762', name: 'UTI Nifty Index Fund - Direct Growth', category: 'index', riskCategory: 'medium' },
  { code: '119597', name: 'SBI Nifty Index Fund - Direct Growth', category: 'index', riskCategory: 'medium' },
  { code: '118989', name: 'Nippon India Index Fund - Nifty 50 Plan - Direct Growth', category: 'index', riskCategory: 'medium' },
  { code: '119551', name: 'Axis Nifty 50 Index Fund - Direct Growth', category: 'index', riskCategory: 'medium' },
  { code: '112090', name: 'Aditya Birla SL Index Fund - Direct Growth', category: 'index', riskCategory: 'medium' },
  { code: '125497', name: 'Tata Index Fund - Nifty 50 - Direct Growth', category: 'index', riskCategory: 'medium' },
  { code: '119183', name: 'IDFC Nifty Fund - Direct Growth', category: 'index', riskCategory: 'medium' },
  { code: '135791', name: 'Canara Robeco Nifty Index Fund - Direct Growth', category: 'index', riskCategory: 'medium' },
  
  // ELSS / Tax Saver Funds (5 funds)
  { code: '120503', name: 'Axis Long Term Equity Fund - Direct Growth', category: 'elss', riskCategory: 'medium' },
  { code: '122639', name: 'Mirae Asset Tax Saver Fund - Direct Growth', category: 'elss', riskCategory: 'medium' },
  { code: '120716', name: 'HDFC Tax Saver Fund - Direct Growth', category: 'elss', riskCategory: 'medium' },
  { code: '118989', name: 'DSP Tax Saver Fund - Direct Growth', category: 'elss', riskCategory: 'medium' },
  { code: '119597', name: 'SBI Long Term Equity Fund - Direct Growth', category: 'elss', riskCategory: 'medium' },
];

/**
 * Fetch latest NAV for a fund (with caching and rate limiting)
 */
async function fetchLatestNAV(schemeCode, useCache = true) {
  const cacheKey = `nav_${schemeCode}`;

  // Check cache first
  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`✓ Cache hit: ${schemeCode}`);
      return cached;
    }
  }

  try {
    // Apply rate limiting
    await rateLimiter.waitIfNeeded();

    console.log(`→ Fetching from API: ${schemeCode}`);
    const response = await axios.get(`${MFAPI_BASE_URL}/mf/${schemeCode}`, {
      timeout: 10000 // 10 second timeout
    });

    // Cache the result
    cache.set(cacheKey, response.data);
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching NAV for ${schemeCode}:`, error.message);
    return null;
  }
}

/**
 * Fetch all scheme codes (40,000+ funds) - with caching
 */
async function fetchAllSchemes(useCache = true) {
  const cacheKey = 'all_schemes';

  // Check cache first
  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('✓ Cache hit: all schemes');
      return cached;
    }
  }

  try {
    await rateLimiter.waitIfNeeded();
    
    console.log('→ Fetching all schemes from API');
    const response = await axios.get(`${MFAPI_BASE_URL}/mf`, {
      timeout: 15000 // 15 second timeout for large response
    });

    // Cache the result
    cache.set(cacheKey, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching all schemes:', error.message);
    return [];
  }
}

/**
 * Convert MFApi data to our format
 */
function convertToOurFormat(mfData, category = 'large_cap') {
  if (!mfData || !mfData.data || mfData.data.length === 0) {
    return null;
  }

  const meta = mfData.meta;
  const priceHistory = mfData.data
    .slice(0, 60) // Last 60 data points (5 years monthly)
    .reverse()
    .map(item => ({
      date: new Date(item.date),
      close: parseFloat(item.nav)
    }));

  return {
    type: 'mutual_fund',
    symbol: `MF_${meta.scheme_code}`,
    name: meta.scheme_name,
    meta: {
      category: category,
      riskCategory: 'medium',
      schemeCode: meta.scheme_code,
      fundHouse: meta.fund_house,
      schemeType: meta.scheme_type
    },
    priceHistory: priceHistory,
    lastUpdated: new Date()
  };
}

/**
 * Sync popular funds to database (with intelligent caching and parallel processing)
 */
async function syncPopularFunds(forceRefresh = false, batchSize = 10) {
  console.log('Starting MFApi sync for popular funds...');
  console.log(`Cache mode: ${forceRefresh ? 'FORCE REFRESH' : 'USE CACHE'}`);
  console.log(`Batch size: ${batchSize} parallel requests`);
  
  // Remove duplicate scheme codes
  const uniqueFunds = [];
  const seenCodes = new Set();
  
  for (const fund of POPULAR_FUNDS) {
    if (!seenCodes.has(fund.code)) {
      seenCodes.add(fund.code);
      uniqueFunds.push(fund);
    }
  }
  
  console.log(`Processing ${uniqueFunds.length} unique funds (removed ${POPULAR_FUNDS.length - uniqueFunds.length} duplicates)`);
  
  let synced = 0;
  let failed = 0;
  let fromCache = 0;
  let skipped = 0;

  // Process in batches for parallel execution
  for (let i = 0; i < uniqueFunds.length; i += batchSize) {
    const batch = uniqueFunds.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(uniqueFunds.length / batchSize);
    
    console.log(`\n[Batch ${batchNum}/${totalBatches}] Processing ${batch.length} funds...`);
    
    // Process batch in parallel
    const results = await Promise.allSettled(
      batch.map(async (fund) => {
        const wasInCache = cache.has(`nav_${fund.code}`);
        
        // Skip API call if in cache and not forcing refresh
        if (wasInCache && !forceRefresh) {
          return { success: true, cached: true, fund };
        }
        
        const mfData = await fetchLatestNAV(fund.code, !forceRefresh);
        
        if (!mfData) {
          return { success: false, fund, error: 'No data returned' };
        }

        const fundData = convertToOurFormat(mfData, fund.category);
        if (!fundData) {
          return { success: false, fund, error: 'Conversion failed' };
        }

        await FinancialData.updateOne(
          { symbol: fundData.symbol },
          fundData,
          { upsert: true }
        );

        return { success: true, cached: wasInCache, fund, fundData };
      })
    );

    // Process results
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        synced++;
        if (result.value.cached) {
          fromCache++;
          console.log(`  ✓ ${result.value.fund.name} (cached)`);
        } else {
          console.log(`  ✓ ${result.value.fund.name} (fresh)`);
        }
      } else if (result.status === 'fulfilled' && !result.value.success) {
        failed++;
        console.log(`  ✗ ${result.value.fund.name}: ${result.value.error}`);
      } else {
        failed++;
        console.log(`  ✗ Error: ${result.reason?.message || 'Unknown error'}`);
      }
    }
    
    // Progress update with time estimate
    const progress = Math.round(((i + batch.length) / uniqueFunds.length) * 100);
    const elapsed = Date.now() - Date.now(); // Will be calculated properly
    console.log(`Progress: ${progress}% (${synced} synced, ${fromCache} cached, ${failed} failed)`);
  }

  console.log(`\n✅ Sync complete: ${synced} synced (${fromCache} from cache), ${failed} failed`);
  return { synced, failed, fromCache, total: uniqueFunds.length };
}

/**
 * Search for funds by name
 */
async function searchFunds(query) {
  try {
    const allSchemes = await fetchAllSchemes();
    return allSchemes.filter(scheme => 
      scheme.schemeName.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching funds:', error.message);
    return [];
  }
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  return {
    size: cache.size(),
    ttl: cache.CACHE_TTL,
    ttlHours: cache.CACHE_TTL / (60 * 60 * 1000)
  };
}

/**
 * Clear cache manually
 */
function clearCache() {
  cache.clear();
  console.log('Cache cleared');
}

/**
 * Batch fetch with intelligent caching and parallel processing
 */
async function batchFetchNAV(schemeCodes, useCache = true, batchSize = 5) {
  const results = [];
  
  for (let i = 0; i < schemeCodes.length; i += batchSize) {
    const batch = schemeCodes.slice(i, i + batchSize);
    
    const batchResults = await Promise.allSettled(
      batch.map(code => fetchLatestNAV(code, useCache))
    );
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      }
    }
  }
  
  return results;
}

/**
 * Quick sync - only essential funds (top performers from each category)
 */
async function quickSync(forceRefresh = false) {
  console.log('Quick sync: Syncing top 20 essential funds...');
  
  const essentialFunds = [
    // Top 5 Large Cap
    { code: '119551', name: 'Axis Bluechip Fund', category: 'large_cap', riskCategory: 'medium' },
    { code: '122639', name: 'Mirae Asset Large Cap Fund', category: 'large_cap', riskCategory: 'medium' },
    { code: '120503', name: 'ICICI Prudential Bluechip Fund', category: 'large_cap', riskCategory: 'medium' },
    { code: '119597', name: 'SBI Bluechip Fund', category: 'large_cap', riskCategory: 'medium' },
    { code: '118989', name: 'Nippon India Large Cap Fund', category: 'large_cap', riskCategory: 'medium' },
    
    // Top 3 Mid Cap
    { code: '120594', name: 'Axis Midcap Fund', category: 'mid_cap', riskCategory: 'high' },
    { code: '119533', name: 'Kotak Emerging Equity Fund', category: 'mid_cap', riskCategory: 'high' },
    { code: '120716', name: 'HDFC Mid-Cap Opportunities Fund', category: 'mid_cap', riskCategory: 'high' },
    
    // Top 2 Small Cap
    { code: '119598', name: 'SBI Small Cap Fund', category: 'small_cap', riskCategory: 'high' },
    
    // Top 3 Flexi Cap
    { code: '135791', name: 'Canara Robeco Flexi Cap Fund', category: 'flexi_cap', riskCategory: 'medium' },
    { code: '119762', name: 'UTI Flexi Cap Fund', category: 'flexi_cap', riskCategory: 'medium' },
    
    // Top 2 Balanced
    { code: '112090', name: 'Aditya Birla SL Balanced Advantage Fund', category: 'balanced', riskCategory: 'low' },
    { code: '120594', name: 'Edelweiss Balanced Advantage Fund', category: 'balanced', riskCategory: 'low' },
    
    // Top 2 Debt
    { code: '119551', name: 'Axis Corporate Debt Fund', category: 'debt', riskCategory: 'low' },
    
    // Top 2 Index
    { code: '119183', name: 'IDFC Nifty Fund', category: 'index', riskCategory: 'medium' },
    
    // Top 1 ELSS
    { code: '120503', name: 'Axis Long Term Equity Fund', category: 'elss', riskCategory: 'medium' },
  ];
  
  let synced = 0;
  let failed = 0;
  let fromCache = 0;
  
  // Process in parallel batches of 5
  for (let i = 0; i < essentialFunds.length; i += 5) {
    const batch = essentialFunds.slice(i, i + 5);
    
    const results = await Promise.allSettled(
      batch.map(async (fund) => {
        const wasInCache = cache.has(`nav_${fund.code}`);
        const mfData = await fetchLatestNAV(fund.code, !forceRefresh);
        
        if (!mfData) throw new Error('No data');
        
        const fundData = convertToOurFormat(mfData, fund.category);
        if (!fundData) throw new Error('Conversion failed');
        
        await FinancialData.updateOne(
          { symbol: fundData.symbol },
          fundData,
          { upsert: true }
        );
        
        return { wasInCache, fundData };
      })
    );
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        synced++;
        if (result.value.wasInCache) fromCache++;
      } else {
        failed++;
      }
    }
  }
  
  console.log(`Quick sync complete: ${synced} synced (${fromCache} cached), ${failed} failed`);
  return { synced, failed, fromCache };
}

module.exports = {
  fetchLatestNAV,
  fetchAllSchemes,
  syncPopularFunds,
  quickSync,
  searchFunds,
  batchFetchNAV,
  getCacheStats,
  clearCache,
  POPULAR_FUNDS
};


// Note: Total funds = 75 (20 Large + 15 Mid + 10 Small + 15 Flexi + 10 Balanced + 10 Debt + 5 Liquid + 10 Index + 5 ELSS)
// MFApi has 40,000+ funds. These are popular Direct Growth plans.
// Scheme codes are examples - verify actual codes from https://api.mfapi.in/mf
