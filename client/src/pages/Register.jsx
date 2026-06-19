import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { register, user, error: authError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('tenant');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'owner') navigate('/owner');
      else navigate('/tenant');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !phone || !password || !role) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const res = await register({ name, email, phone, password, role });
    setLoading(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="col-12 col-md-6 col-lg-5">
        <div
          className="p-4 shadow-lg"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
          }}
        >
          <div className="text-center mb-4">
            <h3 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Create Account</h3>
            <p className="text-secondary small">Join RentalHouse to rent or host luxury properties</p>
          </div>

          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          {authError && !error && <div className="alert alert-danger py-2 small">{authError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
            </div>

            <div className="row mb-3">
              <div className="col-12 col-sm-6">
                <label className="form-label small fw-semibold" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                />
              </div>
              <div className="col-12 col-sm-6 mt-3 mt-sm-0">
                <label className="form-label small fw-semibold" style={{ color: 'var(--text-secondary)' }}>Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91..."
                  required
                  style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold d-block" style={{ color: 'var(--text-secondary)' }}>I want to join as a:</label>
              <div className="d-flex gap-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    id="roleTenant"
                    value="tenant"
                    checked={role === 'tenant'}
                    onChange={() => setRole('tenant')}
                  />
                  <label className="form-check-label small" htmlFor="roleTenant">
                    Tenant (Search & Rent homes)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    id="roleOwner"
                    value="owner"
                    checked={role === 'owner'}
                    onChange={() => setRole('owner')}
                  />
                  <label className="form-check-label small" htmlFor="roleOwner">
                    Owner (Host properties)
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary-custom w-100 py-2">
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : null}
              Create Account
            </button>
          </form>

          <p className="text-center small mt-4 mb-0 text-muted">
            Already have an account?{' '}
            <Link to="/login" className="fw-semibold text-decoration-none">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
