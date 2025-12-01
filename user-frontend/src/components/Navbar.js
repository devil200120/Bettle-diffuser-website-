import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/#products', label: 'Shop All' },
    { path: '/assembly-videos', label: 'Assembly videos' },
    { path: '/faq', label: 'FAQs' },
    { path: '/testimonial', label: 'Testimonial' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact Us' },
    { path: '/gallery', label: 'Gallery' },
  ];

  const handleNavClick = (path) => {
    setMenuOpen(false);
    if (path === '/#products') {
      if (location.pathname === '/') {
        const productsSection = document.getElementById('productsSection');
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        navigate('/');
        setTimeout(() => {
          const productsSection = document.getElementById('productsSection');
          if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  };

  const isActive = (path) => {
    if (path === '/#products') return false;
    return location.pathname === path;
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          BEETLE DIFFUSER
        </Link>
        
        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`} ref={menuRef}>
          {navLinks.map((link) => (
            <li key={link.path}>
              {link.path === '/#products' ? (
                <span
                  className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                  onClick={() => handleNavClick(link.path)}
                  style={{ cursor: 'pointer' }}
                >
                  {link.label}
                </span>
              ) : (
                <Link
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                  onClick={() => handleNavClick(link.path)}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <Link to="/cart" className="cart-icon" onClick={() => setMenuOpen(false)}>
            <span style={{ fontSize: '1.5rem' }}>🛒</span>
            <span className="cart-badge">{getCartCount()}</span>
          </Link>
          
          <div
            className={`hamburger ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            ref={hamburgerRef}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
