# Advanced Fund Scoring System - Professional Grade

## 🎯 Overview

Your app now uses a **professional-grade scoring system** that evaluates mutual funds using 9 key financial ratios, just like Groww, Kuvera, and other top investment platforms.

## 📊 Scoring Model (0-100 Scale)

### Final Score Composition

```
Final Score = (Risk-Adjusted × 45%) + (Stability × 25%) + 
              (Manager Skill × 20%) + (Cost Efficiency × 10%)
```

## 🔢 The 9 Key Ratios

### A) Risk-Adjusted Performance (45% Weight)

#### 1. **Sharpe Ratio** (20% weight)
**What it measures**: Return per unit of total risk

**Formula**: `(Return - Risk-Free Rate) / Standard Deviation`

**Interpretation**:
- > 2.0: Excellent
- 1.0 - 2.0: Good
- 0.5 - 1.0: Acceptable
- < 0.5: Poor

**Example**: Sharpe of 2.21 means fund generates 2.21% excess return for every 1% of risk taken

#### 2. **Sortino Ratio** (15% weight)
**What it measures**: Return per unit of downside risk (only bad volatility)

**Formula**: `(Return - Risk-Free Rate) / Downside Deviation`

**Why better than Sharpe**: Ignores upside volatility, focuses only on losses

**Interpretation**:
- > 2.0: Excellent downside protection
- 1.0 - 2.0: Good
- < 1.0: Weak downside protection

**Example**: Sortino of 3.11 means excellent protection against losses

#### 3. **Treynor Ratio** (10% weight)
**What it measures**: Return per unit of systematic (market) risk

**Formula**: `(Return - Risk-Free Rate) / Beta`

**Interpretation**:
- Higher is better
- Negative means fund moves opposite to market

**Example**: Treynor of 0.26 means fund generates 0.26% return per unit of market risk

### B) Stability & Volatility (25% Weight)

#### 4. **Standard Deviation** (15% weight)
**What it measures**: Total volatility of returns

**Formula**: `√(Σ(Return - Mean)² / N)` (annualized)

**Interpretation**:
- < 10%: Very stable
- 10-15%: Moderate volatility
- 15-20%: High volatility
- > 20%: Very high volatility

**Note**: Lower is better (inverted in scoring)

**Example**: SD of 9.25% means returns typically vary by ±9.25% from average

#### 5. **Beta** (10% weight)
**What it measures**: Sensitivity to market movements

**Formula**: `Covariance(Fund, Market) / Variance(Market)`

**Interpretation**:
- Beta = 1.0: Moves with market
- Beta > 1.0: More volatile than market
- Beta < 1.0: Less volatile than market
- Beta < 0: Moves opposite to market

**Note**: Closer to 1.0 is better (inverted in scoring)

**Example**: Beta of 0.41 means fund is 59% less volatile than market

### C) Manager Skill & Consistency (20% Weight)

