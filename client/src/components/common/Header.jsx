import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    await logout();
    navigate('/');
  };

  // Determine dashboard link based on role
  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'owner') return '/owner';
    return '/tenant';
  };

  return (
    <header className="glass-header">
      <nav className="navbar navbar-expand-lg py-3">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center fs-3 fw-extrabold" to="/" style={{ color: 'var(--text-primary)' }}>
            <i className="bi bi-house-heart-fill text-primary me-2"></i>
            <span className="fw-bold">Rental</span>
            <span className="text-primary fw-light">House</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#rentalHouseNav"
            aria-controls="rentalHouseNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <span className="navbar-toggler-icon" style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }}></span>
          </button>

          <div className="collapse navbar-collapse" id="rentalHouseNav">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1 gap-lg-3">
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link fw-semibold px-2 px-lg-3 py-2 ${isActive ? 'text-primary' : ''}`
                  }
                  to="/"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link fw-semibold px-2 px-lg-3 py-2 ${isActive ? 'text-primary' : ''}`
                  }
                  to="/properties"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Properties
                </NavLink>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-3">
              {/* Theme Toggle Icon */}
              <button
                onClick={toggleTheme}
                className="btn btn-link py-1 px-2 border-0"
                style={{ color: 'var(--text-primary)', fontSize: '1.25rem' }}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <i className="bi bi-moon-stars-fill"></i>
                ) : (
                  <i className="bi bi-sun-fill text-warning"></i>
                )}
              </button>

              {user ? (
                <div className="dropdown">
                  <button
                    className="btn btn-outline-primary d-flex align-items-center gap-2 dropdown-toggle py-2 px-3 fw-semibold"
                    type="button"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ borderRadius: '10px' }}
                  >
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="rounded-circle"
                        style={{ width: '24px', height: '24px', objectFit: 'cover' }}
                      />
                    ) : (
                      <i className="bi bi-person-circle"></i>
                    )}
                    <span>{user.name.split(' ')[0]}</span>
                  </button>
                  <ul
                    className="dropdown-menu dropdown-menu-end shadow-lg py-2 mt-2"
                    aria-labelledby="userDropdown"
                    style={{
                      borderRadius: '12px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <li>
                      <Link
                        className="dropdown-item py-2 px-3 d-flex align-items-center gap-2"
                        to={getDashboardLink()}
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <i className="bi bi-speedometer2 text-primary"></i> Dashboard
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" style={{ borderColor: 'var(--border-color)' }} />
                    </li>
                    <li>
                      <button
                        className="dropdown-item py-2 px-3 d-flex align-items-center gap-2 text-danger"
                        onClick={handleLogoutClick}
                      >
                        <i className="bi bi-box-arrow-right"></i> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Link to="/login" className="btn btn-link fw-semibold text-decoration-none" style={{ color: 'var(--text-primary)' }}>
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-primary-custom">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
