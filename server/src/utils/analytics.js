
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

module.exports = { computeReturns, mean, std, cagr, sharpeLike };
