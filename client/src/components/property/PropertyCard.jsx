import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FavoriteContext } from '../../context/FavoriteContext';
import { PropertyContext } from '../../context/PropertyContext';

const PropertyCard = ({ property }) => {
  const { user } = useContext(AuthContext);
  const { isFavorite, addFavorite, removeFavorite } = useContext(FavoriteContext);
  const { toggleCompare, compareList } = useContext(PropertyContext);

  const favorited = isFavorite(property._id);
  const isTenant = user && user.role === 'tenant';

  // Toggle favorite wishlist item
  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in as a Tenant to save properties.');
      return;
    }
    if (favorited) {
      await removeFavorite(property._id);
    } else {
      await addFavorite(property._id);
    }
  };

  // Check if this property is in compare list
  const isCompared = compareList.some((p) => p._id === property._id);

  const handleCompareClick = (e) => {
    e.stopPropagation();
    toggleCompare(property);
  };

  // Set category label color badge
  const getStatusBadge = () => {
    if (property.status === 'rented') {
      return <span className="badge-status bg-danger text-white">Rented</span>;
    }
    if (property.status === 'pending') {
      return <span className="badge-status bg-warning text-dark">Pending</span>;
    }
    return <span className="badge-status bg-success text-white">Available</span>;
  };

  const displayImage =
    property.images && property.images.length > 0
      ? property.images[0].startsWith('http')
        ? property.images[0]
        : `http://localhost:5000${property.images[0]}`
      : 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop&q=60';

  return (
    <div className="glass-card position-relative h-100 d-flex flex-column">
      {/* Category and status Badges */}
      <span className="badge-category">{property.propertyType}</span>
      {getStatusBadge()}

      {/* Image container with hover zoom */}
      <Link to={`/properties/${property._id}`} className="text-decoration-none image-zoom-container d-block" style={{ height: '220px' }}>
        <img
          src={displayImage}
          alt={property.title}
          className="w-100 h-100"
          style={{ objectFit: 'cover' }}
        />
      </Link>

      <div className="card-body p-3 d-flex flex-column flex-grow-1">
        {/* Title and Ratings */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Link to={`/properties/${property._id}`} className="text-decoration-none text-dark flex-grow-1 me-2" style={{ color: 'var(--text-primary)' }}>
            <h5 className="card-title fw-bold mb-0 text-truncate" style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{property.title}</h5>
          </Link>
          <div className="d-flex align-items-center gap-1 shrink-0 text-warning" style={{ fontSize: '0.9rem' }}>
            <i className="bi bi-star-fill"></i>
            <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>{property.rating || '4.0'}</span>
          </div>
        </div>

        {/* Location */}
        <p className="card-text text-muted mb-2 text-truncate" style={{ fontSize: '0.85rem' }}>
          <i className="bi bi-geo-alt-fill text-danger me-1"></i>
          {property.address}, {property.city}
        </p>

        {/* Property Specs */}
        <div className="d-flex gap-3 text-muted mb-3" style={{ fontSize: '0.8rem' }}>
          <span className="d-flex align-items-center gap-1">
            <i className="bi bi-door-closed text-primary"></i>
            {property.bedrooms} Bed
          </span>
          <span className="d-flex align-items-center gap-1">
            <i className="bi bi-droplet text-primary"></i>
            {property.bathrooms} Bath
          </span>
          <span className="d-flex align-items-center gap-1">
            <i className="bi bi-arrows-fullscreen text-primary"></i>
            {property.area} sqft
          </span>
        </div>

        <hr className="mt-auto mb-2" style={{ opacity: 0.1 }} />

        {/* Footer info: Rent price and Favorite action */}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div>
            <span className="text-primary fw-bold fs-5">₹{property.rent.toLocaleString('en-IN')}</span>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>/mo</span>
          </div>

          <div className="d-flex gap-2">
            {/* Compare Checkbox */}
            <button
              onClick={handleCompareClick}
              className={`btn btn-sm ${isCompared ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{ borderRadius: '8px', fontSize: '0.75rem' }}
              title="Compare property"
            >
              <i className="bi bi-arrow-left-right"></i> {isCompared ? 'Comparing' : 'Compare'}
            </button>

            {/* Favorite Wishlist Icon */}
            {isTenant && (
              <button
                onClick={handleFavoriteClick}
                className="btn btn-light shadow-sm p-2 d-flex align-items-center justify-content-center"
                style={{
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  color: favorited ? '#dc3545' : 'var(--text-muted)',
                }}
                aria-label="Wishlist property"
              >
                {favorited ? <i className="bi bi-heart-fill"></i> : <i className="bi bi-heart"></i>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
