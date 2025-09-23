import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../api/auth';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/dashboard" className="brand-link">
            🍎 FoodTracker
          </Link>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="navbar-nav">
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              📊 Dashboard
            </Link>
            <Link 
              to="/add-food" 
              className={`nav-link ${isActive('/add-food') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              ➕ Add Food
            </Link>
          </div>
          
          <div className="navbar-actions">
            <button 
              onClick={handleLogout}
              className="logout-button"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        <div className="navbar-toggle" onClick={toggleMenu}>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;









