import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      className="py-5 mt-auto"
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
      }}
    >
      <div className="container">
        <div className="row g-4">
          {/* Brand Col */}
          <div className="col-12 col-md-4">
            <Link className="d-flex align-items-center mb-3 text-decoration-none fs-4 fw-bold" to="/" style={{ color: 'var(--text-primary)' }}>
              <i className="bi bi-house-heart-fill text-primary me-2"></i>
              <span>RentalHouse</span>
            </Link>
            <p className="small mb-3" style={{ maxWidth: '320px' }}>
              Find luxury houses, student spaces, co-living rooms, and premium villas across prime Indian cities. Your dream rent home starts here.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="fs-5 text-secondary"><i className="bi bi-facebook"></i></a>
              <a href="#" className="fs-5 text-secondary"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="fs-5 text-secondary"><i className="bi bi-instagram"></i></a>
              <a href="#" className="fs-5 text-secondary"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-6 col-md-2">
            <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Quick Links</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/" className="text-decoration-none text-secondary">Home</Link></li>
              <li><Link to="/properties" className="text-decoration-none text-secondary">Browse Properties</Link></li>
              <li><Link to="/login" className="text-decoration-none text-secondary">Sign In</Link></li>
              <li><Link to="/register" className="text-decoration-none text-secondary">Sign Up</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-6 col-md-3">
            <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Properties Categories</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/properties?propertyType=Apartment" className="text-decoration-none text-secondary">Apartments</Link></li>
              <li><Link to="/properties?propertyType=Villa" className="text-decoration-none text-secondary">Luxury Villas</Link></li>
              <li><Link to="/properties?propertyType=Independent House" className="text-decoration-none text-secondary">Independent Houses</Link></li>
              <li><Link to="/properties?propertyType=PG" className="text-decoration-none text-secondary">Co-living PGs</Link></li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="col-12 col-md-3">
            <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Subscribe to Alerts</h6>
            <p className="small mb-3">Get notifications of newly listed properties in your area.</p>
            <div className="input-group">
              <input
                type="email"
                className="form-control"
                placeholder="Email Address"
                aria-label="Email Address"
                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', borderRadius: '10px 0 0 10px' }}
              />
              <button className="btn btn-primary-custom" type="button" style={{ borderRadius: '0 10px 10px 0' }}>
                Join
              </button>
            </div>
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: 'var(--border-color)' }} />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small">
          <span>&copy; {new Date().getFullYear()} RentalHouse Inc. All rights reserved.</span>
          <div className="d-flex gap-3">
            <a href="#" className="text-decoration-none text-secondary">Privacy Policy</a>
            <a href="#" className="text-decoration-none text-secondary">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
