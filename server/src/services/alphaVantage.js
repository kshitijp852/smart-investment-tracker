
const axios = require('axios');
const FinancialData = require('../models/FinancialData');

const API_KEY = process.env.ALPHA_VANTAGE_KEY || '';

async function fetchMonthlySeries(symbol){
  if (!API_KEY) throw new Error('Alpha Vantage API key not provided');
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${API_KEY}`;
  const resp = await axios.get(url);
  const data = resp.data['Monthly Time Series'];
  if (!data) throw new Error('No data from Alpha Vantage');
  const series = Object.keys(data).map(dateStr => ({ date: new Date(dateStr), close: Number(data[dateStr]['4. close']) }));
  series.sort((a,b)=>a.date - b.date);
  return series;
}

// Simple fetch and cache into FinancialData
async function fetchAndCache(symbol, type='stock', name=''){
  try {
    const history = await fetchMonthlySeries(symbol);
    const doc = { type, symbol, name: name||symbol, priceHistory: history, lastUpdated: new Date() };
    await FinancialData.updateOne({ type, symbol }, doc, { upsert: true });
    return doc;
  } catch (err) {
    throw err;
  }
}

module.exports = { fetchMonthlySeries, fetchAndCache };
