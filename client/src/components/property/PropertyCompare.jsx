import React, { useContext, useState } from 'react';
import { PropertyContext } from '../../context/PropertyContext';

const PropertyCompare = () => {
  const { compareList, toggleCompare, clearCompare } = useContext(PropertyContext);
  const [showModal, setShowModal] = useState(false);

  if (compareList.length === 0) return null;

  // Flatten and extract unique amenities list across compared properties
  const allAmenities = Array.from(
    new Set(compareList.reduce((acc, p) => [...acc, ...(p.amenities || [])], []))
  );

  return (
    <>
      {/* Sticky Comparison Drawer */}
      <div
        className="fixed-bottom p-3 shadow-lg fade-in-up"
        style={{
          background: 'var(--bg-secondary)',
          borderTop: '2px solid var(--accent-color)',
          zIndex: 1050,
          boxShadow: '0 -10px 30px rgba(0,0,0,0.1)',
        }}
      >
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-arrow-left-right text-primary fs-4"></i>
              <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                Compare Properties ({compareList.length}/3)
              </span>
            </div>

            <div className="d-flex align-items-center gap-3">
              {/* Thumbnails of selected properties */}
              <div className="d-flex gap-2">
                {compareList.map((p) => {
                  const image =
                    p.images && p.images.length > 0
                      ? p.images[0].startsWith('http')
                        ? p.images[0]
                        : `http://localhost:5000${p.images[0]}`
                      : '';
                  return (
                    <div
                      key={p._id}
                      className="position-relative border rounded"
                      style={{ width: '50px', height: '50px', overflow: 'hidden' }}
                    >
                      <img src={image} alt={p.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                      <button
                        onClick={() => toggleCompare(p)}
                        className="btn btn-danger btn-sm p-0 position-absolute top-0 end-0 d-flex align-items-center justify-content-center"
                        style={{
                          width: '18px',
                          height: '18px',
                          fontSize: '0.65rem',
                          borderRadius: '50%',
                        }}
                        title="Remove"
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="d-flex gap-2">
                <button
                  onClick={() => setShowModal(true)}
                  disabled={compareList.length < 2}
                  className="btn btn-primary-custom py-2 px-3 text-nowrap"
                >
                  Compare Now
                </button>
                <button onClick={clearCompare} className="btn btn-secondary-custom py-2 px-3 text-nowrap">
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Details Modal */}
      {showModal && (
        <div
          className="modal show d-block fade-in"
          style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1100, overflowY: 'auto' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div
              className="modal-content border-0 p-3"
              style={{ background: 'var(--bg-secondary)', borderRadius: '20px' }}
            >
              <div className="modal-header border-0 d-flex justify-content-between align-items-center">
                <h4 className="modal-title fw-bold" style={{ color: 'var(--text-primary)' }}>
                  Properties Comparison
                </h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  style={{ filter: 'var(--text-primary) === "#f9fafb" ? "invert(1)" : "none"' }}
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-bordered align-middle text-center mt-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '20%', background: 'var(--bg-primary)' }}>Feature</th>
                        {compareList.map((p) => (
                          <th key={p._id} style={{ width: `${80 / compareList.length}%`, background: 'var(--bg-primary)' }}>
                            <div className="d-flex flex-column align-items-center gap-2 py-2">
                              <img
                                src={
                                  p.images && p.images.length > 0
                                    ? p.images[0].startsWith('http')
                                      ? p.images[0]
                                      : `http://localhost:5000${p.images[0]}`
                                    : ''
                                }
                                alt={p.title}
                                className="rounded"
                                style={{ width: '120px', height: '80px', objectFit: 'cover' }}
                              />
                              <span className="fw-bold small" style={{ maxWidth: '200px' }}>{p.title}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="fw-bold text-start">Monthly Rent</td>
                        {compareList.map((p) => (
                          <td key={p._id} className="text-primary fw-bold fs-5">₹{p.rent.toLocaleString('en-IN')}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="fw-bold text-start">Deposit</td>
                        {compareList.map((p) => (
                          <td key={p._id}>₹{p.deposit.toLocaleString('en-IN')}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="fw-bold text-start">Property Type</td>
                        {compareList.map((p) => (
                          <td key={p._id}>{p.propertyType}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="fw-bold text-start">Bedrooms</td>
                        {compareList.map((p) => (
                          <td key={p._id}>{p.bedrooms} BHK</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="fw-bold text-start">Bathrooms</td>
                        {compareList.map((p) => (
                          <td key={p._id}>{p.bathrooms} Bath</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="fw-bold text-start">Carpet Area</td>
                        {compareList.map((p) => (
                          <td key={p._id}>{p.area} sq ft</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="fw-bold text-start">Location</td>
                        {compareList.map((p) => (
                          <td key={p._id}>{p.city}, {p.state}</td>
                        ))}
                      </tr>
                      {/* Amenities Row */}
                      <tr>
                        <td className="fw-bold text-start">Amenities</td>
                        {compareList.map((p) => (
                          <td key={p._id}>
                            <div className="d-flex flex-wrap gap-1 justify-content-center">
                              {p.amenities && p.amenities.map((a) => (
                                <span
                                  key={a}
                                  className="badge bg-light text-dark border px-2 py-1"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer border-0">
                <button type="button" className="btn btn-secondary-custom" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyCompare;
