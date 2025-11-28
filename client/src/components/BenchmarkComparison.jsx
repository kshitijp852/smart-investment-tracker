import React, { useState, useRef, useEffect } from 'react';

export default function BenchmarkComparison({ benchmarkData, chartData, formatCurrency }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const chartRef = useRef(null);

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

      {/* Interactive Line Chart */}
      {chart && chart.length > 0 && (
        <div className="benchmark-chart">
          <h4 className="benchmark-subtitle">📈 Growth Comparison Over Time</h4>
          <div className="chart-container" ref={chartRef}>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color basket"></span>
                <span className="legend-label">Your Portfolio</span>
              </div>
              <div className="legend-item">
                <span className="legend-color benchmark"></span>
                <span className="legend-label">Blended Benchmark</span>
              </div>
            </div>
            
            <InteractiveLineChart 
              data={chart}
              formatCurrency={formatCurrency}
              hoveredPoint={hoveredPoint}
              setHoveredPoint={setHoveredPoint}
              tooltipPos={tooltipPos}
              setTooltipPos={setTooltipPos}
            />
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

// Interactive Line Chart Component
function InteractiveLineChart({ data, formatCurrency, hoveredPoint, setHoveredPoint, tooltipPos, setTooltipPos }) {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: 400 });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const padding = { top: 40, right: 40, bottom: 60, left: 80 };
  const chartWidth = dimensions.width - padding.left - padding.right;
  const chartHeight = dimensions.height - padding.top - padding.bottom;

  // Find min and max values
  const allValues = data.flatMap(d => [d.basketValue, d.benchmarkValue]);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue;
  const yMin = minValue - valueRange * 0.1;
  const yMax = maxValue + valueRange * 0.1;

  // Scale functions
  const xScale = (index) => (index / (data.length - 1)) * chartWidth;
  const yScale = (value) => chartHeight - ((value - yMin) / (yMax - yMin)) * chartHeight;

  // Generate path for line
  const generatePath = (valueKey) => {
    return data.map((d, i) => {
      const x = xScale(i);
      const y = yScale(d[valueKey]);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const basketPath = generatePath('basketValue');
  const benchmarkPath = generatePath('benchmarkValue');

  // Y-axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => 
    yMin + (yMax - yMin) * (i / (yTicks - 1))
  );

  const handleMouseMove = (e, index) => {
    const rect = svgRef.current.getBoundingClientRect();
    setHoveredPoint(index);
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="interactive-chart-wrapper">
      <svg 
        ref={svgRef} 
        className="line-chart-svg" 
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        <g className="grid-lines">
          {yTickValues.map((value, i) => (
            <line
              key={i}
              x1={padding.left}
              y1={padding.top + yScale(value)}
              x2={padding.left + chartWidth}
              y2={padding.top + yScale(value)}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
        </g>

        {/* Y-axis */}
        <g className="y-axis">
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke="#9ca3af"
            strokeWidth="2"
          />
          {yTickValues.map((value, i) => (
            <g key={i}>
              <line
                x1={padding.left - 5}
                y1={padding.top + yScale(value)}
                x2={padding.left}
                y2={padding.top + yScale(value)}
                stroke="#9ca3af"
                strokeWidth="2"
              />
              <text
                x={padding.left - 10}
                y={padding.top + yScale(value)}
                textAnchor="end"
                alignmentBaseline="middle"
                fill="#6b7280"
                fontSize="12"
                fontWeight="500"
              >
                {formatCurrency(value)}
              </text>
            </g>
          ))}
        </g>

        {/* X-axis */}
        <g className="x-axis">
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            stroke="#9ca3af"
            strokeWidth="2"
          />
          {data.map((d, i) => (
            <g key={i}>
              <line
                x1={padding.left + xScale(i)}
                y1={padding.top + chartHeight}
                x2={padding.left + xScale(i)}
                y2={padding.top + chartHeight + 5}
                stroke="#9ca3af"
                strokeWidth="2"
              />
              <text
                x={padding.left + xScale(i)}
                y={padding.top + chartHeight + 20}
                textAnchor="middle"
                fill="#6b7280"
                fontSize="12"
                fontWeight="500"
              >
                {d.period}
              </text>
            </g>
          ))}
        </g>

        {/* Chart area */}
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Benchmark line */}
          <path
            d={benchmarkPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Portfolio line */}
          <path
            d={basketPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((d, i) => (
            <g key={i}>
              {/* Benchmark point */}
              <circle
                cx={xScale(i)}
                cy={yScale(d.benchmarkValue)}
                r={hoveredPoint === i ? 8 : 5}
                fill="#f59e0b"
                stroke="white"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                onMouseEnter={(e) => handleMouseMove(e, i)}
                onMouseLeave={handleMouseLeave}
              />
              
              {/* Portfolio point */}
              <circle
                cx={xScale(i)}
                cy={yScale(d.basketValue)}
                r={hoveredPoint === i ? 8 : 5}
                fill="#10b981"
                stroke="white"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                onMouseEnter={(e) => handleMouseMove(e, i)}
                onMouseLeave={handleMouseLeave}
              />

              {/* Invisible hover area */}
              <rect
                x={xScale(i) - 20}
                y={0}
                width={40}
                height={chartHeight}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => handleMouseMove(e, i)}
                onMouseLeave={handleMouseLeave}
              />
            </g>
          ))}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredPoint !== null && (
        <div 
          className="chart-tooltip"
          style={{
            left: `${tooltipPos.x + 15}px`,
            top: `${tooltipPos.y - 80}px`
          }}
        >
          <div className="tooltip-header">{data[hoveredPoint].period}</div>
          <div className="tooltip-row portfolio">
            <span className="tooltip-label">
              <span className="tooltip-dot portfolio-dot"></span>
              Your Portfolio
            </span>
            <span className="tooltip-value">{formatCurrency(data[hoveredPoint].basketValue)}</span>
          </div>
          <div className="tooltip-row benchmark">
            <span className="tooltip-label">
              <span className="tooltip-dot benchmark-dot"></span>
              Benchmark
            </span>
            <span className="tooltip-value">{formatCurrency(data[hoveredPoint].benchmarkValue)}</span>
          </div>
          <div className="tooltip-divider"></div>
          <div className={`tooltip-row difference ${data[hoveredPoint].basketValue > data[hoveredPoint].benchmarkValue ? 'positive' : 'negative'}`}>
            <span className="tooltip-label">Difference</span>
            <span className="tooltip-value">
              {data[hoveredPoint].basketValue > data[hoveredPoint].benchmarkValue ? '+' : ''}
              {formatCurrency(data[hoveredPoint].basketValue - data[hoveredPoint].benchmarkValue)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
