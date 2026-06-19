import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PropertyContext } from '../context/PropertyContext';
import PropertyCard from '../components/property/PropertyCard';
import PropertyFilter from '../components/property/PropertyFilter';
import PropertyCompare from '../components/property/PropertyCompare';
import SkeletonLoader from '../components/common/SkeletonLoader';

const Properties = () => {
  const { properties, loading, pagination, fetchProperties } = useContext(PropertyContext);
  const location = useLocation();

  // Active filters state
  const [filters, setFilters] = useState({
    search: '',
    propertyType: '',
    minRent: '',
    maxRent: '',
    bedrooms: '',
    bathrooms: '',
    sort: '-createdAt',
    page: 1,
  });

  // Sync filters from URL search parameters on mount or URL change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchVal = params.get('search') || '';
    const typeVal = params.get('propertyType') || '';
    const rentVal = params.get('maxRent') || '';
    const bedVal = params.get('bedrooms') || '';

    const newFilters = {
      search: searchVal,
      propertyType: typeVal,
      minRent: '',
      maxRent: rentVal,
      bedrooms: bedVal,
      bathrooms: '',
      sort: '-createdAt',
      page: 1,
    };

    setFilters(newFilters);
    fetchProperties(newFilters);
  }, [location.search, fetchProperties]);

  const handleFilterChange = (name, value) => {
    const updatedFilters = { ...filters, [name]: value, page: 1 };
    setFilters(updatedFilters);
    fetchProperties(updatedFilters);
  };

  const handleClearFilters = () => {
    const cleared = {
      search: '',
      propertyType: '',
      minRent: '',
      maxRent: '',
      bedrooms: '',
      bathrooms: '',
      sort: '-createdAt',
      page: 1,
    };
    setFilters(cleared);
    fetchProperties(cleared);
  };

  const handleLoadMore = () => {
    const nextPage = filters.page + 1;
    const updatedFilters = { ...filters, page: nextPage };
    setFilters(updatedFilters);
    fetchProperties(updatedFilters);
  };

  return (
    <div className="py-5 bg-transparent">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-12">
            <h2 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Browse Rental Homes
            </h2>
            <p className="text-secondary small">
              Compare amenities and request bookings directly with verified house owners.
            </p>
          </div>
        </div>

        <div className="row g-4">
          {/* Filters Sidebar */}
          <div className="col-12 col-lg-3">
            <PropertyFilter
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </div>

          {/* Listings Grid */}
          <div className="col-12 col-lg-9">
            {loading && filters.page === 1 ? (
              <SkeletonLoader count={6} />
            ) : (
              <>
                <div className="row g-4">
                  {properties.map((property) => (
                    <div key={property._id} className="col-12 col-md-6 col-lg-4">
                      <PropertyCard property={property} />
                    </div>
                  ))}

                  {properties.length === 0 && (
                    <div className="col-12 text-center py-5 bg-light rounded-4 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                      <i className="bi bi-house-slash fs-1 text-muted"></i>
                      <h4 className="fw-bold mt-3" style={{ color: 'var(--text-primary)' }}>No Properties Found</h4>
                      <p className="text-secondary small">Try adjusting your filters or search keywords.</p>
                      <button onClick={handleClearFilters} className="btn btn-primary-custom mt-2">
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Pagination / Load More Button */}
                {pagination.next && (
                  <div className="text-center mt-5">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="btn btn-outline-primary fw-semibold px-4 py-2"
                      style={{ borderRadius: '10px' }}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      ) : null}
                      Load More Properties
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Property comparison sticky bar */}
      <PropertyCompare />
    </div>
  );
};

export default Properties;
