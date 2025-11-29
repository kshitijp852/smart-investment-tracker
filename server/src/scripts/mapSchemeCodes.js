/**
 * Script to map scheme codes to curated funds
 * This enables historical NAV-based performance calculations
 */

require('dotenv').config();
const mongoose = require('mongoose');
const FinancialData = require('../models/FinancialData');
const NAV = require('../models/NAV');

async function mapSchemeCodes() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_investment');
    console.log('✅ Connected to MongoDB\n');

    console.log('📊 Fetching curated funds...');
    const curatedFunds = await FinancialData.find({ type: 'mutual_fund' });
    console.log(`Found ${curatedFunds.length} curated funds\n`);

    let mapped = 0;
    let notFound = 0;
    let alreadyMapped = 0;

    for (const fund of curatedFunds) {
      // Skip if already has scheme code
      if (fund.meta?.schemeCode) {
        alreadyMapped++;
        console.log(`⏭️  ${fund.name} - Already mapped (${fund.meta.schemeCode})`);
        continue;
      }

      // Try to find matching NAV record by name
      const navRecord = await NAV.findOne({
        schemeName: { $regex: fund.name, $options: 'i' }
      }).sort({ date: -1 }).limit(1);

      if (navRecord) {
        // Update fund with scheme code
        await FinancialData.updateOne(
          { _id: fund._id },
          { 
            $set: { 
              'meta.schemeCode': navRecord.schemeCode,
              'meta.isin': navRecord.isin,
              'meta.schemeType': navRecord.schemeType
            } 
          }
        );
        mapped++;
        console.log(`✅ ${fund.name} → ${navRecord.schemeCode} (${navRecord.schemeName})`);
      } else {
        notFound++;
        console.log(`❌ ${fund.name} - No matching NAV record found`);
      }
    }

    console.log('\n📈 Mapping Summary:');
    console.log(`   ✅ Newly mapped: ${mapped}`);
    console.log(`   ⏭️  Already mapped: ${alreadyMapped}`);
    console.log(`   ❌ Not found: ${notFound}`);
    console.log(`   📊 Total: ${curatedFunds.length}`);
    console.log(`   🎯 Coverage: ${((mapped + alreadyMapped) / curatedFunds.length * 100).toFixed(1)}%`);

    await mongoose.connection.close();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  mapSchemeCodes();
}

module.exports = mapSchemeCodes;
