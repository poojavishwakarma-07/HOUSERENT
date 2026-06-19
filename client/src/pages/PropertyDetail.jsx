import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PropertyContext } from '../context/PropertyContext';
import { AuthContext } from '../context/AuthContext';
import { FavoriteContext } from '../context/FavoriteContext';
import apiClient from '../api/apiClient';
import PropertyCard from '../components/property/PropertyCard';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProperty, fetchProperty, properties, fetchProperties } = useContext(PropertyContext);
  const { user } = useContext(AuthContext);
  const { isFavorite, addFavorite, removeFavorite } = useContext(FavoriteContext);

  const [activeImage, setActiveImage] = useState(0);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    fetchProperty(id);
    fetchReviews();
  }, [id, fetchProperty]);

  useEffect(() => {
    if (currentProperty) {
      // Fetch similar properties of same type
      fetchProperties({ propertyType: currentProperty.propertyType, limit: 4 });
    }
  }, [currentProperty, fetchProperties]);

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await apiClient.get(`/reviews/${id}`);
      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  if (!currentProperty) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading property details...</p>
      </div>
    );
  }

  const favorited = isFavorite(currentProperty._id);
  const isTenant = user && user.role === 'tenant';

  const handleFavoriteToggle = async () => {
    if (!user) {
      alert('Please sign in as a Tenant to save properties.');
      return;
    }
    if (favorited) {
      await removeFavorite(currentProperty._id);
    } else {
      await addFavorite(currentProperty._id);
    }
  };

  // Submit booking request
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'tenant') {
      setBookingError('Only Tenants can request property bookings.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess(false);

    try {
      const res = await apiClient.post('/bookings', {
        propertyId: currentProperty._id,
        message: bookingMessage,
      });
      if (res.data.success) {
        setBookingSuccess(true);
        setBookingMessage('');
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Error submitting booking request.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'tenant') {
      setReviewError('Only Tenants can post property reviews.');
      return;
    }
    if (!reviewText) {
      setReviewError('Please write a review.');
      return;
    }

    setReviewError('');
    setReviewSuccess(false);

    try {
      const res = await apiClient.post('/reviews', {
        propertyId: currentProperty._id,
        rating,
        reviewText,
      });

      if (res.data.success) {
        setReviewSuccess(true);
        setReviewText('');
        setRating(5);
        fetchReviews(); // Refresh reviews list
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Error submitting review.');
    }
  };

  // Map URL
  const lat = currentProperty.locationCoordinates?.lat || 12.9716;
  const lng = currentProperty.locationCoordinates?.lng || 77.5946;
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  // Get similar properties list excluding the current one
  const filteredSimilar = properties.filter((p) => p._id !== currentProperty._id).slice(0, 3);

  return (
    <div className="py-5 bg-transparent">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/properties" className="text-decoration-none">Properties</Link></li>
            <li className="breadcrumb-item active" aria-current="page" style={{ color: 'var(--text-primary)' }}>{currentProperty.title}</li>
          </ol>
        </nav>

        {/* Title and location */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
          <div>
            <span className="badge bg-primary px-3 py-2 mb-2" style={{ borderRadius: '20px' }}>{currentProperty.propertyType}</span>
            <h2 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{currentProperty.title}</h2>
            <p className="text-muted mb-0">
              <i className="bi bi-geo-alt-fill text-danger me-1"></i>
              {currentProperty.address}, {currentProperty.city}, {currentProperty.state} - {currentProperty.pincode}
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* Wishlist Button */}
            {isTenant && (
              <button
                onClick={handleFavoriteToggle}
                className={`btn ${favorited ? 'btn-danger' : 'btn-outline-secondary'} d-flex align-items-center gap-2`}
                style={{ borderRadius: '10px' }}
              >
                <i className={`bi ${favorited ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                <span>{favorited ? 'Wishlisted' : 'Save Property'}</span>
              </button>
            )}

            {/* Share Button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Property link copied to clipboard!');
              }}
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              style={{ borderRadius: '10px' }}
              title="Copy Page Link"
            >
              <i className="bi bi-share"></i> Share
            </button>
          </div>
        </div>

        <div className="row g-4">
          {/* Left Column: Gallery, Description, Amenities, Maps, Reviews */}
          <div className="col-12 col-lg-8">
            {/* Image Slider */}
            <div className="glass-card overflow-hidden mb-4" style={{ borderRadius: '20px' }}>
              <div style={{ height: '450px', overflow: 'hidden' }}>
                <img
                  src={
                    currentProperty.images && currentProperty.images.length > 0
                      ? currentProperty.images[activeImage].startsWith('http')
                        ? currentProperty.images[activeImage]
                        : `http://localhost:5000${currentProperty.images[activeImage]}`
                      : ''
                  }
                  alt={currentProperty.title}
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              {/* Thumbnails list */}
              {currentProperty.images && currentProperty.images.length > 1 && (
                <div className="d-flex gap-2 p-3 bg-light overflow-x-auto border-top" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                  {currentProperty.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`border rounded overflow-hidden cursor-pointer ${
                        activeImage === idx ? 'border-primary border-3' : ''
                      }`}
                      style={{ width: '80px', height: '60px', flexShrink: 0, cursor: 'pointer' }}
                    >
                      <img
                        src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                        alt="thumbnail"
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description & Overview Grid */}
            <div
              className="p-4 mb-4"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
              }}
            >
              <h4 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Overview</h4>
              <div className="row g-3 text-center mb-4">
                <div className="col-4 col-sm-2">
                  <div className="p-2 bg-light rounded" style={{ background: 'var(--bg-primary)' }}>
                    <i className="bi bi-door-closed fs-3 text-primary"></i>
                    <p className="small text-muted mb-0 mt-1">Bedrooms</p>
                    <h6 className="fw-bold mb-0">{currentProperty.bedrooms} BHK</h6>
                  </div>
                </div>
                <div className="col-4 col-sm-2">
                  <div className="p-2 bg-light rounded" style={{ background: 'var(--bg-primary)' }}>
                    <i className="bi bi-droplet fs-3 text-primary"></i>
                    <p className="small text-muted mb-0 mt-1">Bathrooms</p>
                    <h6 className="fw-bold mb-0">{currentProperty.bathrooms} Baths</h6>
                  </div>
                </div>
                <div className="col-4 col-sm-2">
                  <div className="p-2 bg-light rounded" style={{ background: 'var(--bg-primary)' }}>
                    <i className="bi bi-arrows-fullscreen fs-3 text-primary"></i>
                    <p className="small text-muted mb-0 mt-1">Area</p>
                    <h6 className="fw-bold mb-0">{currentProperty.area} Sqft</h6>
                  </div>
                </div>
                <div className="col-4 col-sm-3">
                  <div className="p-2 bg-light rounded" style={{ background: 'var(--bg-primary)' }}>
                    <i className="bi bi-tag fs-3 text-primary"></i>
                    <p className="small text-muted mb-0 mt-1">Rent</p>
                    <h6 className="fw-bold mb-0 text-primary">₹{currentProperty.rent}/mo</h6>
                  </div>
                </div>
                <div className="col-4 col-sm-3">
                  <div className="p-2 bg-light rounded" style={{ background: 'var(--bg-primary)' }}>
                    <i className="bi bi-safe fs-3 text-primary"></i>
                    <p className="small text-muted mb-0 mt-1">Deposit</p>
                    <h6 className="fw-bold mb-0 text-success">₹{currentProperty.deposit}</h6>
                  </div>
                </div>
              </div>

              <h4 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Description</h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{currentProperty.description}</p>
            </div>

            {/* Amenities Section */}
            <div
              className="p-4 mb-4"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
              }}
            >
              <h4 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Amenities</h4>
              <div className="row g-2">
                {currentProperty.amenities && currentProperty.amenities.length > 0 ? (
                  currentProperty.amenities.map((amenity) => (
                    <div key={amenity} className="col-6 col-sm-4 d-flex align-items-center gap-2 py-1">
                      <i className="bi bi-check-circle-fill text-success"></i>
                      <span className="small">{amenity}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary small">No specific amenities listed.</p>
                )}
              </div>
            </div>

            {/* Maps Integration */}
            <div
              className="p-4 mb-4"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
              }}
            >
              <h4 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Location Map</h4>
              <div className="rounded-3 overflow-hidden" style={{ height: '300px' }}>
                <iframe
                  title="Property Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={mapUrl}
                ></iframe>
              </div>
            </div>

            {/* Reviews Section */}
            <div
              className="p-4 mb-4"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
              }}
            >
              <h4 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Reviews ({reviews.length})
              </h4>

              {/* Add Review Form (Only for Tenants) */}
              {isTenant && (
                <form onSubmit={handleReviewSubmit} className="mb-5 p-3 rounded" style={{ background: 'var(--bg-primary)' }}>
                  <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Write a Review</h6>
                  
                  {reviewSuccess && <div className="alert alert-success py-2 small">Review posted successfully!</div>}
                  {reviewError && <div className="alert alert-danger py-2 small">{reviewError}</div>}

                  <div className="mb-3 d-flex align-items-center gap-3">
                    <span className="small text-secondary">Your Rating:</span>
                    <div className="d-flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          onClick={() => setRating(star)}
                          className={`bi bi-star-fill cursor-pointer ${star <= rating ? 'text-warning' : 'text-muted'}`}
                          style={{ cursor: 'pointer', fontSize: '1.25rem' }}
                        ></i>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="form-control"
                      rows="3"
                      placeholder="Share your experience renting or visiting this house..."
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary-custom">
                    Post Review
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="d-flex flex-column gap-3">
                {reviews.map((rev) => (
                  <div key={rev._id} className="pb-3 border-bottom border-color-light">
                    <div className="d-flex justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                          {rev.tenantId?.name ? rev.tenantId.name.split('')[0] : 'T'}
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {rev.tenantId?.name || 'Anonymous Tenant'}
                          </h6>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-warning">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <i key={i} className="bi bi-star-fill small"></i>
                        ))}
                      </div>
                    </div>
                    <p className="mb-0 small text-secondary">{rev.reviewText}</p>
                  </div>
                ))}

                {reviews.length === 0 && (
                  <p className="text-secondary small text-center my-3">No reviews yet. Be the first to add a review!</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Owner & Booking Inquiries Sticky Card */}
          <div className="col-12 col-lg-4">
            <div
              className="p-4 sticky-top"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                top: '100px',
                zIndex: 10,
              }}
            >
              <h5 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Renting Info</h5>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Monthly Rent</span>
                <span className="fs-4 text-primary fw-bold">₹{currentProperty.rent.toLocaleString('en-IN')}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="text-muted">Security Deposit</span>
                <span className="fw-semibold">₹{currentProperty.deposit.toLocaleString('en-IN')}</span>
              </div>

              {/* Owner details */}
              {currentProperty.ownerId && (
                <div className="p-3 bg-light rounded-4 mb-4" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                  <h6 className="fw-bold mb-2 small" style={{ color: 'var(--text-primary)' }}>Contact Owner</h6>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-person-check-fill text-primary"></i>
                    <span className="small fw-semibold">{currentProperty.ownerId.name}</span>
                  </div>
                  {user ? (
                    <>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="bi bi-telephone-fill text-muted"></i>
                        <a href={`tel:${currentProperty.ownerId.phone}`} className="small text-decoration-none">{currentProperty.ownerId.phone}</a>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-envelope-fill text-muted"></i>
                        <a href={`mailto:${currentProperty.ownerId.email}`} className="small text-decoration-none text-truncate" style={{ maxWidth: '220px' }}>{currentProperty.ownerId.email}</a>
                      </div>
                    </>
                  ) : (
                    <span className="small text-muted italic">Log in to view contact details.</span>
                  )}
                </div>
              )}

              {/* Booking Request Form */}
              {currentProperty.status === 'rented' ? (
                <div className="alert alert-danger text-center mb-0">This property has already been rented.</div>
              ) : (
                <form onSubmit={handleBookingSubmit}>
                  <h6 className="fw-bold mb-2 small" style={{ color: 'var(--text-primary)' }}>Submit Booking Inquiry</h6>
                  
                  {bookingSuccess && <div className="alert alert-success py-2 small">Request submitted! The owner has been notified.</div>}
                  {bookingError && <div className="alert alert-danger py-2 small">{bookingError}</div>}

                  <div className="mb-3">
                    <textarea
                      value={bookingMessage}
                      onChange={(e) => setBookingMessage(e.target.value)}
                      className="form-control"
                      rows="3"
                      placeholder="Hi, I am interested in renting this. Please contact me."
                      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', fontSize: '0.85rem' }}
                      required
                      disabled={user && user.role !== 'tenant'}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary-custom w-100"
                    disabled={bookingLoading || (user && user.role !== 'tenant')}
                  >
                    {bookingLoading ? 'Sending...' : 'Find Your Dream Home / Request Visit'}
                  </button>
                  {user && user.role !== 'tenant' && (
                    <span className="small text-muted d-block text-center mt-2" style={{ fontSize: '0.75rem' }}>Only Tenant accounts can apply.</span>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        {filteredSimilar.length > 0 && (
          <div className="mt-5 pt-4">
            <h3 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Similar Properties</h3>
            <div className="row g-4">
              {filteredSimilar.map((p) => (
                <div key={p._id} className="col-12 col-md-4">
                  <PropertyCard property={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;
