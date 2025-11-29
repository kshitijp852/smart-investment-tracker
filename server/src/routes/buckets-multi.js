const express = require('express');
const router = express.Router();
const FinancialData = require('../models/FinancialData');
const { cagr, computeReturns } = require('../utils/analytics');
const {
  sharpeRatio,
  sortinoRatio,
  beta,
  treynorRatio,
  alpha,
  informationRatio,
  standardDeviation,
  calculateFundScore,
  generateMarketReturns
} = require('../utils/advancedAnalytics');
const {
  compareWithBenchmark,
  generatePerformanceChartData,
  calculateBlendedBenchmark
} = require('../services/benchmarkService');
const {
  comparePortfolioWithBenchmarkHistorical
} = require('../services/historicalReturnsService');

// Generate MULTIPLE diversified bucket options
router.post('/generate', async (req, res) => {
  try {
    const { amount = 100000, duration = 3, riskLevel = 'medium' } = req.body;
    
    // Fetch all mutual funds
    const allFunds = await FinancialData.find({ type: 'mutual_fund' }).lean();
    
    if (allFunds.length === 0) {
      return res.status(404).json({ 
        message: 'No mutual funds available. Please load sample data first.' 
      });
    }
    
    // Calculate comprehensive metrics for each fund
    const fundsWithMetrics = allFunds.map(fund => {
      const priceHistory = fund.priceHistory || [];
      const returns = computeReturns(priceHistory);
      
      if (!returns || returns.length < 2) {
        return null;
      }
      
      const marketReturns = generateMarketReturns(returns.length);
      const fundCAGR = cagr(priceHistory) || 0;
      const fundSharpe = sharpeRatio(returns);
      const fundSortino = sortinoRatio(returns);
      const fundBeta = beta(returns, marketReturns);
      const fundTreynor = treynorRatio(returns, fundBeta);
      const fundAlpha = alpha(returns, marketReturns, fundBeta);
      const fundInfoRatio = informationRatio(returns, marketReturns);
      const fundSD = standardDeviation(returns);
      const expenseRatio = 0.005 + Math.random() * 0.02;
      const turnoverRatio = 0.2 + Math.random() * 0.8;
      
      return {
        ...fund,
        calculatedReturn: fundCAGR,
        metrics: {
          sharpeRatio: fundSharpe,
          sortinoRatio: fundSortino,
          beta: fundBeta,
          treynorRatio: fundTreynor,
          alpha: fundAlpha,
          informationRatio: fundInfoRatio,
          standardDeviation: fundSD,
          expenseRatio: expenseRatio,
          turnoverRatio: turnoverRatio
        }
      };
    }).filter(f => f !== null);
    
    // Calculate scores for all funds
    const allMetrics = fundsWithMetrics.map(f => f.metrics);
    const scoredFunds = fundsWithMetrics.map(fund => {
      const scoreData = calculateFundScore(fund.metrics, allMetrics);
      return {
        ...fund,
        finalScore: scoreData.finalScore,
        scoreBreakdown: scoreData
      };
    });
    
    // Define bucket allocation strategies
    const bucketStrategies = {
      low: {
        name: 'Conservative Portfolio',
        description: 'Focus on capital preservation with steady returns',
        allocation: {
          debt: 0.40, liquid: 0.25, balanced: 0.20, large_cap: 0.10, index: 0.05
        },
        icon: '🛡️',
        tag: 'Safe & Stable'
      },
      medium: {
        name: 'Balanced Portfolio',
        description: 'Mix of growth and stability for moderate returns',
        allocation: {
          large_cap: 0.25, flexi_cap: 0.20, balanced: 0.20, mid_cap: 0.15,
          debt: 0.10, index: 0.05, elss: 0.05
        },
        icon: '⚖️',
        tag: 'Balanced Growth'
      },
      high: {
        name: 'Aggressive Portfolio',
        description: 'Maximum growth potential with higher volatility',
        allocation: {
          mid_cap: 0.25, small_cap: 0.20, large_cap: 0.20, flexi_cap: 0.15,
          elss: 0.10, balanced: 0.05, index: 0.05
        },
        icon: '🚀',
        tag: 'High Growth'
      }
    };
    
    // Function to generate a bucket for a specific strategy
    const generateBucket = (strategyKey) => {
      const strategy = bucketStrategies[strategyKey];
      const bucket = [];
      let totalWeightedReturn = 0;
      let totalWeightedRisk = 0;
      
      for (const [category, percentage] of Object.entries(strategy.allocation)) {
        const categoryFunds = scoredFunds
          .filter(f => f.meta?.category === category)
          .sort((a, b) => {
            if (Math.abs(b.finalScore - a.finalScore) > 0.1) return b.finalScore - a.finalScore;
            if (Math.abs(b.metrics.sortinoRatio - a.metrics.sortinoRatio) > 0.1) return b.metrics.sortinoRatio - a.metrics.sortinoRatio;
            if (Math.abs(a.metrics.standardDeviation - b.metrics.standardDeviation) > 0.01) return a.metrics.standardDeviation - b.metrics.standardDeviation;
            return a.metrics.expenseRatio - b.metrics.expenseRatio;
          })
          .slice(0, 2);
        
        if (categoryFunds.length > 0) {
          const perFundPercentage = percentage / categoryFunds.length;
          
          categoryFunds.forEach(fund => {
            const allocation = amount * perFundPercentage;
            const projectedValue = allocation * Math.pow(1 + fund.calculatedReturn, duration);
            
            bucket.push({
              symbol: fund.symbol,
              name: fund.name,
              category: fund.meta?.category || category,
              riskCategory: fund.meta?.riskCategory || 'medium',
              allocation: allocation,
              percentage: perFundPercentage * 100,
              expectedReturn: fund.calculatedReturn,
              projectedValue: projectedValue,
              projectedGain: projectedValue - allocation,
              finalScore: fund.finalScore,
              metrics: fund.metrics,
              scoreBreakdown: fund.scoreBreakdown,
              meta: fund.meta // Include meta for schemeCode
            });
            
            totalWeightedReturn += fund.calculatedReturn * perFundPercentage;
            totalWeightedRisk += fund.metrics.standardDeviation * perFundPercentage;
          });
        }
      }
      
      const totalInvestment = bucket.reduce((sum, f) => sum + f.allocation, 0);
      const totalProjectedValue = bucket.reduce((sum, f) => sum + f.projectedValue, 0);
      const totalGain = totalProjectedValue - totalInvestment;
      
      const categorySummary = {};
      bucket.forEach(fund => {
        if (!categorySummary[fund.category]) {
          categorySummary[fund.category] = { totalAllocation: 0, totalPercentage: 0, funds: [] };
        }
        categorySummary[fund.category].totalAllocation += fund.allocation;
        categorySummary[fund.category].totalPercentage += fund.percentage;
        categorySummary[fund.category].funds.push(fund);
      });
      
      // Calculate benchmark comparison (async, but we'll handle it)
      let benchmarkComparison = null;
      let chartData = null;
      
      return {
        strategy: {
          name: strategy.name,
          description: strategy.description,
          icon: strategy.icon,
          tag: strategy.tag,
          riskLevel: strategyKey
        },
        summary: {
          totalInvestment: totalInvestment,
          totalProjectedValue: totalProjectedValue,
          totalGain: totalGain,
          overallReturn: totalWeightedReturn,
          annualizedReturn: totalWeightedReturn * 100,
          riskScore: totalWeightedRisk * 100,
          duration: duration
        },
        bucket: bucket,
        categorySummary: categorySummary,
        diversification: {
          fundCount: bucket.length,
          categoryCount: Object.keys(categorySummary).length
        },
        benchmarkComparison: benchmarkComparison,
        chartData: chartData
      };
    };
    
    // Generate 3 bucket options
    const bucketOptions = [];
    
    // 1. Recommended (user's selected risk level)
    const recommended = generateBucket(riskLevel);
    recommended.isRecommended = true;
    recommended.label = 'Recommended';
    bucketOptions.push(recommended);
    
    // 2. Conservative Alternative (if not already low)
    if (riskLevel !== 'low') {
      const conservative = generateBucket('low');
      conservative.isRecommended = false;
      conservative.label = 'Conservative Alternative';
      bucketOptions.push(conservative);
    }
    
    // 3. Aggressive Alternative (if not already high)
    if (riskLevel !== 'high') {
      const aggressive = generateBucket('high');
      aggressive.isRecommended = false;
      aggressive.label = 'Aggressive Alternative';
      bucketOptions.push(aggressive);
    }
    
    // 4. Balanced Alternative (if user chose low or high)
    if (riskLevel !== 'medium') {
      const balanced = generateBucket('medium');
      balanced.isRecommended = false;
      balanced.label = 'Balanced Alternative';
      bucketOptions.push(balanced);
    }
    
    // Add benchmark comparison to each bucket option using historical NAV data
    for (const option of bucketOptions) {
      try {
        // Get blended benchmark data
        const benchmarkData = await calculateBlendedBenchmark(option.bucket);
        
        // Calculate historical returns using NAV data
        const historicalComparison = await comparePortfolioWithBenchmarkHistorical(
          option.bucket,
          benchmarkData
        );
        
        // Check if we have valid historical data
        const hasHistoricalData = Object.values(historicalComparison.basketReturn).some(v => v !== null);
        
        if (hasHistoricalData) {
          // Use historical data
          const chart = generatePerformanceChartData(
            historicalComparison.basketReturn,
            historicalComparison.benchmarkReturn,
            duration,
            amount
          );
          option.benchmarkComparison = historicalComparison;
          option.chartData = chart;
        } else {
          // Fallback to expected returns
          console.log('No historical data available, using expected returns');
          const comparison = await compareWithBenchmark(option.bucket, duration);
          const chart = generatePerformanceChartData(
            comparison.basketReturn,
            comparison.benchmarkReturn,
            duration,
            amount
          );
          option.benchmarkComparison = comparison;
          option.chartData = chart;
        }
      } catch (err) {
        console.error('Error calculating benchmark for option:', err);
        // Fallback to expected returns if error occurs
        try {
          const comparison = await compareWithBenchmark(option.bucket, duration);
          const chart = generatePerformanceChartData(
            comparison.basketReturn,
            comparison.benchmarkReturn,
            duration,
            amount
          );
          option.benchmarkComparison = comparison;
          option.chartData = chart;
        } catch (fallbackErr) {
          console.error('Fallback benchmark calculation also failed:', fallbackErr);
        }
      }
    }
    
    res.json({
      generatedAt: new Date(),
      input: { amount, duration, riskLevel },
      bucketOptions: bucketOptions,
      totalOptions: bucketOptions.length
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
