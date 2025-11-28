const axios = require('axios');
const NAV = require('../models/NAV');

const AMFI_URL = 'https://portal.amfiindia.com/spages/NAVAll.txt';

/**
 * Download AMFI NAV data
 */
async function downloadAMFIData() {
  try {
    console.log('📥 Downloading AMFI NAV data...');
    const response = await axios.get(AMFI_URL, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log('✅ AMFI data downloaded successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error downloading AMFI data:', error.message);
    throw error;
  }
}

/**
 * Parse AMFI NAV text data
 * Format:
 * Scheme Code;ISIN Div Payout/ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date
 */
function parseAMFIData(textData) {
  const lines = textData.split('\n');
  const records = [];
  let currentCategory = '';
  let currentAMC = '';
  
  for (let line of lines) {
    line = line.trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if this is a category header (starts with "Open Ended Schemes")
    if (line.startsWith('Open Ended Schemes')) {
      currentCategory = line
        .replace(/^Open Ended Schemes\s*\(\s*/i, '')
        .replace(/\)$/, '')
        .trim();
      continue;
    }
    
    // Check if this is an AMC name (doesn't start with a number and not a category)
    if (!/^\d/.test(line) && !line.startsWith('Scheme Code')) {
      currentAMC = line;
      continue;
    }
    
    // Skip header line
    if (line.startsWith('Scheme Code')) continue;
    
    // Parse data line
    const parts = line.split(';');
    
    // Need at least 6 parts for valid data (new format without repurchase/sale price)
    if (parts.length < 6) continue;
    
    const schemeCode = parts[0].trim();
    const schemeName = parts[3].trim();
    const navStr = parts[4].trim();
    const dateStr = parts[5].trim();
    
    // Skip if essential data is missing
    if (!schemeCode || !schemeName || !navStr || !dateStr) continue;
    
    const nav = parseFloat(navStr);
    if (isNaN(nav)) continue;
    
    // Parse date (format: DD-MMM-YYYY)
    const date = parseDateString(dateStr);
    if (!date) continue;
    
    records.push({
      schemeCode,
      schemeName,
      category: currentCategory || 'Other',
      nav,
      repurchasePrice: null,
      salePrice: null,
      date
    });
  }
  
  console.log(`📊 Parsed ${records.length} NAV records from ${currentAMC || 'AMFI'}`);
  return records;
}

/**
 * Parse date string from AMFI format (DD-MMM-YYYY)
 */
function parseDateString(dateStr) {
  try {
    const months = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0]);
    const month = months[parts[1]];
    const year = parseInt(parts[2]);
    
    if (isNaN(day) || month === undefined || isNaN(year)) return null;
    
    return new Date(year, month, day);
  } catch (error) {
    return null;
  }
}

/**
 * Update NAV data in database
 */
async function updateNAVData(records) {
  try {
    console.log('💾 Updating NAV data in database...');
    
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    
    // Process in batches for better performance
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      const operations = batch.map(record => ({
        updateOne: {
          filter: {
            schemeCode: record.schemeCode,
            date: record.date
          },
          update: {
            $set: {
              schemeName: record.schemeName,
              category: record.category,
              nav: record.nav,
              repurchasePrice: record.repurchasePrice,
              salePrice: record.salePrice
            }
          },
          upsert: true
        }
      }));
      
      const result = await NAV.bulkWrite(operations);
      inserted += result.upsertedCount;
      updated += result.modifiedCount;
      skipped += batch.length - result.upsertedCount - result.modifiedCount;
    }
    
    console.log(`✅ NAV data updated: ${inserted} inserted, ${updated} updated, ${skipped} skipped`);
    
    return {
      success: true,
      inserted,
      updated,
      skipped,
      total: records.length
    };
  } catch (error) {
    console.error('❌ Error updating NAV data:', error.message);
    throw error;
  }
}

/**
 * Main sync function - download, parse, and update
 */
async function syncNAVData() {
  try {
    console.log('🔄 Starting NAV data sync...');
    const startTime = Date.now();
    
    // Download data
    const textData = await downloadAMFIData();
    
    // Parse data
    const records = parseAMFIData(textData);
    
    if (records.length === 0) {
      throw new Error('No records parsed from AMFI data');
    }
    
    // Update database
    const result = await updateNAVData(records);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ NAV sync completed in ${duration}s`);
    
    return {
      ...result,
      duration: parseFloat(duration)
    };
  } catch (error) {
    console.error('❌ NAV sync failed:', error.message);
    throw error;
  }
}

/**
 * Get NAV statistics
 */
async function getNAVStats() {
  try {
    const totalRecords = await NAV.countDocuments();
    const uniqueSchemes = await NAV.distinct('schemeCode');
    const categories = await NAV.distinct('category');
    
    // Get latest date
    const latestRecord = await NAV.findOne().sort({ date: -1 }).limit(1);
    const latestDate = latestRecord ? latestRecord.date : null;
    
    return {
      totalRecords,
      uniqueSchemes: uniqueSchemes.length,
      categories: categories.length,
      latestDate
    };
  } catch (error) {
    console.error('Error getting NAV stats:', error);
    throw error;
  }
}

module.exports = {
  downloadAMFIData,
  parseAMFIData,
  updateNAVData,
  syncNAVData,
  getNAVStats
};
