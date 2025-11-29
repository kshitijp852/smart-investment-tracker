# Portfolio Recommendation Algorithm - Complete Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Input Parameters](#input-parameters)
3. [Fund Selection Process](#fund-selection-process)
4. [Scoring System](#scoring-system)
5. [Portfolio Construction](#portfolio-construction)
6. [Strategy Generation](#strategy-generation)
7. [Mathematical Formulas](#mathematical-formulas)
8. [Example Walkthrough](#example-walkthrough)

---

## 1. Overview

The recommendation engine uses a **multi-factor quantitative model** to evaluate and select mutual funds, then constructs diversified portfolios based on user risk preferences.

### Key Principles
- **Risk-Adjusted Returns**: Focus on returns per unit of risk, not just absolute returns
- **Diversification**: Spread across categories, fund houses, and strategies
- **Professional Metrics**: Use industry-standard financial ratios
- **Transparency**: Every decision is explainable and auditable

---

## 2. Input Parameters

### User Inputs
```javascript
{
  amount: 100000,        // Investment amount (₹)
  duration: 3,           // Investment horizon (years)
  riskLevel: 'medium'    // Risk appetite: 'low', 'medium', 'high'
}
```

### Risk Level Mapping
| Risk Level | Investor Profile | Expected Return | Volatility |
|------------|------------------|-----------------|------------|
| Low | Conservative | 8-10% p.a. | Low |
| Medium | Balanced | 10-12% p.a. | Moderate |
| High | Aggressive | 12-15% p.a. | High |

---

## 3. Fund Selection Process

### Step 1: Data Retrieval
```javascript
// Fetch all mutual funds from database
const allFunds = await FinancialData.find({ type: 'mutual_fund' });
// Result: 57 curated funds across categories
```

### Step 2: Calculate Returns
For each fund, compute monthly returns from price history:
```javascript
returns = [(P1-P0)/P0, (P2-P1)/P1, ..., (Pn-Pn-1)/Pn-1]
```

**Requirements:**
- Minimum 2 data points
- Valid price history
- No missing/corrupt data

### Step 3: Calculate 10 Financial Metrics

#### A. Risk-Adjusted Return Metrics (45% weight)

**1. Sharpe Ratio** (20% of total score)
```
Sharpe = (Annual Return - Risk Free Rate) / Annual Volatility
```
- **Purpose**: Measures return per unit of total risk
- **Interpretation**: Higher is better (>1 is good, >2 is excellent)
- **Risk Free Rate**: 6% (Indian G-Sec rate)

**2. Sortino Ratio** (15% of total score)
```
Sortino = (Annual Return - Risk Free Rate) / Downside Deviation
```
- **Purpose**: Like Sharpe, but only penalizes downside volatility
- **Interpretation**: Higher is better (focuses on harmful volatility)
- **Calculation**: Only considers negative returns for deviation

**3. Treynor Ratio** (10% of total score)
```
Treynor = (Annual Return - Risk Free Rate) / Beta
```
- **Purpose**: Return per unit of systematic risk
- **Interpretation**: Higher is better
- **Use Case**: Compares funds with different market exposures

#### B. Stability & Volatility Metrics (25% weight)

**4. Standard Deviation** (15% of total score)
```
SD = √(Σ(Return - Mean)² / N) × √12
```
- **Purpose**: Measures total volatility
- **Interpretation**: Lower is better (more stable)
- **Annualized**: Monthly SD × √12

**5. Beta** (10% of total score)
```
Beta = Covariance(Fund, Market) / Variance(Market)
```
- **Purpose**: Measures market sensitivity
- **Interpretation**: 
  - β = 1: Moves with market
  - β > 1: More volatile than market
  - β < 1: Less volatile than market
- **Ideal**: Close to 1 (stable, predictable)

#### C. Manager Skill Metrics (20% weight)

**6. Alpha (Jensen's Alpha)** (12% of total score)
```
Alpha = Actual Return - [Risk Free Rate + Beta × (Market Return - Risk Free Rate)]
```
- **Purpose**: Excess return beyond what's expected from market exposure
- **Interpretation**: Positive alpha = manager adds value
- **Calculation**: Based on CAPM model

**7. Information Ratio** (8% of total score)
```
Information Ratio = (Fund Return - Benchmark Return) / Tracking Error
```
- **Purpose**: Consistency of outperformance
- **Interpretation**: Higher is better (consistent alpha generation)
- **Tracking Error**: Standard deviation of excess returns

#### D. Cost Efficiency Metrics (10% weight)

**8. Expense Ratio** (6% of total score)
```
Expense Ratio = Annual Fund Expenses / Average AUM
```
- **Purpose**: Cost of fund management
- **Interpretation**: Lower is better (0.5-2% typical)
- **Impact**: Directly reduces returns

**9. Turnover Ratio** (4% of total score)
```
Turnover Ratio = (Buys + Sells) / 2 / Average Portfolio Value
```
- **Purpose**: Trading frequency
- **Interpretation**: Lower is better (less transaction costs)
- **Range**: 20-200% typical

**10. CAGR (Compound Annual Growth Rate)**
```
CAGR = (Ending Value / Beginning Value)^(1/Years) - 1
```
- **Purpose**: Annualized return
- **Use**: Portfolio projections
- **Calculation**: From price history or NAV data

---

## 4. Scoring System

### Normalization Process
Each metric is normalized to 0-1 scale:
```javascript
normalized = (value - min) / (max - min)
```

**For "lower is better" metrics** (SD, expense, turnover):
```javascript
normalized = 1 - (value - min) / (max - min)
```

### Score Calculation
```javascript
// A) Risk-Adjusted Performance (45%)
riskAdjustedScore = (sharpe × 0.20) + (sortino × 0.15) + (treynor × 0.10)

// B) Stability (25%)
stabilityScore = (sd × 0.15) + (beta × 0.10)

// C) Manager Skill (20%)
managerSkillScore = (alpha × 0.12) + (infoRatio × 0.08)

// D) Cost Efficiency (10%)
costEfficiencyScore = (expense × 0.06) + (turnover × 0.04)

// Final Score (0-100)
finalScore = (riskAdjustedScore × 0.45) + (stabilityScore × 0.25) + 
             (managerSkillScore × 0.20) + (costEfficiencyScore × 0.10)
```

### Score Interpretation
| Score Range | Quality | Action |
|-------------|---------|--------|
| 80-100 | Excellent | Top picks |
| 60-80 | Good | Consider |
| 40-60 | Average | Maybe |
| 0-40 | Poor | Avoid |

---

## 5. Portfolio Construction

### Strategy Definitions

#### Conservative Strategy (Low Risk)
```javascript
allocation = {
  debt: 40%,        // Government bonds, corporate bonds
  liquid: 25%,      // Money market instruments
  balanced: 20%,    // Hybrid funds
  large_cap: 10%,   // Blue-chip stocks
  index: 5%         // Index funds
}
```
- **Target Return**: 8-10% p.a.
- **Volatility**: Low
- **Suitable For**: Risk-averse investors, short-term goals

#### Balanced Strategy (Medium Risk)
```javascript
allocation = {
  large_cap: 25%,   // Established companies
  flexi_cap: 20%,   // Flexible allocation
  balanced: 20%,    // Hybrid funds
  mid_cap: 15%,     // Growth companies
  debt: 10%,        // Stability
  index: 5%,        // Market exposure
  elss: 5%          // Tax saving
}
```
- **Target Return**: 10-12% p.a.
- **Volatility**: Moderate
- **Suitable For**: Most investors, medium-term goals

#### Aggressive Strategy (High Risk)
```javascript
allocation = {
  mid_cap: 25%,     // High growth potential
  small_cap: 20%,   // Maximum growth
  large_cap: 20%,   // Some stability
  flexi_cap: 15%,   // Flexibility
  elss: 10%,        // Tax benefits
  balanced: 5%,     // Minor stability
  index: 5%         // Market benchmark
}
```
- **Target Return**: 12-15% p.a.
- **Volatility**: High
- **Suitable For**: Risk-tolerant investors, long-term goals

### Fund Selection Within Categories

**Step 1: Filter by Category**
```javascript
categoryFunds = allFunds.filter(f => f.category === targetCategory)
```

**Step 2: Sort by Score**
```javascript
sortedFunds = categoryFunds.sort((a, b) => {
  // Primary: Final score
  if (Math.abs(b.finalScore - a.finalScore) > 0.1) 
    return b.finalScore - a.finalScore;
  
  // Secondary: Sortino ratio (downside risk)
  if (Math.abs(b.sortino - a.sortino) > 0.1) 
    return b.sortino - a.sortino;
  
  // Tertiary: Standard deviation (lower is better)
  if (Math.abs(a.sd - b.sd) > 0.01) 
    return a.sd - b.sd;
  
  // Quaternary: Expense ratio (lower is better)
  return a.expense - b.expense;
})
```

**Step 3: Select Top Funds**
```javascript
selectedFunds = sortedFunds.slice(0, 2)  // Top 2 per category
```

**Step 4: Allocate Amount**
```javascript
perFundAllocation = (totalAmount × categoryPercentage) / fundsInCategory
```

### Diversification Rules
1. **Minimum 6 funds** per portfolio
2. **Maximum 12 funds** per portfolio
3. **At least 3 categories** represented
4. **No single fund > 25%** of portfolio
5. **Multiple fund houses** (avoid concentration)

---

## 6. Strategy Generation

### Process Flow
```
User Input (Amount, Duration, Risk)
         ↓
Fetch All Funds (57 curated)
         ↓
Calculate Metrics (10 per fund)
         ↓
Calculate Scores (0-100)
         ↓
Rank Funds by Score
         ↓
Generate 3 Strategies
  ├─ Conservative
  ├─ Balanced
  └─ Aggressive
         ↓
For Each Strategy:
  ├─ Select funds by category
  ├─ Allocate amounts
  ├─ Calculate projections
  └─ Compare with benchmark
         ↓
Return 3 Portfolio Options
```

### Projection Calculation
```javascript
// For each fund
projectedValue = allocation × (1 + CAGR)^years
projectedGain = projectedValue - allocation

// For portfolio
totalProjectedValue = Σ(projectedValue)
totalGain = totalProjectedValue - totalInvestment
annualizedReturn = (totalProjectedValue / totalInvestment)^(1/years) - 1
```

---

## 7. Mathematical Formulas

### Complete Formula Reference

**1. Monthly Return**
```
R_t = (P_t - P_{t-1}) / P_{t-1}
```

**2. Mean Return**
```
μ = (1/n) × Σ R_i
```

**3. Variance**
```
σ² = (1/n) × Σ(R_i - μ)²
```

**4. Standard Deviation**
```
σ = √σ²
```

**5. Annualized Return**
```
R_annual = (1 + R_monthly)^12 - 1
```

**6. Annualized Volatility**
```
σ_annual = σ_monthly × √12
```

**7. Covariance**
```
Cov(X,Y) = (1/n) × Σ[(X_i - μ_X)(Y_i - μ_Y)]
```

**8. Correlation**
```
ρ = Cov(X,Y) / (σ_X × σ_Y)
```

**9. CAPM Expected Return**
```
E(R) = R_f + β × (R_m - R_f)
```

**10. Future Value**
```
FV = PV × (1 + r)^t
```

---

## 8. Example Walkthrough

### Scenario
```javascript
Input: {
  amount: ₹1,00,000
  duration: 3 years
  riskLevel: 'medium'
}
```

### Step-by-Step Execution

**Step 1: Fetch Funds**
- Retrieved: 57 mutual funds
- Valid data: 50 funds (7 excluded due to insufficient history)

**Step 2: Calculate Metrics**

Example for "HDFC Balanced Advantage Fund":
```javascript
priceHistory = [100, 102, 105, 103, 108, ...] // 36 months
returns = [0.02, 0.029, -0.019, 0.049, ...]

metrics = {
  sharpeRatio: 2.20,
  sortinoRatio: 3.55,
  treynorRatio: -0.24,
  alpha: 0.24,
  beta: -0.78,
  informationRatio: 1.12,
  standardDeviation: 0.087,
  expenseRatio: 0.016,
  turnoverRatio: 0.43
}
```

**Step 3: Normalize & Score**
```javascript
normalized = {
  sharpe: 0.35,    // 35th percentile
  sortino: 0.001,  // Very low (good)
  treynor: 0.40,
  alpha: 0.006,
  infoRatio: 0.28,
  sd: 0.995,       // Low volatility (good)
  beta: 0.93,      // Close to 1 (good)
  expense: 0.47,   // Moderate
  turnover: 0.73   // Moderate
}

scores = {
  riskAdjusted: 0.110 (11.0/45)
  stability: 0.242 (24.2/25)
  managerSkill: 0.023 (2.3/20)
  costEfficiency: 0.058 (5.8/10)
}

finalScore = 12.04 / 100 = 12.04%
```

**Step 4: Rank All Funds**
```
1. ICICI Bluechip Fund - 12.04
2. Aditya Frontline Fund - 11.39
3. HDFC Flexi Cap - 11.12
...
50. Low Scorer - 3.45
```

**Step 5: Generate Balanced Portfolio**
```javascript
strategy = {
  large_cap: 25% → Select top 2 → ICICI Bluechip (12.5%), Aditya Frontline (12.5%)
  flexi_cap: 20% → Select top 2 → HDFC Flexi (10%), Parag Parikh (10%)
  balanced: 20% → Select top 2 → HDFC Balanced (10%), Kotak Balanced (10%)
  mid_cap: 15% → Select top 2 → Axis Midcap (7.5%), DSP Midcap (7.5%)
  debt: 10% → Select top 2 → HDFC Corporate (5%), ICICI Corporate (5%)
  index: 5% → Select top 1 → Nippon Nifty 50 (5%)
  elss: 5% → Select top 1 → Axis Long Term (5%)
}
```

**Step 6: Calculate Projections**
```javascript
fund1 = {
  allocation: ₹12,500
  CAGR: 24.7%
  projectedValue: ₹12,500 × (1.247)^3 = ₹24,258
  gain: ₹11,758
}

// ... for all 10 funds

portfolio = {
  totalInvestment: ₹1,00,000
  totalProjectedValue: ₹1,56,962
  totalGain: ₹56,962
  annualizedReturn: 15.6%
}
```

**Step 7: Benchmark Comparison**
```javascript
benchmarkComparison = {
  basketReturn: {
    1Y: 17.57%,
    3Y: 17.57%,
    5Y: 17.57%
  },
  benchmarkReturn: {
    1Y: 17.25%,  // Blended index
    3Y: 14.55%,
    5Y: 13.25%
  },
  difference: {
    1Y: +0.32%,
    3Y: +3.02%,
    5Y: +4.32%
  },
  beatsBenchmark: {
    1Y: true,
    3Y: true,
    5Y: true
  }
}
```

---

## 9. Key Insights

### Why This Approach Works

**1. Multi-Factor Analysis**
- No single metric dominates
- Balanced evaluation across risk, return, cost, skill
- Reduces bias and overfitting

**2. Risk-Adjusted Focus**
- Prioritizes Sharpe/Sortino over raw returns
- Penalizes excessive volatility
- Rewards consistent performance

**3. Professional Standards**
- Uses industry-standard metrics
- Follows modern portfolio theory
- Aligns with institutional practices

**4. Diversification**
- Spreads across categories
- Multiple fund houses
- Reduces concentration risk

**5. Transparency**
- Every score is explainable
- Users see detailed metrics
- Audit trail for decisions

### Limitations & Disclaimers

**1. Historical Data**
- Past performance ≠ future results
- Market conditions change
- Fund managers change

**2. Simplified Model**
- Real institutional models are more complex
- Missing factors: macroeconomic, sentiment, etc.
- Assumes efficient markets

**3. Data Quality**
- Depends on accurate price history
- Limited to curated funds (57)
- NAV mapping incomplete (63%)

**4. Static Allocation**
- Doesn't rebalance automatically
- No dynamic asset allocation
- Fixed strategy percentages

---

## 10. Future Enhancements

### Planned Improvements

**1. Machine Learning**
- Train models on historical data
- Predict future performance
- Adaptive weighting

**2. Real-Time Data**
- Live NAV updates
- Intraday tracking
- Market sentiment analysis

**3. Advanced Metrics**
- Maximum drawdown
- Calmar ratio
- Omega ratio
- Value at Risk (VaR)

**4. Dynamic Rebalancing**
- Quarterly review
- Drift correction
- Tax-loss harvesting

**5. Personalization**
- Learn from user behavior
- Adapt to preferences
- Custom risk profiles

---

## Conclusion

The recommendation engine combines **quantitative rigor** with **practical wisdom** to generate diversified, risk-adjusted portfolios. By evaluating funds across 10 professional metrics and constructing portfolios based on proven allocation strategies, it provides institutional-quality recommendations accessible to retail investors.

**Key Takeaway**: The algorithm doesn't just pick "best" funds—it builds **balanced portfolios** optimized for your specific risk profile and investment horizon.

---

**Document Version**: 1.0  
**Last Updated**: November 29, 2025  
**Status**: Production  
