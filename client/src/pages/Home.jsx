import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PropertyContext } from '../context/PropertyContext';
import PropertyCard from '../components/property/PropertyCard';
import PropertyCompare from '../components/property/PropertyCompare';
import SkeletonLoader from '../components/common/SkeletonLoader';

const Home = () => {
  const navigate = useNavigate();
  const { properties, loading, fetchProperties } = useContext(PropertyContext);

  // Hero search bar state
  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  useEffect(() => {
    // Fetch newest properties for the home page showcase (limit 4)
    fetchProperties({ limit: 4 });
  }, [fetchProperties]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (search) queryParams.set('search', search);
    if (propertyType) queryParams.set('propertyType', propertyType);
    if (maxRent) queryParams.set('maxRent', maxRent);
    if (bedrooms) queryParams.set('bedrooms', bedrooms);

    navigate(`/properties?${queryParams.toString()}`);
  };

  const handleLocationClick = (locName) => {
    navigate(`/properties?search=${locName}`);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Hero Banner Section */}
      <section
        className="hero-bg"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&auto=format&fit=crop&q=80')`,
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content text-center py-5">
          <h1 className="display-4 fw-extrabold mb-3 text-white">
            Find Your Dream <span className="text-primary">Home</span>
          </h1>
          <p className="lead mb-4 text-white-50">
            Search hundreds of verified luxury properties, apartments, PG rooms, and villas at premium locations.
          </p>

          {/* Search bar inside Glass Search Box */}
          <form onSubmit={handleSearchSubmit} className="hero-search-box text-start mx-auto">
            <div className="row g-3">
              <div className="col-12 col-md-3">
                <label className="form-label small fw-bold text-secondary">Location</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-color">
                    <i className="bi bi-geo-alt text-primary"></i>
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-control bg-transparent border-start-0 border-color text-dark"
                    placeholder="City, state, area..."
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small fw-bold text-secondary">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="form-select bg-transparent border-color text-dark"
                >
                  <option value="">Any Type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Independent House">Independent House</option>
                  <option value="PG">PG Room</option>
                </select>
              </div>

              <div className="col-12 col-md-2">
                <label className="form-label small fw-bold text-secondary">Max Budget</label>
                <input
                  type="number"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  className="form-control bg-transparent border-color text-dark"
                  placeholder="₹ Max Rent"
                />
              </div>

              <div className="col-12 col-md-2">
                <label className="form-label small fw-bold text-secondary">Bedrooms</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="form-select bg-transparent border-color text-dark"
                >
                  <option value="">Any BHK</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4+ BHK</option>
                </select>
              </div>

              <div className="col-12 col-md-2 d-flex align-items-end">
                <button type="submit" className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2">
                  <i className="bi bi-search"></i> Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Properties Showcase */}
      <section className="py-5 bg-transparent">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small tracking-wider">Premium Listings</span>
              <h2 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Featured Properties</h2>
            </div>
            <Link to="/properties" className="btn btn-outline-primary fw-semibold" style={{ borderRadius: '10px' }}>
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          {loading ? (
            <SkeletonLoader count={4} />
          ) : (
            <div className="row g-4">
              {properties.slice(0, 4).map((property) => (
                <div key={property._id} className="col-12 col-md-6 col-lg-3">
                  <PropertyCard property={property} />
                </div>
              ))}
              {properties.length === 0 && (
                <div className="col-12 text-center py-5">
                  <i className="bi bi-house-exclamation fs-1 text-muted"></i>
                  <p className="mt-2 text-secondary">No properties found. Run the seed script or add properties from owner panel.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Popular Locations section */}
      <section className="py-5" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small">Hotspots</span>
            <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Explore Popular Locations</h2>
            <p className="text-secondary mx-auto" style={{ maxWidth: '500px' }}>Select listed houses in prime cities across India.</p>
          </div>

          <div className="row g-4">
            {[
              { name: 'Bangalore', count: '12 Listings', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=500&auto=format&fit=crop&q=60' },
              { name: 'Mumbai', count: '9 Listings', img: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&auto=format&fit=crop&q=60' },
              { name: 'New Delhi', count: '7 Listings', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&auto=format&fit=crop&q=60' },
              { name: 'Pune', count: '5 Listings', img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=500&auto=format&fit=crop&q=60' },
            ].map((loc, idx) => (
              <div key={idx} className="col-6 col-md-3">
                <div
                  onClick={() => handleLocationClick(loc.name)}
                  className="position-relative border-0 rounded-4 shadow-sm overflow-hidden"
                  style={{ height: '180px', cursor: 'pointer' }}
                >
                  <img src={loc.img} alt={loc.name} className="w-100 h-100" style={{ objectFit: 'cover', transition: 'all 0.5s' }} />
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end p-3"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1))' }}
                  >
                    <h5 className="text-white fw-bold mb-0">{loc.name}</h5>
                    <span className="text-white-50 small">{loc.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Categories section */}
      <section className="py-5 bg-transparent">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small">Categories</span>
            <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Find Properties by Type</h2>
          </div>

          <div className="row g-4 justify-content-center">
            {[
              { type: 'Apartment', icon: 'bi-building', desc: 'Modern high-rises and studio apartments.', bg: 'linear-gradient(135deg, #0d6efd, #0b5ed7)' },
              { type: 'Villa', icon: 'bi-house-heart', desc: 'Luxury detached villas and mansions.', bg: 'linear-gradient(135deg, #820dfd, #6f0cd7)' },
              { type: 'Independent House', icon: 'bi-house', desc: 'Spacious independent bungalows & duplexes.', bg: 'linear-gradient(135deg, #fd7e14, #e6700f)' },
              { type: 'PG', icon: 'bi-people', desc: 'Premium shared co-living hostels.', bg: 'linear-gradient(135deg, #198754, #157347)' },
            ].map((cat, idx) => (
              <div key={idx} className="col-12 col-sm-6 col-lg-3">
                <Link
                  to={`/properties?propertyType=${cat.type}`}
                  className="glass-card d-block p-4 text-center text-decoration-none text-dark h-100 d-flex flex-column justify-content-center"
                >
                  <div
                    className="mx-auto rounded-circle d-flex align-items-center justify-content-center text-white mb-3"
                    style={{ width: '60px', height: '60px', background: cat.bg }}
                  >
                    <i className={`bi ${cat.icon} fs-3`}></i>
                  </div>
                  <h5 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>{cat.type}s</h5>
                  <p className="text-muted small mb-0">{cat.desc}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-5 bg-light" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-md-6">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&auto=format&fit=crop&q=60"
                alt="Luxury House"
                className="w-100 rounded-4 shadow-lg"
                style={{ objectFit: 'cover', height: '420px' }}
              />
            </div>
            <div className="col-12 col-md-6">
              <span className="text-primary fw-bold text-uppercase small">Core Values</span>
              <h2 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Why Choose RentalHouse?</h2>
              <div className="d-flex flex-column gap-4">
                <div className="d-flex gap-3">
                  <div className="fs-3 text-primary"><i className="bi bi-shield-check"></i></div>
                  <div>
                    <h5 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Verified Properties</h5>
                    <p className="text-secondary small">Every listing is inspected and verified by our admins to guarantee accurate pricing and images.</p>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <div className="fs-3 text-primary"><i className="bi bi-chat-left-quote"></i></div>
                  <div>
                    <h5 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Direct Contact with Owners</h5>
                    <p className="text-secondary small">No intermediaries or heavy brokerage fees. Connect directly with owners to arrange viewings.</p>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <div className="fs-3 text-primary"><i className="bi bi-wallet2"></i></div>
                  <div>
                    <h5 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Secure Booking & Token Deposits</h5>
                    <p className="text-secondary small">Submit digital bookings and reviews directly from your Tenant dashboard.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials section */}
      <section className="py-5 bg-transparent">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small">Testimonials</span>
            <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>What Our Customers Say</h2>
          </div>

          <div className="row g-4">
            {[
              { name: 'Amit Sharma', role: 'Software Engineer (Tenant)', text: 'I found an amazing 2 BHK apartment in Bangalore within 3 days without paying any brokerage. The owner contact was direct and quick!' },
              { name: 'Ritu Sen', role: 'Apartment Owner', text: 'Listing my property was simple. Within a week, I approved a booking request from a verified tenant. The dashboard controls are super clean.' },
              { name: 'Deepak Rao', role: 'Student (PG Tenant)', text: 'The co-living space comparison tool was very useful. I compared room sizes, rent prices, and amenities side by side easily!' },
            ].map((testi, idx) => (
              <div key={idx} className="col-12 col-md-4">
                <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="text-warning mb-3">
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                    </div>
                    <p className="card-text text-secondary italic small">"{testi.text}"</p>
                  </div>
                  <div className="d-flex align-items-center gap-2 mt-4">
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                      {testi.name.split('')[0]}
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>{testi.name}</h6>
                      <span className="text-muted small" style={{ fontSize: '0.75rem' }}>{testi.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Counter section */}
      <section className="py-5 text-white" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
        <div className="container text-center">
          <div className="row g-4">
            <div className="col-6 col-md-3">
              <h1 className="fw-extrabold display-5 text-primary">3,000+</h1>
              <p className="small mb-0 text-white-50">Happy Renters</p>
            </div>
            <div className="col-6 col-md-3">
              <h1 className="fw-extrabold display-5 text-primary">1,200+</h1>
              <p className="small mb-0 text-white-50">Listed Homes</p>
            </div>
            <div className="col-6 col-md-3">
              <h1 className="fw-extrabold display-5 text-primary">500+</h1>
              <p className="small mb-0 text-white-50">Premium Owners</p>
            </div>
            <div className="col-6 col-md-3">
              <h1 className="fw-extrabold display-5 text-primary">15+</h1>
              <p className="small mb-0 text-white-50">Indian Cities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Property comparison sticky bar */}
      <PropertyCompare />
    </div>
  );
};

export default Home;
