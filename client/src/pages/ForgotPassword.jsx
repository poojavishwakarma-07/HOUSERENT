import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await apiClient.post('/auth/forgotpassword', { email });
      if (res.data.success) {
        setMessage(res.data.message || 'Reset link sent! Please check your email inbox.');
        setEmail('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error requesting password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="col-12 col-md-6 col-lg-4">
        <div
          className="p-4 shadow-lg"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
          }}
        >
          <div className="text-center mb-4">
            <h3 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Forgot Password</h3>
            <p className="text-secondary small">Enter your email and we'll send a password recovery link</p>
          </div>

          {message && <div className="alert alert-success py-2 small">{message}</div>}
          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
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

            <button type="submit" disabled={loading} className="btn btn-primary-custom w-100 py-2">
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : null}
              Send Recovery Link
            </button>
          </form>

          <p className="text-center small mt-4 mb-0 text-muted">
            Back to{' '}
            <Link to="/login" className="fw-semibold text-decoration-none">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
