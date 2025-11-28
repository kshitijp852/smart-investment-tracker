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
  generatePerformanceChartData
} = require('../services/benchmarkService');

// Generate multiple diversified bucket options with advanced scoring
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
      
      // Generate market returns for comparison (in production, use actual benchmark data)
      const marketReturns = generateMarketReturns(returns.length);
      
      // Calculate all ratios
      const fundCAGR = cagr(priceHistory) || 0;
      const fundSharpe = sharpeRatio(returns);
      const fundSortino = sortinoRatio(returns);
      const fundBeta = beta(returns, marketReturns);
      const fundTreynor = treynorRatio(returns, fundBeta);
      const fundAlpha = alpha(returns, marketReturns, fundBeta);
      const fundInfoRatio = informationRatio(returns, marketReturns);
      const fundSD = standardDeviation(returns);
      
      // Simulate expense and turnover ratios (in production, get from fund data)
      const expenseRatio = 0.005 + Math.random() * 0.02; // 0.5% to 2.5%
      const turnoverRatio = 0.2 + Math.random() * 0.8; // 20% to 100%
      
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
    
    // Define bucket allocation strategies based on risk level
    const bucketStrategies = {
      low: {
        name: 'Conservative Portfolio',
        description: 'Focus on capital preservation with steady returns',
        allocation: {
          debt: 0.40,      // 40% Debt funds
          liquid: 0.25,    // 25% Liquid funds
          balanced: 0.20,  // 20% Balanced funds
          large_cap: 0.10, // 10% Large cap
          index: 0.05      // 5% Index funds
        },
        icon: '🛡️'
      },
      medium: {
        name: 'Balanced Portfolio',
        description: 'Mix of growth and stability for moderate returns',
        allocation: {
          large_cap: 0.25,   // 25% Large cap
          flexi_cap: 0.20,   // 20% Flexi cap
          balanced: 0.20,    // 20% Balanced funds
          mid_cap: 0.15,     // 15% Mid cap
          debt: 0.10,        // 10% Debt funds
          index: 0.05,       // 5% Index funds
          elss: 0.05         // 5% ELSS (tax saving)
        },
        icon: '⚖️'
      },
      high: {
        name: 'Aggressive Portfolio',
        description: 'Maximum growth potential with higher volatility',
        allocation: {
          mid_cap: 0.25,     // 25% Mid cap
          small_cap: 0.20,   // 20% Small cap
          large_cap: 0.20,   // 20% Large cap
          flexi_cap: 0.15,   // 15% Flexi cap
          elss: 0.10,        // 10% ELSS
          balanced: 0.05,    // 5% Balanced funds
          index: 0.05        // 5% Index funds
        },
        icon: '🚀'
      }
    };
    
    const strategy = bucketStrategies[riskLevel];
    
    // Select top funds for each category based on allocation
    const bucket = [];
    let totalWeightedReturn = 0;
    let totalWeightedRisk = 0;
    
    for (const [category, percentage] of Object.entries(strategy.allocation)) {
      // Get top funds in this category based on final score
      const categoryFunds = scoredFunds
        .filter(f => f.meta?.category === category)
        .sort((a, b) => {
          // Primary sort by final score
          if (Math.abs(b.finalScore - a.finalScore) > 0.1) {
            return b.finalScore - a.finalScore;
          }
          // Tie-breaker 1: Higher Sortino
          if (Math.abs(b.metrics.sortinoRatio - a.metrics.sortinoRatio) > 0.1) {
            return b.metrics.sortinoRatio - a.metrics.sortinoRatio;
          }
          // Tie-breaker 2: Lower SD
          if (Math.abs(a.metrics.standardDeviation - b.metrics.standardDeviation) > 0.01) {
            return a.metrics.standardDeviation - b.metrics.standardDeviation;
          }
          // Tie-breaker 3: Lower expense ratio
          return a.metrics.expenseRatio - b.metrics.expenseRatio;
        })
        .slice(0, 2); // Top 2 funds per category
      
      if (categoryFunds.length > 0) {
        // Distribute percentage among selected funds
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
            // Include detailed metrics
            finalScore: fund.finalScore,
            metrics: {
              sharpeRatio: fund.metrics.sharpeRatio,
              sortinoRatio: fund.metrics.sortinoRatio,
              treynorRatio: fund.metrics.treynorRatio,
              alpha: fund.metrics.alpha,
              beta: fund.metrics.beta,
              informationRatio: fund.metrics.informationRatio,
              standardDeviation: fund.metrics.standardDeviation,
              expenseRatio: fund.metrics.expenseRatio,
              turnoverRatio: fund.metrics.turnoverRatio
            },
            scoreBreakdown: fund.scoreBreakdown
          });
          
          // Calculate weighted metrics
          totalWeightedReturn += fund.calculatedReturn * perFundPercentage;
          totalWeightedRisk += fund.metrics.standardDeviation * perFundPercentage;
        });
      }
    }
    
    // Calculate bucket summary
    const totalInvestment = bucket.reduce((sum, f) => sum + f.allocation, 0);
    const totalProjectedValue = bucket.reduce((sum, f) => sum + f.projectedValue, 0);
    const totalGain = totalProjectedValue - totalInvestment;
    const overallReturn = totalWeightedReturn;
    
    // Group by category for display
    const categorySummary = {};
    bucket.forEach(fund => {
      if (!categorySummary[fund.category]) {
        categorySummary[fund.category] = {
          totalAllocation: 0,
          totalPercentage: 0,
          funds: []
        };
      }
      categorySummary[fund.category].totalAllocation += fund.allocation;
      categorySummary[fund.category].totalPercentage += fund.percentage;
      categorySummary[fund.category].funds.push(fund);
    });
    
    // Calculate benchmark comparison
    let benchmarkComparison = null;
    let chartData = null;
    try {
      benchmarkComparison = await compareWithBenchmark(bucket, duration);
      chartData = generatePerformanceChartData(
        benchmarkComparison.basketReturn,
        benchmarkComparison.benchmarkReturn,
        duration,
        amount
      );
    } catch (err) {
      console.error('Error calculating benchmark:', err);
    }

    res.json({
      generatedAt: new Date(),
      input: { amount, duration, riskLevel },
      strategy: {
        name: strategy.name,
        description: strategy.description,
        icon: strategy.icon
      },
      summary: {
        totalInvestment: totalInvestment,
        totalProjectedValue: totalProjectedValue,
        totalGain: totalGain,
        overallReturn: overallReturn,
        annualizedReturn: overallReturn * 100,
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
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
