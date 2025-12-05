import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegion } from "../context/RegionContext";

// Fallback placeholder images from local images folder
const fallbackImages = [
  '/images/Pro Grey Background.jpg',
  '/images/Lite grey background.jpg',
  '/images/Twin Grrey Background.jpg',
  '/images/Pro White Background.jpg',
  '/images/Beetle Lite White Background.jpg',
  '/images/Twin Beetle Diffusers White Background.jpg',
];

const getRandomFallback = () => {
  return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { getDisplayPrice, isIndia, loading: regionLoading } = useRegion();
  const [imgSrc, setImgSrc] = useState(
    product.icon ? `/images/${product.icon}` : getRandomFallback()
  );
  const [hasError, setHasError] = useState(false);

  // Get region-based price
  const priceInfo = getDisplayPrice(product);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(getRandomFallback());
    }
  };

  const handleOrderNow = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img 
          src={imgSrc} 
          alt={product.name} 
          onError={handleImageError}
        />
      </div>
      <div className="product-body text-center">
        <h3 className="product-title">{product.name}</h3>
        <div className="product-features justify-center">
          {product.features.map((feature, index) => (
            <span key={index} className="feature-tag">
              {feature}
            </span>
          ))}
        </div>
        <div className="product-footer justify-center">
          <span className="product-price">
            {regionLoading ? '...' : priceInfo.formatted}
          </span>
        </div>
        {!isIndia && !priceInfo.needsIntlPricing && product.internationalPrice?.double > 0 && (
          <p className="text-xs text-center text-green-400 mt-1">
            Buy 2 or more to save more 
          </p>
        )}
        <div className="product-buy">
          <button className="order-now-btn" onClick={handleOrderNow}>Order Now</button>
        </div>
        <p>(Inclusive of Free shipping*)</p>
      </div>
    </div>
  );
};

export default ProductCard;
