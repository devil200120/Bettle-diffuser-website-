import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { products as staticProducts } from "../data/products";
import { useCart } from "../context/CartContext";
import { useRegion } from "../context/RegionContext";
import { useToast } from "../components/Toast";
// import ProductForm from "../components/ProductForm";

const API_URL = 'http://localhost:5001/api';

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

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { getCartPrice, isIndia, currencySymbol, loading: regionLoading } = useRegion();
  const { showWarning, showSuccess } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cameraModel, setCameraModel] = useState(null);
  const [lensModel, setLensModel] = useState(null);
  const [flashModel, setFlashModel] = useState(null);
  // const [product, setProduct] = useState(null);

  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showSpecs, setShowSpecs] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [imgError, setImgError] = useState(false);

  const isLoggedIn = () => {
    return !!localStorage.getItem('token');
  };

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(getRandomFallback());
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/products/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          // Transform backend data to match frontend structure
          const transformedProduct = {
            id: data._id,
            name: data.name,
            subtitle: data.subtitle || '',
            description: data.description,
            icon: data.icon,
            price: data.price,
            internationalPrice: data.internationalPrice || { single: 0, double: 0 },
            rating: data.rating || 5,
            features: data.features || [],
            specifications: data.specifications || [],
            compatibility: data.compatibility || [],
            sizes: data.sizes || [],
            variant: data.variant || [],
            footer: data.footer || '',
            loader: data.loader || [],
            info: data.info || []
          };
          setProduct(transformedProduct);
          setSelectedSize(transformedProduct.sizes ? transformedProduct.sizes[0] : null);
          setImgSrc(transformedProduct.icon ? `/images/${transformedProduct.icon}` : getRandomFallback());
          setImgError(false);
        } else {
          // Fallback to static products
          const foundProduct = staticProducts.find((p) => p.id === parseInt(id));
          if (foundProduct) {
            setProduct(foundProduct);
            setSelectedSize(foundProduct.sizes ? foundProduct.sizes[0] : null);
            setImgSrc(foundProduct.icon ? `/images/${foundProduct.icon}` : getRandomFallback());
            setImgError(false);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        // Fallback to static products
        const foundProduct = staticProducts.find((p) => p.id === parseInt(id));
        if (foundProduct) {
          setProduct(foundProduct);
          setSelectedSize(foundProduct.sizes ? foundProduct.sizes[0] : null);
          setImgSrc(foundProduct.icon ? `/images/${foundProduct.icon}` : getRandomFallback());
          setImgError(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const updateQuantity = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!isLoggedIn()) {
      showWarning('Please login to add items to cart');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      return;
    }
    
    if (!product) return;

    // Get region-based price
    const priceInfo = getCartPrice(product, parseInt(quantity) || 1);

    addToCart({
      productId: product.id,
      name: product.name,
      icon: product.icon,
      price: product.price,
      internationalPrice: product.internationalPrice,
      quantity: parseInt(quantity) || 1,
      size: selectedSize,
      cameraModel,
      lensModel,
      flashModel
    });
    showSuccess('Product added to cart!');
    setQuantity(1);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!isLoggedIn()) {
      showWarning('Please login to purchase items');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      return;
    }
    
    // Add to cart and navigate directly to checkout
    if (product) {
      addToCart({
        productId: product.id,
        name: product.name,
        icon: product.icon,
        price: product.price,
        internationalPrice: product.internationalPrice,
        quantity: parseInt(quantity) || 1,
        size: selectedSize,
        cameraModel,
        lensModel,
        flashModel
      });
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="product-details flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details">
        <p>Product not found</p>
        <button className="btn btn-secondary" onClick={() => navigate("/")}>
          ← Back to Products
        </button>
      </div>
    );
  } else {
  }

  if (showSpecs) {
    return (
      <div className="product-details">
        <button
          className="btn btn-secondary"
          onClick={() => setShowSpecs(false)}
          style={{ marginBottom: "2rem" }}
        >
          ← Back to Product
        </button>

        <div className="product-details-grid">
          <div className="product-details-image">
            <img src={imgSrc} alt={product.name} onError={handleImageError} />
          </div>

          <div className="product-details-info">
            <h1>{product.name}</h1>
            <p className="product-subtitle">{product.subtitle}</p>
            <span className="product-price">${product.price.toFixed(2)}</span>

            {product.sizes && (
              <div className="product-options" style={{ marginTop: "2rem" }}>
                <label>Select Size:</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  {product.sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="quantity-selector">
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  color: "var(--accent-yellow)",
                }}
              >
                Quantity:
              </label>
              <div className="quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={() => updateQuantity(-1)}
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => updateQuantity(1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="product-actions">
              <button className="btn btn-primary" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleBuyNow}
              >
                Buy Now
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
      <button
        className="btn btn-secondary"
        onClick={() => navigate("/")}
        style={{ marginBottom: "2rem", marginTop: "1rem" }}
      >
        ← Back to Products
      </button>

      <div>
        <p
          style={{
            backgroundColor: "var(--dark-card)",
            color: "white",
            padding: "1rem",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          We collect your gear details during checkout to ensure we send the
          correct diffuser that fits your camera perfectly and is ideal for
          macro photography.
        </p>
      </div>

      <div className="product-details-grid">
        <div className="product-details-image">
          <img src={imgSrc} alt={product.name} onError={handleImageError} />
          <button
            className="btn btn-primary"
            onClick={() => setShowSpecs(true)}
          >
            View Specifications
          </button>
        </div>
        {/* --------------------------------------- */}
        <form >
          <div className="product-form__grid">
            <div className="product-details-info">
              <h1>{product.name}</h1>
              <p className="product-subtitle">{product.subtitle}</p>
              {/* Region-based pricing */}
              {regionLoading ? (
                <span className="product-price">Loading price...</span>
              ) : (
                <>
                  <span className="product-price">
                    Price: {getCartPrice(product, parseInt(quantity) || 1).formatted}
                    {isIndia ? '' : ' USD'}
                  </span>
                  {!isIndia && product.internationalPrice?.double > 0 && parseInt(quantity) < 2 && (
                    <p className="text-sm text-green-500 mt-1">
                      💡 Buy 2 for ${product.internationalPrice.double} (Save ${(product.internationalPrice.single * 2) - product.internationalPrice.double}!)
                    </p>
                  )}
                  {!isIndia && parseInt(quantity) >= 2 && product.internationalPrice?.double > 0 && (
                    <p className="text-sm text-green-500 mt-1">
                      ✓ Bundle discount applied!
                    </p>
                  )}
                </>
              )}
              <p className="product-description">{product.description}</p>
            </div>

            {/* Camera model */}

            <div className="form-field">
              <label htmlFor="cameraModel" className="form-label">
                Provide your camera model <span className="required">*</span>
              </label>
              <p className="form-helper">
                Only provide information for one Camera model
              </p>
              <input
                id="cameraModel"
                name="cameraModel"
                type="text"
                inputMode="text"
                autoComplete="off"
                placeholder="Olympus OM-1, Canon EOS R5, Sony A7 IV, or Nikon Z7"
                // className={`form-input ${touched.cameraModel && errors.cameraModel ? "has-error" : ""}`}
                value={cameraModel}
                onChange={(e) => setCameraModel(e.target.value)}
                // onBlur={handleBlur}
                // aria-invalid={Boolean(touched.cameraModel && errors.cameraModel)}
                // aria-describedby="cameraModel-error cameraModel-help"
              />
              {/* <p id="cameraModel-help" className="sr-only">
              Enter exactly one camera model.
            </p> */}
              {/* {touched.cameraModel && errors.cameraModel && (
              <p id="cameraModel-error" className="form-error">
                {errors.cameraModel}
              </p>
            )} */}
            </div>

            {/* Lens model */}
            <div className="form-field">
              <label htmlFor="lensModel" className="form-label">
                Provide your lens make & model{" "}
                <span className="required">*</span>
              </label>
              <p className="form-helper">
                Only provide information for one Lens
              </p>
              <input
                id="lensModel"
                name="lensModel"
                type="text"
                inputMode="text"
                autoComplete="off"
                placeholder="OM SYSTEM 90mm Pro Macro, CANON RF100MM, NIK"
                // className={`form-input ${touched.lensModel && errors.lensModel ? "has-error" : ""}`}
                value={lensModel}
                onChange={(e) => setLensModel(e.target.value)}
                // onBlur={handleBlur}
                // aria-invalid={Boolean(touched.lensModel && errors.lensModel)}
                // aria-describedby="lensModel-error lensModel-help"
              />
              {/* <p id="lensModel-help" className="sr-only">
              Enter exactly one lens make and model.
            </p> */}
              {/* {touched.lensModel && errors.lensModel && (
              <p id="lensModel-error" className="form-error">
                {errors.lensModel}
              </p>
            )} */}
            </div>

            {/* Flash model */}
            <div className="form-field">
              <label htmlFor="flashModel" className="form-label">
                Provide your flash make & model{" "}
                <span className="required">*</span>
              </label>
              <p className="form-helper">
                Only provide information for one Flash
              </p>
              <input
                id="flashModel"
                name="flashModel"
                type="text"
                inputMode="text"
                autoComplete="off"
                placeholder="Godox V860III, Godox V350, Canon 600EX II-RT, Nikon S"
                // className={`form-input ${touched.flashModel && errors.flashModel ? "has-error" : ""}`}
                value={flashModel}
                onChange={(e) => setFlashModel(e.target.value)}
                // onBlur={handleBlur}
                // aria-invalid={Boolean(touched.flashModel && errors.flashModel)}
                // aria-describedby="flashModel-error flashModel-help"
              />
              {/* <p id="flashModel-help" className="sr-only">
              Enter exactly one flash make and model.
            </p> */}
              {/* {touched.flashModel && errors.flashModel && (
              <p id="flashModel-error" className="form-error">
                {errors.flashModel}
              </p>
            )} */}
            </div>

            {/* Quantity */}
            <div className="form-field form-field--qty">
              <label htmlFor="quantity" className="form-label">
                Quantity
                <span className="radio">
                  <label className="radio">
                    <input
                      type="radio"
                      name="quantity"
                      value="1"
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                    <span className="radio-text">One</span>
                  </label>
                  <label className="radio">
                    <input
                      type="radio"
                      name="quantity"
                      value="2"
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                    <span className="radio-text">Two</span>
                  </label>
                </span>
              </label>
            </div>
            <div className="form-field">
              <p>(Maximum quantity in one order is 2 nos)</p>
            </div>
            {product.sizes && (
              <div className="form-field">
                <label>Select Filter Thread size : </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  {product.sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="product-actions">
              <button
                className="btn btn-primary"
                onClick={(e) => handleAddToCart(e)}
              >
                Add to Cart
              </button>
              <button
                className="btn btn-secondary"
                onClick={(e) => handleBuyNow(e)}
              >
                Buy Now
              </button>
            </div>
          </div>
        </form>

        {/* ------------------------------------ */}
        {/* <div className="product-details-info">
          <h1>{product.name}</h1>
          <p className="product-subtitle">{product.subtitle}</p>
          <span className="product-price">${product.price.toFixed(2)}</span>
          <p className="product-description">{product.description}</p>

          {product.sizes && (
            <div className="product-options">
              <label>Select Filter Thread size : </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                {product.sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="quantity-selector">
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 600,
                color: "var(--accent-yellow)",
              }}
            >
              Quantity:
            </label>
            <div className="quantity-controls">
              <button
                className="quantity-btn"
                onClick={() => updateQuantity(-1)}
              >
                -
              </button>
              <span className="quantity-display">{quantity}</span>
              <button
                className="quantity-btn"
                onClick={() => updateQuantity(1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="product-actions">
            <button
              className="btn btn-primary"
              onClick={() => setShowSpecs(true)}
            >
              View Specifications
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/")}>
              Continue Shopping
            </button>
          </div>
        </div> */}
      </div>

      <div className="specifications-table">
        {/* <h2>Guides</h2> */}
        {product.info.map((infos, index) => (
          <div key={index} className="spec-row">
            <div className="spec-label">✓</div>
            <div className="spec-value">{infos}</div>
          </div>
        ))}
      </div>
      <div className="specifications-table">
        <h2>Guides</h2>
        {product.loader.map((load, index) => (
          <div key={index} className="spec-row">
            <div className="spec-label">✓</div>
            <div className="spec-value">{load}</div>
          </div>
        ))}
      </div>
      
    
    </div>
  );
};

export default ProductDetails;
