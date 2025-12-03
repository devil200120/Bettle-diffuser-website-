import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useRegion } from '../context/RegionContext';
import Footer from '../components/Footer';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, showSuccessMessage } = useCart();
  const { getCartPrice, isIndia, currencySymbol, loading: regionLoading } = useRegion();

  // Calculate totals based on region
  const calculateTotals = () => {
    let subtotal = 0;
    
    cart.forEach(item => {
      const priceInfo = getCartPrice(
        { price: item.price, internationalPrice: item.internationalPrice },
        item.quantity
      );
      subtotal += priceInfo.totalPrice;
    });
    
    // No tax for international, 18% GST for India
    const taxRate = isIndia ? 0.18 : 0;
    const tax = subtotal * taxRate;
    
    // Shipping: Free for India, $20 for international
    const shipping = subtotal > 0 ? (isIndia ? 0 : 20) : 0;
    
    const total = subtotal + tax + shipping;
    
    return { subtotal, tax, shipping, total, taxRate };
  };

  const { subtotal, tax, shipping, total, taxRate } = calculateTotals();

  const formatPrice = (amount) => {
    return `${currencySymbol}${amount.toLocaleString(isIndia ? 'en-IN' : 'en-US')}`;
  };

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showSuccessMessage('Please login to proceed to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div>
        <div className="cart-container">
          <div className="cart-empty">
            <h2>Your cart is empty</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>
              Start shopping to add items to your cart
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <div className="cart-container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'white' }}>
          Shopping Cart
        </h1>
        
        {/* Region indicator */}
        {!regionLoading && (
          <div style={{ 
            backgroundColor: isIndia ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)', 
            padding: '0.75rem 1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            display: 'inline-block'
          }}>
            <span style={{ color: isIndia ? '#22c55e' : '#3b82f6' }}>
              {isIndia ? '🇮🇳 Shopping from India (INR)' : '🌍 International Customer (USD)'}
            </span>
          </div>
        )}
        
        <div className="cart-items">
          {cart.map((item) => {
            const itemPriceInfo = getCartPrice(
              { price: item.price, internationalPrice: item.internationalPrice },
              item.quantity
            );
            
            return (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img src={`/images/${item.icon}`} alt={item.name} />
                </div>
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  {item.size && <p className="cart-item-details">Size: {item.size}</p>}
                  <p className="cart-item-details">Quantity: {item.quantity}</p>
                  {item.cameraModel && (
                    <p className="cart-item-details">
                      <span style={{ color: 'white' }}>Camera:</span> {item.cameraModel}
                    </p>
                  )}
                  {item.lensModel && (
                    <p className="cart-item-details">
                      <span style={{ color: 'white' }}>Lens:</span> {item.lensModel}
                    </p>
                  )}
                  {item.flashModel && (
                    <p className="cart-item-details">
                      <span style={{ color: 'white' }}>Flash:</span> {item.flashModel}
                    </p>
                  )}
                  <p className="cart-item-price">{itemPriceInfo.formatted}</p>
                  {itemPriceInfo.hasDiscount && (
                    <p style={{ color: '#22c55e', fontSize: '0.85rem' }}>
                      ✓ Bundle discount applied
                    </p>
                  )}
                </div>
                <div className="cart-item-actions">
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span className="summary-label">Subtotal:</span>
            <span className="summary-value">{formatPrice(subtotal)}</span>
          </div>
          {isIndia && (
            <div className="summary-row">
              <span className="summary-label">GST (18%):</span>
              <span className="summary-value">{formatPrice(tax)}</span>
            </div>
          )}
          <div className="summary-row">
            <span className="summary-label">Shipping:</span>
            <span className="summary-value">
              {shipping === 0 ? 'FREE' : formatPrice(shipping)}
            </span>
          </div>
          <div className="summary-row" style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem', marginTop: '1rem' }}>
            <span className="summary-label" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Total:</span>
            <span className="summary-value" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'red' }}>
              {formatPrice(total)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleCheckout} style={{ flex: 1 }}>
              Proceed to Checkout
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ flex: 1 }}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
