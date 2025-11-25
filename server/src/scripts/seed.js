
const fs = require('fs');
const csv = require('csv-parse/lib/sync');
const mongoose = require('mongoose');
require('dotenv').config();
const FinancialData = require('../models/FinancialData');
const connect = require('../config/db');

(async ()=>{
  await connect();
  const text = fs.readFileSync(__dirname + '/../../data/sample_prices.csv', 'utf8');
  const records = csv(text, { columns: true });
  const history = records.map(r=>({ date: new Date(r.date), close: Number(r.close) }));
  await FinancialData.updateOne({ type: 'stock', symbol: 'SAMPLE_STOCK' }, {
    type: 'stock',
    symbol: 'SAMPLE_STOCK',
    name: 'Sample Stock for Demo',
    priceHistory: history
  }, { upsert: true });
  console.log('Seeded SAMPLE_STOCK');
  process.exit(0);
})();
