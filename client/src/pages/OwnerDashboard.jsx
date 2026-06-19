import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PropertyContext } from '../context/PropertyContext';
import apiClient from '../api/apiClient';
import { Link } from 'react-router-dom';

const OwnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const { properties, fetchProperties, createProperty, updateProperty, deleteProperty } = useContext(PropertyContext);

  // States
  const [activeTab, setActiveTab] = useState('properties');
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [analytics, setAnalytics] = useState({ totalListings: 0, activeRent: 0, pendingRequests: 0 });

  // Add / Edit Property Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPropId, setCurrentPropId] = useState(null);
  
  // Property Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [amenities, setAmenities] = useState('');
  const [images, setImages] = useState(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const fetchOwnerData = async () => {
    setBookingsLoading(true);
    try {
      // 1. Fetch properties owned by this user
      // Note: Backend filter is handles automatic for owner or we pass ownerId query
      await fetchProperties({ ownerId: user._id, status: 'all' });

      // 2. Fetch booking requests for owner properties
      const res = await apiClient.get('/bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Recalculate metrics on properties and bookings change
  useEffect(() => {
    const ownerProperties = properties.filter((p) => p.ownerId?._id === user._id || p.ownerId === user._id);
    const activeRent = ownerProperties
      .filter((p) => p.status === 'rented')
      .reduce((acc, p) => acc + p.rent, 0);

    const pendingRequests = bookings.filter((b) => b.status === 'pending').length;

    setAnalytics({
      totalListings: ownerProperties.length,
      activeRent,
      pendingRequests,
    });
  }, [properties, bookings, user._id]);

  // Open add property modal
  const handleOpenAdd = () => {
    setIsEdit(false);
    setTitle('');
    setDescription('');
    setRent('');
    setDeposit('');
    setPropertyType('Apartment');
    setBedrooms('2');
    setBathrooms('2');
    setArea('');
    setAddress('');
    setCity('Bangalore');
    setState('Karnataka');
    setPincode('');
    setAmenities('');
    setImages(null);
    setFormError('');
    setShowModal(true);
  };

  // Open edit property modal
  const handleOpenEdit = (prop) => {
    setIsEdit(true);
    setCurrentPropId(prop._id);
    setTitle(prop.title);
    setDescription(prop.description);
    setRent(prop.rent);
    setDeposit(prop.deposit);
    setPropertyType(prop.propertyType);
    setBedrooms(prop.bedrooms);
    setBathrooms(prop.bathrooms);
    setArea(prop.area);
    setAddress(prop.address);
    setCity(prop.city);
    setState(prop.state);
    setPincode(prop.pincode);
    setAmenities(prop.amenities ? prop.amenities.join(', ') : '');
    setImages(null);
    setFormError('');
    setShowModal(true);
  };

  // Submit property Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('rent', rent);
    formData.append('deposit', deposit);
    formData.append('propertyType', propertyType);
    formData.append('bedrooms', bedrooms);
    formData.append('bathrooms', bathrooms);
    formData.append('area', area);
    formData.append('address', address);
    formData.append('city', city);
    formData.append('state', state);
    formData.append('pincode', pincode);
    formData.append('amenities', amenities);
    
    if (images) {
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }
    }

    let result;
    if (isEdit) {
      result = await updateProperty(currentPropId, formData);
    } else {
      result = await createProperty(formData);
    }

    setFormLoading(false);

    if (result.success) {
      setShowModal(false);
      fetchOwnerData(); // Refetch
    } else {
      setFormError(result.message);
    }
  };

  // Delete property
  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this property? This will remove all reviews linked to it.')) {
      const res = await deleteProperty(id);
      if (res.success) {
        fetchOwnerData();
      }
    }
  };

  // Manage booking status
  const handleBookingStatus = async (id, status) => {
    try {
      const res = await apiClient.put(`/bookings/${id}`, { status });
      if (res.data.success) {
        fetchOwnerData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status.');
    }
  };

  const ownerProperties = properties.filter((p) => p.ownerId?._id === user._id || p.ownerId === user._id);

  return (
    <div className="container py-5">
      {/* Analytics Widget Header */}
      <div className="row g-3 mb-5">
        <div className="col-12 col-md-4">
          <div className="p-4 rounded-4 shadow-sm border text-white" style={{ background: 'linear-gradient(135deg, #0d6efd, #0b5ed7)' }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-1 text-white-50 small">Total Listings</p>
                <h3 className="fw-extrabold mb-0">{analytics.totalListings} Properties</h3>
              </div>
              <div className="fs-1 opacity-50"><i className="bi bi-houses"></i></div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="p-4 rounded-4 shadow-sm border text-white" style={{ background: 'linear-gradient(135deg, #198754, #157347)' }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-1 text-white-50 small">Active Rent Revenue</p>
                <h3 className="fw-extrabold mb-0">₹{analytics.activeRent.toLocaleString('en-IN')}/mo</h3>
              </div>
              <div className="fs-1 opacity-50"><i className="bi bi-wallet2"></i></div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="p-4 rounded-4 shadow-sm border text-white" style={{ background: 'linear-gradient(135deg, #fd7e14, #e6700f)' }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-1 text-white-50 small">Pending Requests</p>
                <h3 className="fw-extrabold mb-0">{analytics.pendingRequests} Inquiries</h3>
              </div>
              <div className="fs-1 opacity-50"><i className="bi bi-bell"></i></div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Navigation Sidebar */}
        <div className="col-12 col-lg-3">
          <div
            className="p-3 shadow-sm"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
            }}
          >
            <div className="list-group list-group-flush gap-1">
              <button
                onClick={() => setActiveTab('properties')}
                className={`list-group-item list-group-item-action border-0 rounded-3 py-3 px-3 fw-semibold ${
                  activeTab === 'properties' ? 'active bg-primary text-white' : ''
                }`}
                style={{ background: activeTab === 'properties' ? '' : 'transparent', color: activeTab === 'properties' ? '' : 'var(--text-primary)' }}
              >
                <i className="bi bi-house-gear me-2"></i> Manage Listings
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`list-group-item list-group-item-action border-0 rounded-3 py-3 px-3 fw-semibold ${
                  activeTab === 'bookings' ? 'active bg-primary text-white' : ''
                }`}
                style={{ background: activeTab === 'bookings' ? '' : 'transparent', color: activeTab === 'bookings' ? '' : 'var(--text-primary)' }}
              >
                <i className="bi bi-envelope-open me-2"></i> Tenants Bookings ({analytics.pendingRequests})
              </button>
            </div>
          </div>
        </div>

        {/* Contents grid */}
        <div className="col-12 col-lg-9">
          <div
            className="p-4 shadow-sm"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              minHeight: '450px',
            }}
          >
            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Your Properties</h4>
                  <button onClick={handleOpenAdd} className="btn btn-primary-custom">
                    <i className="bi bi-plus-lg me-1"></i> Add Property
                  </button>
                </div>

                <div className="d-flex flex-column gap-3">
                  {ownerProperties.map((prop) => {
                    const img =
                      prop.images && prop.images.length > 0
                        ? prop.images[0].startsWith('http')
                          ? prop.images[0]
                          : `http://localhost:5000${prop.images[0]}`
                        : '';
                    return (
                      <div
                        key={prop._id}
                        className="p-3 border rounded-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
                        style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={img}
                            alt={prop.title}
                            className="rounded"
                            style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                          />
                          <div>
                            <h6 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{prop.title}</h6>
                            <p className="text-muted small mb-0">
                              Rent: <strong>₹{prop.rent.toLocaleString('en-IN')}</strong> | Type: <strong>{prop.propertyType}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="d-flex gap-2 justify-content-end align-items-center">
                          <span
                            className={`badge px-3 py-2 text-uppercase me-2 ${
                              prop.status === 'available'
                                ? 'bg-success text-white'
                                : prop.status === 'rented'
                                ? 'bg-danger text-white'
                                : 'bg-warning text-dark'
                            }`}
                            style={{ borderRadius: '20px' }}
                          >
                            {prop.status}
                          </span>
                          <button onClick={() => handleOpenEdit(prop)} className="btn btn-sm btn-outline-secondary" title="Edit">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button onClick={() => handleDeleteClick(prop._id)} className="btn btn-sm btn-outline-danger" title="Delete">
                            <i className="bi bi-trash"></i>
                          </button>
                          <Link to={`/properties/${prop._id}`} className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-eye"></i>
                          </Link>
                        </div>
                      </div>
                    );
                  })}

                  {ownerProperties.length === 0 && (
                    <p className="text-secondary small text-center my-4">You have not listed any properties yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                <h4 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Tenant Booking Requests</h4>

                {bookingsLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status"></div>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {bookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="p-3 border rounded-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
                        style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                      >
                        <div>
                          <h6 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                            {booking.propertyId?.title || 'Unknown Property'}
                          </h6>
                          <p className="small text-muted mb-2">
                            From: <strong>{booking.tenantId?.name}</strong> ({booking.tenantId?.phone})
                          </p>
                          <blockquote className="small text-secondary mb-0 bg-light p-2 rounded italic">
                            "{booking.message}"
                          </blockquote>
                        </div>

                        <div className="text-md-end shrink-0">
                          {booking.status === 'pending' ? (
                            <div className="d-flex gap-2">
                              <button onClick={() => handleBookingStatus(booking._id, 'approved')} className="btn btn-sm btn-success">
                                Approve
                              </button>
                              <button onClick={() => handleBookingStatus(booking._id, 'rejected')} className="btn btn-sm btn-danger">
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`badge px-3 py-2 text-uppercase ${
                                booking.status === 'approved' ? 'bg-success text-white' : 'bg-danger text-white'
                              }`}
                              style={{ borderRadius: '20px' }}
                            >
                              {booking.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {bookings.length === 0 && (
                      <p className="text-secondary small text-center my-4">No booking requests received yet.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Property Modal */}
      {showModal && (
        <div className="modal show d-block fade-in" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1100, overflowY: 'auto' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 p-3" style={{ background: 'var(--bg-secondary)', borderRadius: '20px' }}>
              <div className="modal-header border-0 d-flex justify-content-between align-items-center">
                <h4 className="modal-title fw-bold" style={{ color: 'var(--text-primary)' }}>
                  {isEdit ? 'Edit Property Details' : 'List New Property'}
                </h4>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger py-2 small">{formError}</div>}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="e.g. Luxury 3 BHK Sea View Villa"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows="3"
                      placeholder="Details about building, view, proximity to roads/hospitals..."
                    ></textarea>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6 col-sm-3">
                      <label className="form-label small fw-semibold">Rent (₹/mo)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={rent}
                        onChange={(e) => setRent(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6 col-sm-3">
                      <label className="form-label small fw-semibold">Deposit (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={deposit}
                        onChange={(e) => setDeposit(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6 col-sm-3">
                      <label className="form-label small fw-semibold">Property Type</label>
                      <select className="form-select" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                        <option value="Apartment">Apartment</option>
                        <option value="Villa">Villa</option>
                        <option value="Independent House">Independent House</option>
                        <option value="PG">PG</option>
                      </select>
                    </div>
                    <div className="col-6 col-sm-3">
                      <label className="form-label small fw-semibold">Area (Sqft)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-4">
                      <label className="form-label small fw-semibold">Bedrooms</label>
                      <input
                        type="number"
                        className="form-control"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold">Bathrooms</label>
                      <input
                        type="number"
                        className="form-control"
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold">Pincode</label>
                      <input
                        type="text"
                        className="form-control"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Amenities (Comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={amenities}
                      onChange={(e) => setAmenities(e.target.value)}
                      placeholder="e.g. WiFi, Air Conditioning, Gym, Power Backup"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Upload Images (Maximum 5 images)</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => setImages(e.target.files)}
                      multiple
                      accept="image/*"
                      required={!isEdit} // Required only when creating
                    />
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-secondary-custom" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={formLoading} className="btn btn-primary-custom px-4">
                    {formLoading ? 'Saving...' : 'Save Property'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
