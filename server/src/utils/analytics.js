
// Simple analytics helpers: compute returns, volatility, CAGR, Sharpe-like metric
function computeReturns(history){
  // history: [{date, close}] chronological
  if (!history || history.length<2) return null;
  const returns = [];
  for (let i=1;i<history.length;i++){
    const r = (history[i].close - history[i-1].close)/history[i-1].close;
    returns.push(r);
  }
  return returns;
}

function mean(arr){
  if (!arr || arr.length===0) return 0;
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}

function std(arr){
  if (!arr || arr.length<2) return 0;
  const m = mean(arr);
  const v = arr.reduce((s,x)=>s + (x-m)*(x-m),0)/(arr.length-1);
  return Math.sqrt(v);
}

function cagr(history){
  if (!history || history.length<2) return 0;
  const start = history[0].close;
  const end = history[history.length-1].close;
  const years = (new Date(history[history.length-1].date).getTime() - new Date(history[0].date).getTime())/(1000*60*60*24*365);
  if (years<=0) return 0;
  return Math.pow(end/start, 1/years)-1;
}

// Sharpe-like: (mean monthly return *12 - rf) / (std monthly * sqrt(12))
function sharpeLike(history, riskFree=0.03){
  const r = computeReturns(history);
  if (!r) return 0;
  const m = mean(r);
  const s = std(r);
  if (s===0) return 0;
  const annualReturn = Math.pow(1+m,12)-1;
  const annualStd = s*Math.sqrt(12);
  return (annualReturn - riskFree)/annualStd;
}

/**
 * Apply category-based bounds to expected returns
 * Prevents unrealistic projections by capping historical CAGR
 * @param {number} cagr - Historical CAGR from price data
 * @param {string} category - Fund category (liquid, debt, large_cap, etc.)
 * @returns {number} - Bounded expected return
 */
function applyExpectedReturnBounds(cagr, category) {
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Load expected returns config
    const configPath = path.join(__dirname, '../config/expected-returns.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Normalize category (handle undefined, convert to lowercase)
    const normalizedCategory = (category || 'default').toLowerCase();
    
    // Get bounds for category, fallback to default
    const bounds = config[normalizedCategory] || config['default'];
    
    // Clamp CAGR within bounds
    const boundedReturn = Math.max(bounds.min, Math.min(bounds.max, cagr));
    
    return boundedReturn;
  } catch (error) {
    console.error('Error loading expected returns config:', error);
    // Fallback: clamp to conservative 5-12% range
    return Math.max(0.05, Math.min(0.12, cagr));
  }
}

module.exports = { computeReturns, mean, std, cagr, sharpeLike, applyExpectedReturnBounds };