#### 6. **Alpha (Jensen's Alpha)** (12% weight)
**What it measures**: Excess return over expected return (manager's skill)

**Formula**: `Actual Return - [Risk-Free + Beta × (Market Return - Risk-Free)]`

**Interpretation**:
- Positive: Manager adds value
- Zero: Manager matches expectations
- Negative: Manager destroys value

**Example**: Alpha of 21.69% means manager generated 21.69% more than expected

#### 7. **Information Ratio** (8% weight)
**What it measures**: Consistency of outperformance vs benchmark

**Formula**: `(Fund Return - Benchmark Return) / Tracking Error`

**Interpretation**:
- > 0.5: Excellent consistency
- 0.0 - 0.5: Good
- < 0.0: Underperforming benchmark

**Example**: Info Ratio of 1.35 means very consistent outperformance

### D) Cost Efficiency (10% Weight)

#### 8. **Expense Ratio** (6% weight)
**What it measures**: Annual fund management fees

**Typical Range**: 0.5% - 2.5%

**Interpretation**:
- < 1.0%: Low cost
- 1.0% - 1.5%: Moderate
- > 1.5%: High cost

**Note**: Lower is better (inverted in scoring)

**Example**: Expense of 0.90% means you pay ₹900 annually per ₹1 lakh invested

#### 9. **Portfolio Turnover Ratio** (4% weight)
**What it measures**: How frequently fund manager changes holdings

**Typical Range**: 20% - 100%

**Interpretation**:
- < 30%: Buy and hold strategy
- 30% - 70%: Moderate trading
- > 70%: Active trading (higher costs)

**Note**: Lower is better (inverted in scoring)

**Example**: Turnover of 53% means manager replaces half the portfolio annually

## 🧮 Scoring Algorithm

### Step 1: Normalization
Convert all ratios to 0-1 scale:

```javascript
normalized = (value - min) / (max - min)
```

For "lower is better" metrics (SD, Beta, Expense, Turnover):
```javascript
normalized = 1 - normalized
```

### Step 2: Weighted Scoring

```javascript
// A) Risk-Adjusted (45%)
riskAdjusted = (sharpe × 0.20) + (sortino × 0.15) + (treynor × 0.10)

// B) Stability (25%)
stability = (sd_inverted × 0.15) + (beta_inverted × 0.10)

// C) Manager Skill (20%)
managerSkill = (alpha × 0.12) + (infoRatio × 0.08)

// D) Cost Efficiency (10%)
costEfficiency = (expense_inverted × 0.06) + (turnover_inverted × 0.04)
```

### Step 3: Final Score

```javascript
finalScore = (riskAdjusted × 0.45) + (stability × 0.25) + 
             (managerSkill × 0.20) + (costEfficiency × 0.10)

// Scale to 0-100
finalScore = finalScore × 100
```

## 🏆 Tie-Breaking Rules

When two funds have similar scores:

1. **Primary**: Higher Sortino Ratio (better downside protection)
2. **Secondary**: Lower Standard Deviation (more stable)
3. **Tertiary**: Lower Expense Ratio (more cost-efficient)

## 📈 Real Example from Your System

### Mirae Asset Large Cap Fund

**Raw Metrics:**
- Sharpe Ratio: 2.21 (Excellent)
- Sortino Ratio: 3.11 (Excellent)
- Treynor Ratio: -0.84 (Negative beta effect)
- Alpha: 21.69% (Outstanding)
- Beta: -0.24 (Inverse market correlation)
- Information Ratio: 1.35 (Very consistent)
- Standard Deviation: 9.25% (Low volatility)
- Expense Ratio: 0.90% (Low cost)
- Turnover: 52.88% (Moderate)

**Score Breakdown:**
- Risk-Adjusted Score: 32.30/45 (71.8%)
- Stability Score: 9.32/25 (37.3%)
- Manager Skill Score: 18.07/20 (90.4%)
- Cost Efficiency Score: 7.71/10 (77.1%)

**Final Score: 21.25/100**

*Note: Scores are relative to other funds in the dataset*

## 🎯 How Funds Are Selected

### 1. Calculate All Metrics
For each fund, compute all 9 ratios from historical price data

### 2. Score All Funds
Apply the scoring algorithm to get 0-100 score for each fund

### 3. Category-Based Selection
Within each category (Large Cap, Mid Cap, etc.):
- Sort by final score (descending)
- Apply tie-breaking rules
- Select top 2 funds

### 4. Portfolio Allocation
Distribute investment based on risk strategy:
- **Low Risk**: 50% Debt, 20% Liquid, 20% Balanced, 10% Large Cap
- **Medium Risk**: 30% Large Cap, 25% Flexi, 25% Balanced, 15% Debt, 5% Index
- **High Risk**: 30% Mid Cap, 30% Large Cap, 25% Flexi, 10% Balanced, 5% Index

## 📊 Score Interpretation

### Final Score Ranges

| Score | Rating | Interpretation |
|-------|--------|----------------|
| 80-100 | ⭐⭐⭐⭐⭐ | Exceptional - Top tier fund |
| 60-79 | ⭐⭐⭐⭐ | Excellent - Strong performer |
| 40-59 | ⭐⭐⭐ | Good - Solid choice |
| 20-39 | ⭐⭐ | Average - Consider alternatives |
| 0-19 | ⭐ | Below Average - Avoid |

### Component Scores

**Risk-Adjusted (out of 45):**
- 35-45: Exceptional risk-adjusted returns
- 25-34: Good risk-adjusted returns
- 15-24: Average risk-adjusted returns
- < 15: Poor risk-adjusted returns

**Stability (out of 25):**
- 20-25: Very stable
- 15-19: Stable
- 10-14: Moderate volatility
- < 10: High volatility

**Manager Skill (out of 20):**
- 16-20: Exceptional manager
- 12-15: Good manager
- 8-11: Average manager
- < 8: Weak manager

**Cost Efficiency (out of 10):**
- 8-10: Very cost-efficient
- 6-7: Cost-efficient
- 4-5: Average costs
- < 4: High costs

## 🔍 What Makes This Professional

### 1. **Multi-Factor Analysis**
Not just returns - considers risk, consistency, costs, and manager skill

### 2. **Relative Scoring**
Funds are compared against each other, not absolute thresholds

### 3. **Weighted Importance**
Risk-adjusted returns matter most (45%), followed by stability (25%)

### 4. **Downside Protection**
Sortino Ratio ensures focus on avoiding losses, not just maximizing gains

### 5. **Manager Evaluation**
Alpha and Information Ratio measure if manager adds value consistently

### 6. **Cost Awareness**
Expense and turnover ratios ensure cost-efficiency

### 7. **Tie-Breaking Logic**
Clear rules for when funds have similar scores

## 💡 How to Use This Information

### For Investors

**Look for funds with:**
- ✅ High Sharpe & Sortino (> 1.5)
- ✅ Positive Alpha (manager adds value)
- ✅ Low Standard Deviation (< 15%)
- ✅ Beta close to 1.0 (market-like behavior)
- ✅ High Information Ratio (> 0.5)
- ✅ Low Expense Ratio (< 1.5%)

**Avoid funds with:**
- ❌ Negative Alpha (manager destroys value)
- ❌ Low Sharpe/Sortino (< 0.5)
- ❌ Very high Beta (> 1.5)
- ❌ High Standard Deviation (> 20%)
- ❌ High Expense Ratio (> 2%)

### In the App

1. **View Bucket**: See automatically selected top-scoring funds
2. **Expand Details**: Click "View Detailed Metrics" on any fund
3. **Check Score**: See final score and breakdown
4. **Compare Ratios**: Review all 9 ratios
5. **Understand Allocation**: See why fund was selected

## 🚀 Production Enhancements

For real-world deployment:

### 1. **Use Real Benchmark Data**
Replace simulated market returns with actual Nifty 50 data

### 2. **Get Actual Expense Ratios**
Fetch from fund fact sheets or APIs

### 3. **Historical Performance**
Use 3-5 years of actual price data

### 4. **Regular Updates**
Recalculate scores monthly or quarterly

### 5. **Category Benchmarks**
Compare Large Cap funds to Nifty 50, Mid Cap to Nifty Midcap 150, etc.

### 6. **Risk-Free Rate**
Use current 10-year G-Sec yield instead of fixed 6%

## 📚 References

This scoring system is based on:
- Modern Portfolio Theory (Markowitz)
- Capital Asset Pricing Model (CAPM)
- Sharpe, Sortino, and Treynor ratios
- Jensen's Alpha
- Industry best practices from Morningstar, Value Research, Groww

## 🎓 Key Takeaways

1. **Holistic Evaluation**: 9 ratios cover all aspects of fund performance
2. **Risk-Adjusted Focus**: Returns mean nothing without considering risk
3. **Manager Matters**: Alpha and Info Ratio show if manager adds value
4. **Costs Count**: Even 1% expense difference compounds significantly
5. **Consistency Wins**: Sortino and Info Ratio reward consistent performance
6. **Relative Ranking**: Funds compete against each other, not fixed standards

---

**Your app now evaluates funds like a professional financial advisor!** 🎯

Access detailed metrics for each fund in your bucket at: http://localhost:3000
