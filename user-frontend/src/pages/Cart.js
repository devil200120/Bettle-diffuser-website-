import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Footer from '../components/Footer';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, showSuccessMessage } = useCart();

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + tax + shipping;

  const handleCheckout = () => {
    showSuccessMessage('Checkout functionality coming soon!');
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
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--accent-yellow)' }}>
          Shopping Cart
        </h1>
        
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                <img src={`/images/${item.icon}`} alt={item.name} />
              </div>
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                {item.size && <p className="cart-item-details">Size: {item.size}</p>}
                <p className="cart-item-details">Quantity: {item.quantity}</p>
                <p className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
              <div className="cart-item-actions">
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span className="summary-label">Subtotal:</span>
            <span className="summary-value">${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Tax (10%):</span>
            <span className="summary-value">${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Shipping:</span>
            <span className="summary-value">${shipping.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Total:</span>
            <span className="summary-value">${total.toFixed(2)}</span>
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
