import React from 'react';

const PropertyFilter = ({ filters, onChange, onClear }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <div
      className="p-4 shadow-sm"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
          <i className="bi bi-sliders text-primary me-2"></i> Filters
        </h5>
        <button
          onClick={onClear}
          className="btn btn-sm btn-link text-decoration-none text-muted p-0"
          style={{ fontSize: '0.85rem' }}
        >
          Clear All
        </button>
      </div>

      <div className="d-flex flex-column gap-3">
        {/* Search Input */}
        <div>
          <label className="form-label small fw-bold" style={{ color: 'var(--text-secondary)' }}>Search</label>
          <div className="input-group">
            <span className="input-group-text" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              name="search"
              value={filters.search || ''}
              onChange={handleInputChange}
              className="form-control"
              placeholder="e.g. Bangalore, Villa..."
              style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            />
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="form-label small fw-bold" style={{ color: 'var(--text-secondary)' }}>Property Type</label>
          <select
            name="propertyType"
            value={filters.propertyType || ''}
            onChange={handleInputChange}
            className="form-select"
            style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
          >
            <option value="">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Independent House">Independent House</option>
            <option value="PG">PG (Co-living)</option>
          </select>
        </div>

        {/* Price Rent Budget */}
        <div>
          <label className="form-label small fw-bold" style={{ color: 'var(--text-secondary)' }}>Monthly Rent Range</label>
          <div className="row g-2">
            <div className="col-6">
              <input
                type="number"
                name="minRent"
                value={filters.minRent || ''}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Min ₹"
                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
            </div>
            <div className="col-6">
              <input
                type="number"
                name="maxRent"
                value={filters.maxRent || ''}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Max ₹"
                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
            </div>
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="form-label small fw-bold" style={{ color: 'var(--text-secondary)' }}>Bedrooms</label>
          <select
            name="bedrooms"
            value={filters.bedrooms || ''}
            onChange={handleInputChange}
            className="form-select"
            style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
          >
            <option value="">Any Bedrooms</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>

        {/* Bathrooms */}
        <div>
          <label className="form-label small fw-bold" style={{ color: 'var(--text-secondary)' }}>Bathrooms</label>
          <select
            name="bathrooms"
            value={filters.bathrooms || ''}
            onChange={handleInputChange}
            className="form-select"
            style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
          >
            <option value="">Any Bathrooms</option>
            <option value="1">1 Bath</option>
            <option value="2">2 Baths</option>
            <option value="3">3+ Baths</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="form-label small fw-bold" style={{ color: 'var(--text-secondary)' }}>Sort By</label>
          <select
            name="sort"
            value={filters.sort || ''}
            onChange={handleInputChange}
            className="form-select"
            style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
          >
            <option value="-createdAt">Newest First</option>
            <option value="rent">Rent: Low to High</option>
            <option value="-rent">Rent: High to Low</option>
            <option value="-area">Size: Large to Small</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilter;
