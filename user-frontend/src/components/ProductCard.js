import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-card" onClick={handleClick}>
      <div className="product-image">
        <img src={`/images/${product.icon}`} alt={product.name} />
      </div>
      <div className="product-body">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-subtitle">{product.subtitle}</p>
        <p className="product-description">{product.description}</p>
        <div className="product-features">
          {product.features.map((feature, index) => (
            <span key={index} className="feature-tag">{feature}</span>
          ))}
        </div>
        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <span className="product-rating">{'★'.repeat(product.rating)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
