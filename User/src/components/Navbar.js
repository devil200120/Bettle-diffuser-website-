import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const { getCartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Check for logged in user
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Listen for storage changes (login/logout from other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUserDropdown(false);
    setMenuOpen(false);
    navigate('/');
  };

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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setUserDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  return (
    <nav className="bg-gradient-to-r from-zinc-900 to-zinc-800 fixed top-0 left-0 right-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-xl sm:text-2xl font-bold tracking-wider flex-shrink-0"
            style={{ color: 'red' }}
            onClick={() => setMenuOpen(false)}
          >
            BEETLE DIFFUSER
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <li key={link.path}>
                {link.path === '/#products' ? (
                  <span
                    className={`text-white hover:text-yellow-400 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${isActive(link.path) ? 'text-yellow-400' : ''}`}
                    onClick={() => handleNavClick(link.path)}
                  >
                    {link.label}
                  </span>
                ) : (
                  <Link
                    to={link.path}
                    className={`text-white hover:text-yellow-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path) ? 'text-yellow-400' : ''}`}
                    onClick={() => handleNavClick(link.path)}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Right Side - Cart, User, Hamburger */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop User Menu */}
            {user ? (
              <div className="hidden lg:block relative" ref={dropdownRef}>
                <button 
                  className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-900 px-4 py-2 rounded-full font-semibold text-sm transition-colors"
                  onClick={() => setUserDropdown(!userDropdown)}
                >
                  <span>👤</span>
                  {user.name?.split(' ')[0]}
                </button>
                {userDropdown && (
                  <div className="absolute top-full right-0 mt-2 bg-zinc-800 rounded-xl shadow-xl py-2 min-w-[160px] border border-zinc-700">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2.5 text-white hover:bg-zinc-700 transition-colors"
                      onClick={() => setUserDropdown(false)}
                    >
                      My Profile
                    </Link>
                    <Link 
                      to="/orders" 
                      className="block px-4 py-2.5 text-white hover:bg-zinc-700 transition-colors"
                      onClick={() => setUserDropdown(false)}
                    >
                      My Orders
                    </Link>
                    <Link 
                      to="/analytics" 
                      className="block px-4 py-2.5 text-white hover:bg-zinc-700 transition-colors"
                      onClick={() => setUserDropdown(false)}
                    >
                      My Analytics
                    </Link>
                    <Link 
                      to="/track-order" 
                      className="block px-4 py-2.5 text-white hover:bg-zinc-700 transition-colors"
                      onClick={() => setUserDropdown(false)}
                    >
                      Track Order
                    </Link>
                    <button 
                      className="block w-full text-left px-4 py-2.5 text-red-400 hover:bg-zinc-700 transition-colors"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login" 
                className="hidden lg:flex items-center gap-1 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-zinc-900 px-4 py-2 rounded-full font-semibold text-sm transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <span>👤</span>
                Login
              </Link>
            )}

            {/* Cart Icon */}
            <Link 
              to="/cart" 
              className="relative p-2 hover:scale-110 transition-transform"
              onClick={() => setMenuOpen(false)}
            >
              <span className="text-2xl">🛒</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {getCartCount()}
              </span>
            </Link>

            {/* Hamburger Menu Button */}
            <button
              className={`lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-zinc-700 transition-colors ${menuOpen ? 'bg-zinc-700' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              ref={hamburgerRef}
              aria-label="Toggle menu"
            >
              <span className={`block w-6 h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white rounded my-1.5 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        style={{ top: '70px' }}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <div 
        ref={menuRef}
        className={`lg:hidden fixed left-0 right-0 bg-zinc-900 border-t border-zinc-700 transition-all duration-300 ease-in-out overflow-y-auto ${menuOpen ? 'max-h-[calc(100vh-70px)] opacity-100' : 'max-h-0 opacity-0'}`}
        style={{ top: '70px' }}
      >
        <div className="px-4 py-4 space-y-1">
          {/* Navigation Links */}
          {navLinks.map((link) => (
            <div key={link.path}>
              {link.path === '/#products' ? (
                <span
                  className={`block w-full text-left px-4 py-3 text-white text-base font-medium rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer ${isActive(link.path) ? 'bg-zinc-800 text-yellow-400' : ''}`}
                  onClick={() => handleNavClick(link.path)}
                >
                  {link.label}
                </span>
              ) : (
                <Link
                  to={link.path}
                  className={`block px-4 py-3 text-white text-base font-medium rounded-lg hover:bg-zinc-800 transition-colors ${isActive(link.path) ? 'bg-zinc-800 text-yellow-400' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}

          {/* Divider */}
          <div className="border-t border-zinc-700 my-4"></div>

          {/* User Section */}
          {user ? (
            <div className="space-y-1">
              <p className="px-4 py-2 text-zinc-400 text-sm font-medium uppercase tracking-wider">
                Account
              </p>
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 text-white text-base font-medium rounded-lg hover:bg-zinc-800 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <span className="text-xl">👤</span>
                My Profile
              </Link>
              <Link
                to="/orders"
                className="flex items-center gap-3 px-4 py-3 text-white text-base font-medium rounded-lg hover:bg-zinc-800 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <span className="text-xl">📦</span>
                My Orders
              </Link>
              <Link
                to="/analytics"
                className="flex items-center gap-3 px-4 py-3 text-white text-base font-medium rounded-lg hover:bg-zinc-800 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <span className="text-xl">📊</span>
                My Analytics
              </Link>
              <Link
                to="/track-order"
                className="flex items-center gap-3 px-4 py-3 text-white text-base font-medium rounded-lg hover:bg-zinc-800 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <span className="text-xl">🚚</span>
                Track Order
              </Link>
              <button
                className="flex items-center gap-3 w-full px-4 py-3 text-red-400 text-base font-medium rounded-lg hover:bg-zinc-800 transition-colors text-left"
                onClick={handleLogout}
              >
                <span className="text-xl">🚪</span>
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-zinc-900 text-base font-semibold rounded-lg transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <span className="text-xl">👤</span>
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-zinc-900 text-base font-semibold rounded-lg transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <span className="text-xl">✨</span>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
