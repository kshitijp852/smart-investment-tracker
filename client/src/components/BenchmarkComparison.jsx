import React from 'react';

export default function BenchmarkComparison({ benchmarkData, chartData, formatCurrency }) {
  if (!benchmarkData || !benchmarkData.benchmarkComparison) {
    return null;
  }

  const { benchmarkComparison, chartData: chart } = benchmarkData;
  const { basketReturn, benchmarkReturn, difference, beatsBenchmark, benchmarkComponents } = benchmarkComparison;

  // Determine overall performance
  const periods = ['1Y', '3Y', '5Y'];
  const availablePeriods = periods.filter(p => basketReturn[p] !== undefined);
  const outperformedCount = availablePeriods.filter(p => beatsBenchmark[p]).length;
  const overallOutperformed = outperformedCount > availablePeriods.length / 2;

  return (
    <div className="benchmark-section">
      {/* Performance Summary Card */}
      <div className={`benchmark-summary-card ${overallOutperformed ? 'outperformed' : 'underperformed'}`}>
        <div className="benchmark-icon">
          {overallOutperformed ? '🎯' : '📊'}
        </div>
        <div className="benchmark-summary-content">
          <h3 className="benchmark-summary-title">
            {overallOutperformed ? 'Outperforming Benchmark' : 'Tracking Benchmark'}
          </h3>
          <p className="benchmark-summary-text">
            Your basket has {overallOutperformed ? 'beaten' : 'tracked'} the blended benchmark in{' '}
            {outperformedCount} out of {availablePeriods.length} time periods
          </p>
        </div>
      </div>

      {/* Benchmark Composition */}
      <div className="benchmark-composition">
        <h4 className="benchmark-subtitle">
          📈 Benchmark Composition
          <span className="benchmark-tooltip-icon" title="Your portfolio is compared against a weighted blend of category-specific indices">ⓘ</span>
        </h4>
        <div className="benchmark-components">
          {benchmarkComponents.map((comp, idx) => (
            <div key={idx} className="benchmark-component">
              <div className="component-header">
                <span className="component-category">{comp.category.replace('_', ' ')}</span>
                <span className="component-weight">{comp.weight.toFixed(1)}%</span>
              </div>
              <div className="component-index">{comp.benchmarkIndex}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Comparison Table */}
      <div className="benchmark-comparison-table">
        <h4 className="benchmark-subtitle">📊 Performance Comparison</h4>
        <div className="comparison-table">
          <div className="table-header">
            <div className="table-cell">Period</div>
            <div className="table-cell">Your Basket</div>
            <div className="table-cell">Benchmark</div>
            <div className="table-cell">Difference</div>
          </div>
          {availablePeriods.map(period => (
            <div key={period} className="table-row">
              <div className="table-cell period-cell">{period}</div>
              <div className="table-cell value-cell">
                {(basketReturn[period] * 100).toFixed(2)}%
              </div>
              <div className="table-cell value-cell">
                {(benchmarkReturn[period] * 100).toFixed(2)}%
              </div>
              <div className={`table-cell diff-cell ${beatsBenchmark[period] ? 'positive' : 'negative'}`}>
                {beatsBenchmark[period] ? '+' : ''}{(difference[period] * 100).toFixed(2)}%
                {beatsBenchmark[period] ? ' ✓' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Chart */}
      {chart && chart.length > 0 && (
        <div className="benchmark-chart">
          <h4 className="benchmark-subtitle">📈 Growth Comparison</h4>
          <div className="chart-container">
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color basket"></span>
                <span className="legend-label">Your Basket</span>
              </div>
              <div className="legend-item">
                <span className="legend-color benchmark"></span>
                <span className="legend-label">Blended Benchmark</span>
              </div>
            </div>
            
            <div className="chart-bars">
              {chart.map((data, idx) => {
                const maxValue = Math.max(data.basketValue, data.benchmarkValue);
                const basketHeight = (data.basketValue / maxValue) * 100;
                const benchmarkHeight = (data.benchmarkValue / maxValue) * 100;
                
                return (
                  <div key={idx} className="chart-bar-group">
                    <div className="chart-bars-container">
                      <div 
                        className="chart-bar basket-bar" 
                        style={{ height: `${basketHeight}%` }}
                        title={`Your Basket: ${formatCurrency(data.basketValue)}`}
                      >
                        <span className="bar-value">{formatCurrency(data.basketValue)}</span>
                      </div>
                      <div 
                        className="chart-bar benchmark-bar" 
                        style={{ height: `${benchmarkHeight}%` }}
                        title={`Benchmark: ${formatCurrency(data.benchmarkValue)}`}
                      >
                        <span className="bar-value">{formatCurrency(data.benchmarkValue)}</span>
                      </div>
                    </div>
                    <div className="chart-label">{data.period}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Performance Badges */}
      <div className="performance-badges">
        {availablePeriods.map(period => (
          <div 
            key={period} 
            className={`performance-badge ${beatsBenchmark[period] ? 'beat' : 'track'}`}
          >
            <span className="badge-period">{period}</span>
            <span className="badge-status">
              {beatsBenchmark[period] ? 
                `Outperformed by ${(difference[period] * 100).toFixed(2)}%` : 
                `Underperformed by ${Math.abs(difference[period] * 100).toFixed(2)}%`
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
