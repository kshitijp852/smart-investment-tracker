import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExploreFunds = () => {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters and pagination
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState(null);

  const categories = [
    'All Categories',
    'Equity',
    'Large Cap',
    'Mid Cap',
    'Small Cap',
    'Debt',
    'Hybrid',
    'ELSS',
    'Liquid'
  ];

  useEffect(() => {
    fetchFunds();
  }, [page, category, sortBy, sortOrder]);

  const fetchFunds = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit: 20,
        sortBy,
        sortOrder
      };
      
      if (search) params.search = search;
      if (category && category !== 'All Categories') params.category = category;

      const response = await axios.get('http://localhost:5001/api/funds/explore', { params });
      
      setFunds(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFunds();
  };

  const getRiskBadgeColor = (riskScore) => {
    if (riskScore <= 2) return 'bg-green-100 text-green-800';
    if (riskScore <= 4) return 'bg-yellow-100 text-yellow-800';
    if (riskScore <= 6) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getRiskLabel = (riskScore) => {
    if (riskScore <= 2) return 'Low Risk';
    if (riskScore <= 4) return 'Medium Risk';
    if (riskScore <= 6) return 'High Risk';
    return 'Very High Risk';
  };

  return (
    <div className="explore-funds-container">
      {/* Header */}
      <div className="explore-header">
        <h1 className="explore-title">🔍 Explore Mutual Funds</h1>
        <p className="explore-subtitle">Discover and compare 14,000+ mutual funds</p>
      </div>
      
      {/* Filters */}
      <div className="explore-filters">
        <div className="filters-grid">
          {/* Search */}
          <form onSubmit={handleSearch}>
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="🔎 Search funds by name (e.g., HDFC, SBI, Axis)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                Search
              </button>
            </div>
          </form>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="score-desc">Highest Score</option>
            <option value="score-asc">Lowest Score</option>
            <option value="nav-desc">Highest NAV</option>
            <option value="nav-asc">Lowest NAV</option>
            <option value="return-desc">Highest Return</option>
            <option value="return-asc">Lowest Return</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Results Info */}
      {pagination && !loading && (
        <div className="results-info">
          Showing <span className="results-count">{funds.length}</span> of <span className="results-count">{pagination.totalItems}</span> funds 
          (Page {pagination.currentPage} of {pagination.totalPages})
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">✨ Loading amazing funds for you...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-container">
          <strong>⚠️ Oops!</strong> {error}
        </div>
      )}

      {/* Funds Grid */}
      {!loading && !error && funds.length > 0 && (
        <div className="funds-grid">
          {funds.map((fund) => (
            <div key={fund.schemeCode} className="fund-card">
              {/* Score Badge */}
              <div className="score-badge">{fund.score}</div>

              {/* Fund Header */}
              <div className="fund-card-header">
                <h3 className="fund-name">{fund.schemeName}</h3>
                <p className="fund-category">{fund.category}</p>
              </div>

              {/* Metrics */}
              <div className="fund-metrics">
                <div className="metric-row">
                  <span className="metric-label">💰 Current NAV</span>
                  <span className="metric-value">₹{fund.currentNAV.toFixed(2)}</span>
                </div>
                
                <div className="metric-row">
                  <span className="metric-label">📈 Expected Return</span>
                  <span className="metric-value positive">{fund.expectedReturn}% p.a.</span>
                </div>
                
                <div className="metric-row">
                  <span className="metric-label">🎯 5Y Projection</span>
                  <span className="metric-value highlight">₹{fund.projectedValue5Y.toFixed(2)}</span>
                </div>
              </div>

              {/* Risk Badge */}
              <div className="fund-footer">
                <span className={`risk-badge ${
                  fund.riskScore <= 2 ? 'low' : 
                  fund.riskScore <= 4 ? 'medium' : 
                  fund.riskScore <= 6 ? 'high' : 'very-high'
                }`}>
                  {getRiskLabel(fund.riskScore)}
                </span>
                <span className="fund-date">
                  {new Date(fund.navDate).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && funds.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">No funds found</h3>
          <p className="empty-text">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && !loading && funds.length > 0 && (
        <div className="pagination-container">
          <button
            onClick={() => setPage(page - 1)}
            disabled={!pagination.hasPrevPage}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => setPage(page + 1)}
            disabled={!pagination.hasNextPage}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ExploreFunds;
