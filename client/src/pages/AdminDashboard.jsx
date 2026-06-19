import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  // States
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch dashboard analytics
      const statsRes = await apiClient.get('/admin/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      // 2. Fetch users lists
      const usersRes = await apiClient.get('/admin/users');
      if (usersRes.data.success) {
        setUsersList(usersRes.data.data);
      }

      // 3. Fetch properties list
      // Note: Admin gets all properties by calling general properties API with status filter bypassed
      const propertiesRes = await apiClient.get('/properties?status=all');
      if (propertiesRes.data.success) {
        setPropertiesList(propertiesRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle user blocked status
  const handleBlockToggle = async (userId) => {
    if (window.confirm('Are you sure you want to change the block status for this user?')) {
      try {
        const res = await apiClient.put(`/admin/users/${userId}/block`);
        if (res.data.success) {
          fetchAdminData(); // Refresh list
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Error updating block status.');
      }
    }
  };

  // Delete property listing
  const handlePropertyDelete = async (propId) => {
    if (window.confirm('Are you sure you want to permanently delete this property listing? This action is irreversible.')) {
      try {
        const res = await apiClient.delete(`/properties/${propId}`);
        if (res.data.success) {
          fetchAdminData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting property.');
      }
    }
  };

  // Change property status
  const handlePropertyStatus = async (propId, status) => {
    try {
      const res = await apiClient.put(`/admin/properties/${propId}/status`, { status });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error changing property status.');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading administrator dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Title */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
            System Administration
          </h2>
          <p className="text-secondary small">Oversee users, properties listing validations, and platform metrics.</p>
        </div>
        <span className="badge bg-danger text-uppercase px-3 py-2" style={{ borderRadius: '20px' }}>
          Admin Portal
        </span>
      </div>

      {/* Tabs */}
      <div className="row g-4">
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
                onClick={() => setActiveTab('analytics')}
                className={`list-group-item list-group-item-action border-0 rounded-3 py-3 px-3 fw-semibold ${
                  activeTab === 'analytics' ? 'active bg-primary text-white' : ''
                }`}
                style={{ background: activeTab === 'analytics' ? '' : 'transparent', color: activeTab === 'analytics' ? '' : 'var(--text-primary)' }}
              >
                <i className="bi bi-graph-up-arrow me-2"></i> Analytics Summary
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`list-group-item list-group-item-action border-0 rounded-3 py-3 px-3 fw-semibold ${
                  activeTab === 'users' ? 'active bg-primary text-white' : ''
                }`}
                style={{ background: activeTab === 'users' ? '' : 'transparent', color: activeTab === 'users' ? '' : 'var(--text-primary)' }}
              >
                <i className="bi bi-people me-2"></i> Users Management ({usersList.length})
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`list-group-item list-group-item-action border-0 rounded-3 py-3 px-3 fw-semibold ${
                  activeTab === 'properties' ? 'active bg-primary text-white' : ''
                }`}
                style={{ background: activeTab === 'properties' ? '' : 'transparent', color: activeTab === 'properties' ? '' : 'var(--text-primary)' }}
              >
                <i className="bi bi-houses me-2"></i> Listings Audit ({propertiesList.length})
              </button>
            </div>
          </div>
        </div>

        {/* Contents */}
        <div className="col-12 col-lg-9">
          <div
            className="p-4 shadow-sm"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              minHeight: '400px',
            }}
          >
            {/* Analytics Tab */}
            {activeTab === 'analytics' && stats && (
              <div>
                <h4 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Performance Charts Metrics</h4>
                <div className="row g-3 mb-4">
                  <div className="col-6 col-sm-3">
                    <div className="p-3 rounded-4 bg-light text-center border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                      <h3 className="fw-bold text-primary mb-1">{stats.users.total}</h3>
                      <span className="small text-muted text-uppercase">Total Users</span>
                    </div>
                  </div>
                  <div className="col-6 col-sm-3">
                    <div className="p-3 rounded-4 bg-light text-center border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                      <h3 className="fw-bold text-success mb-1">{stats.properties.total}</h3>
                      <span className="small text-muted text-uppercase">Properties</span>
                    </div>
                  </div>
                  <div className="col-6 col-sm-3">
                    <div className="p-3 rounded-4 bg-light text-center border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                      <h3 className="fw-bold text-warning mb-1">{stats.bookings.total}</h3>
                      <span className="small text-muted text-uppercase">Bookings</span>
                    </div>
                  </div>
                  <div className="col-6 col-sm-3">
                    <div className="p-3 rounded-4 bg-light text-center border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                      <h3 className="fw-bold text-danger mb-1">₹{stats.revenue.toLocaleString('en-IN')}</h3>
                      <span className="small text-muted text-uppercase">Rents Potential</span>
                    </div>
                  </div>
                </div>

                <div className="row g-4">
                  {/* Users breakdown */}
                  <div className="col-12 col-md-6">
                    <div className="card p-3 border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                      <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Users Breakdown</h6>
                      <ul className="list-unstyled d-flex flex-column gap-2 mb-0 small">
                        <li className="d-flex justify-content-between">
                          <span>Tenants count:</span> <span className="fw-bold">{stats.users.tenants}</span>
                        </li>
                        <li className="d-flex justify-content-between">
                          <span>Owners count:</span> <span className="fw-bold">{stats.users.owners}</span>
                        </li>
                        <li className="d-flex justify-content-between">
                          <span>Admins count:</span> <span className="fw-bold">{stats.users.admins}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Properties breakdown */}
                  <div className="col-12 col-md-6">
                    <div className="card p-3 border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                      <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Listing Statuses</h6>
                      <ul className="list-unstyled d-flex flex-column gap-2 mb-0 small">
                        <li className="d-flex justify-content-between">
                          <span>Available:</span> <span className="fw-bold text-success">{stats.properties.available}</span>
                        </li>
                        <li className="d-flex justify-content-between">
                          <span>Rented:</span> <span className="fw-bold text-danger">{stats.properties.rented}</span>
                        </li>
                        <li className="d-flex justify-content-between">
                          <span>Pending audit:</span> <span className="fw-bold text-warning">{stats.properties.pending}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users list Tab */}
            {activeTab === 'users' && (
              <div>
                <h4 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Registered Users</h4>
                <div className="table-responsive">
                  <table className="table table-hover align-middle small" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((usr) => (
                        <tr key={usr._id}>
                          <td>{usr.name}</td>
                          <td>{usr.email}</td>
                          <td>{usr.phone}</td>
                          <td className="text-capitalize"><span className="badge bg-light text-dark border">{usr.role}</span></td>
                          <td>
                            <span className={`badge ${usr.isBlocked ? 'bg-danger text-white' : 'bg-success text-white'}`}>
                              {usr.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td>
                            {usr._id !== user._id ? (
                              <button
                                onClick={() => handleBlockToggle(usr._id)}
                                className={`btn btn-sm ${usr.isBlocked ? 'btn-success' : 'btn-outline-danger'}`}
                                style={{ borderRadius: '6px' }}
                              >
                                {usr.isBlocked ? 'Unblock' : 'Block'}
                              </button>
                            ) : (
                              <span className="text-muted italic small">Logged In</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Properties Audit Tab */}
            {activeTab === 'properties' && (
              <div>
                <h4 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Properties Listings Audit</h4>
                <div className="table-responsive">
                  <table className="table table-hover align-middle small" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>City</th>
                        <th>Rent</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertiesList.map((prop) => (
                        <tr key={prop._id}>
                          <td className="fw-bold">{prop.title}</td>
                          <td>{prop.city}</td>
                          <td>₹{prop.rent.toLocaleString('en-IN')}</td>
                          <td>
                            <select
                              value={prop.status}
                              onChange={(e) => handlePropertyStatus(prop._id, e.target.value)}
                              className="form-select form-select-sm"
                              style={{ width: '110px' }}
                            >
                              <option value="available">Available</option>
                              <option value="rented">Rented</option>
                              <option value="pending">Pending</option>
                            </select>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                onClick={() => handlePropertyDelete(prop._id)}
                                className="btn btn-sm btn-outline-danger"
                                style={{ borderRadius: '6px' }}
                                title="Delete Listing"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
