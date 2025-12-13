import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Beetle Diffuser</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Professional macro photography equipment for demanding photographers worldwide.
          </p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/#products">Shop</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/faq">FAQs</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        {/* <div className="footer-section">
          <h3>Support</h3>
          <ul className="footer-links">
            <li><Link to="/faq">Shipping Info</Link></li>
            <li><Link to="/faq">Returns</Link></li>
            <li><Link to="/faq">Warranty</Link></li>
          </ul>
        </div> */}
        <div className="footer-section">
          <h3>Account</h3>
          <ul className="footer-links">
            <li><Link to="/cart">My Orders</Link></li>
            {/* <li><Link to="/">Wishlist</Link></li> */}
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms-and-conditions">Terms &amp; Conditions</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Beetle Diffuser. All rights reserved. Innovation in Macro Photography.</p>
      </div>
    </footer>
  );
};

export default Footer;
