import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showSpecs, setShowSpecs] = useState(false);

  useEffect(() => {
    const foundProduct = products.find(p => p.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedSize(foundProduct.sizes ? foundProduct.sizes[0] : null);
    }
    window.scrollTo(0, 0);
  }, [id]);

  const updateQuantity = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      productId: product.id,
      name: product.name,
      icon: product.icon,
      price: product.price,
      quantity: quantity,
      size: selectedSize
    });
    setQuantity(1);
  };

  if (!product) {
    return (
      <div className="product-details">
        <p>Product not found</p>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          ← Back to Products
        </button>
      </div>
    );
  }

  if (showSpecs) {
    return (
      <div className="product-details">
        <button className="btn btn-secondary" onClick={() => setShowSpecs(false)} style={{ marginBottom: '2rem' }}>
          ← Back to Product
        </button>
        
        <div className="product-details-grid">
          <div className="product-details-image">
            <img src={`/images/${product.icon}`} alt={product.name} />
          </div>
          
          <div className="product-details-info">
            <h1>{product.name}</h1>
            <p className="product-subtitle">{product.subtitle}</p>
            <span className="product-price">${product.price.toFixed(2)}</span>
            
            {product.sizes && (
              <div className="product-options" style={{ marginTop: '2rem' }}>
                <label>Select Size:</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  {product.sizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="quantity-selector">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--accent-yellow)' }}>
                Quantity:
              </label>
              <div className="quantity-controls">
                <button className="quantity-btn" onClick={() => updateQuantity(-1)}>-</button>
                <span className="quantity-display">{quantity}</span>
                <button className="quantity-btn" onClick={() => updateQuantity(1)}>+</button>
              </div>
            </div>
            
            <div className="product-actions">
              <button className="btn btn-primary" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/')}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
        
        <div className="specifications-table">
          <h2>Technical Specifications</h2>
          {product.specifications.map((spec, index) => (
            <div key={index} className="spec-row">
              <div className="spec-label">•</div>
              <div className="spec-value">{spec}</div>
            </div>
          ))}
        </div>
        
        <div className="specifications-table">
          <h2>Compatibility</h2>
          {product.compatibility.map((comp, index) => (
            <div key={index} className="spec-row">
              <div className="spec-label">✓</div>
              <div className="spec-value">{comp}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="product-details">
      <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '2rem' }}>
        ← Back to Products
      </button>
      
      <div>
        <p style={{ backgroundColor: 'var(--dark-card)', color: 'white', padding: '1rem', borderRadius: '10px' }}>
          We collect your gear details during checkout to ensure we send the correct diffuser that fits your camera perfectly and is ideal for macro photography.
        </p>
      </div>
      
      <div className="product-details-grid">
        <div className="product-details-image">
          <img src={`/images/${product.icon}`} alt={product.name} />
        </div>
        
        <div className="product-details-info">
          <h1>{product.name}</h1>
          <p className="product-subtitle">{product.subtitle}</p>
          <span className="product-price">${product.price.toFixed(2)}</span>
          <p className="product-description">{product.description}</p>
          
          {product.sizes && (
            <div className="product-options">
              <label>Select Size:</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                {product.sizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="quantity-selector">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--accent-yellow)' }}>
              Quantity:
            </label>
            <div className="quantity-controls">
              <button className="quantity-btn" onClick={() => updateQuantity(-1)}>-</button>
              <span className="quantity-display">{quantity}</span>
              <button className="quantity-btn" onClick={() => updateQuantity(1)}>+</button>
            </div>
          </div>
          
          <div className="product-actions">
            <button className="btn btn-primary" onClick={() => setShowSpecs(true)}>
              View Specifications
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
      
      <div className="specifications-table">
        <h2>Features</h2>
        {product.features.map((feature, index) => (
          <div key={index} className="spec-row">
            <div className="spec-label">✓</div>
            <div className="spec-value">{feature}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetails;
