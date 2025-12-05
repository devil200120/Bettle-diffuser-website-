import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { products as staticProducts } from "../data/products";
import { useCart } from "../context/CartContext";
import { useRegion } from "../context/RegionContext";
import { useToast } from "../components/Toast";
// import ProductForm from "../components/ProductForm";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

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

// Helper to get correct image source (Cloudinary URL or local path)
const getImageSrc = (icon) => {
  if (!icon) return getRandomFallback();
  // If it's a full URL (starts with http/https), use it directly
  if (icon.startsWith('http://') || icon.startsWith('https://')) {
    return icon;
  }
  // Otherwise, it's a local image path
  return `/images/${icon}`;
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { getCartPrice, isIndia, currencySymbol, loading: regionLoading } = useRegion();
  const { showWarning, showSuccess, showError } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cameraModel, setCameraModel] = useState('');
  const [lensModel, setLensModel] = useState('');
  const [flashModel, setFlashModel] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');

  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [showSpecs, setShowSpecs] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [imgError, setImgError] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  
  // Form validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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
            variantPricing: data.variantPricing || null,
            footer: data.footer || '',
            loader: data.loader || [],
            info: data.info || []
          };
          setProduct(transformedProduct);
          setSelectedSize(null); // Don't auto-select, let user choose
          
          // Set default variant if product has variants
          if (transformedProduct.variant && transformedProduct.variant.length > 0) {
            setSelectedVariant(transformedProduct.variant[0]);
          }
          setImgSrc(getImageSrc(transformedProduct.icon));
          setImgError(false);
        } else {
          // Fallback to static products
          const foundProduct = staticProducts.find((p) => p.id === parseInt(id));
          if (foundProduct) {
            setProduct(foundProduct);
            setSelectedSize(null); // Don't auto-select, let user choose
            // Set default variant if product has variants
            if (foundProduct.variant && foundProduct.variant.length > 0) {
              setSelectedVariant(foundProduct.variant[0]);
            }
            setImgSrc(getImageSrc(foundProduct.icon));
            setImgError(false);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        // Fallback to static products
        const foundProduct = staticProducts.find((p) => p.id === parseInt(id));
        if (foundProduct) {
          setProduct(foundProduct);
          setSelectedSize(null); // Don't auto-select, let user choose
          // Set default variant if product has variants
          if (foundProduct.variant && foundProduct.variant.length > 0) {
            setSelectedVariant(foundProduct.variant[0]);
          }
          setImgSrc(getImageSrc(foundProduct.icon));
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

  // Get variant-based pricing
  const getVariantPrice = () => {
    if (!product) return { price: 0, internationalPrice: { single: 0, double: 0 } };
    
    // Check if product has variant-specific pricing
    if (product.variantPricing && selectedVariant) {
      // Handle both object and Map formats
      let variantData = null;
      
      if (product.variantPricing instanceof Map) {
        variantData = product.variantPricing.get(selectedVariant);
      } else if (typeof product.variantPricing === 'object') {
        variantData = product.variantPricing[selectedVariant];
      }
      
      if (variantData) {
        return {
          price: variantData.price || product.price,
          internationalPrice: variantData.internationalPrice || product.internationalPrice || { single: 0, double: 0 }
        };
      }
    }
    
    // Fallback to default product pricing
    return {
      price: product.price || 0,
      internationalPrice: product.internationalPrice || { single: 0, double: 0 }
    };
  };

  // Get display price based on region and variant
  const getDisplayPrice = () => {
    const variantPrice = getVariantPrice();
    const qty = parseInt(quantity) || 1;
    
    if (isIndia) {
      const total = variantPrice.price * qty;
      return {
        formatted: `₹${total.toLocaleString('en-IN')}`,
        unitPrice: variantPrice.price,
        total: total
      };
    } else {
      const intlPrice = variantPrice.internationalPrice || {};
      // Check for quantity-specific pricing (qty1, qty2, qty3, qty4, qty5)
      const qtyKey = `qty${qty}`;
      if (intlPrice[qtyKey] > 0) {
        return {
          formatted: `$${intlPrice[qtyKey]}`,
          unitPrice: intlPrice.qty1 || intlPrice.single || 0,
          total: intlPrice[qtyKey],
          isBundle: qty > 1
        };
      }
      // Fallback to old single/double format for backward compatibility
      if (qty >= 2 && intlPrice.double > 0) {
        return {
          formatted: `$${intlPrice.double}`,
          unitPrice: intlPrice.single,
          total: intlPrice.double,
          isBundle: true
        };
      }
      const unitPrice = intlPrice.single || intlPrice.qty1 || 0;
      const total = unitPrice * qty;
      return {
        formatted: `$${total}`,
        unitPrice: unitPrice,
        total: total
      };
    }
  };

  // Check if product is Twin Flash (skip gear details for this product)
  const isTwinFlash = product?.name?.toLowerCase().includes('twin');

  // Form validation function
  const validateForm = () => {
    const newErrors = {};
    
    // Skip camera/lens/flash/size validation for Twin Flash
    if (!isTwinFlash) {
      // Camera model validation
      if (!cameraModel || cameraModel.trim() === '') {
        newErrors.cameraModel = 'Camera model is required';
      }
      
      // Lens model validation
      if (!lensModel || lensModel.trim() === '') {
        newErrors.lensModel = 'Lens model is required';
      }
      
      // Flash model validation
      if (!flashModel || flashModel.trim() === '') {
        newErrors.flashModel = 'Flash model is required';
      }
      
      // Size validation (if product has sizes)
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        newErrors.size = 'Please select a filter thread size';
      }
    }
    
    // Quantity validation
    if (!quantity || quantity < 1) {
      newErrors.quantity = 'Please select quantity (1 to 5)';
    }
    
    // Variant validation (if product has variants)
    if (product.variant && product.variant.length > 0 && !selectedVariant) {
      newErrors.variant = 'Please select a variant';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field blur for showing errors
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show errors
    setTouched({
      cameraModel: true,
      lensModel: true,
      flashModel: true,
      quantity: true,
      size: true,
      variant: true
    });
    
    // Validate form FIRST before checking login
    if (!validateForm()) {
      showError('Please fill all required fields before adding to cart');
      return;
    }
    
    // Check if user is logged in AFTER form validation
    if (!isLoggedIn()) {
      showWarning('Please login to add items to cart');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      return;
    }
    
    if (!product) return;

    // Get variant-specific pricing
    const variantPrice = getVariantPrice();

    addToCart({
      productId: product.id,
      name: product.name,
      icon: product.icon,
      price: variantPrice.price,
      internationalPrice: variantPrice.internationalPrice,
      quantity: parseInt(quantity) || 1,
      size: selectedSize,
      variant: selectedVariant,
      cameraModel,
      lensModel,
      flashModel
    });
    showSuccess('Product added to cart!');
    // Redirect to cart page
    setTimeout(() => {
      navigate('/cart');
    }, 500);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show errors
    setTouched({
      cameraModel: true,
      lensModel: true,
      flashModel: true,
      quantity: true,
      size: true,
      variant: true
    });
    
    // Validate form FIRST before checking login
    if (!validateForm()) {
      showError('Please fill all required fields before purchasing');
      return;
    }
    
    // Check if user is logged in AFTER form validation
    if (!isLoggedIn()) {
      showWarning('Please login to purchase items');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      return;
    }
    
    // Add to cart and navigate directly to checkout
    if (product) {
      // Get variant-specific pricing
      const variantPrice = getVariantPrice();
      
      addToCart({
        productId: product.id,
        name: product.name,
        icon: product.icon,
        price: variantPrice.price,
        internationalPrice: variantPrice.internationalPrice,
        quantity: parseInt(quantity) || 1,
        size: selectedSize,
        variant: selectedVariant,
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
              <div className="spec-label">»</div>
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

      {!isTwinFlash && (
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
      )}

      <div className="product-details-grid">
        <div className="product-details-image">
          <div 
            className="relative cursor-pointer group"
            onClick={() => setShowLightbox(true)}
          >
            <img src={imgSrc} alt={product.name} onError={handleImageError} style={{ borderRadius: '10px' }} />
            {/* Zoom overlay hint */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center" style={{ borderRadius: '10px' }}>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#E8C547] rounded-full p-3">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* --------------------------------------- */}
        <form >
          <div className="product-form__grid">
            <div className="product-details-info">
              <h1>{product.name}</h1>
              {/* <p className="product-subtitle">{product.subtitle}</p> */}
              {/* Region-based pricing with variant support */}
              {regionLoading ? (
                <span className="product-price">Loading price...</span>
              ) : (
                <>
                  <span className="product-price">
                    Price: {getDisplayPrice().formatted}
                    {isIndia ? '' : ' USD'}
                  </span>
                  {/* Show variant price info */}
                  {product.variantPricing && selectedVariant && (
                    <p className="text-sm text-gray-400 my-2">
                      {selectedVariant} variant selected
                    </p>
                  )}
                  {/* Quantity pricing info for international customers */}
                  {!isIndia && parseInt(quantity) >= 2 && (
                    <p className="text-sm text-green-500 mt-1">
                      ✓ Quantity pricing applied for {quantity} items!
                    </p>
                  )}
                </>
              )}
              <p className="product-description">{product.description}</p>
            </div>

            {/* Variant Selection (if product has variants) */}
            {product.variant && product.variant.length > 0 && (
              <div className="form-field">
                <label className="form-label">Select Variant <span className="text-red-500 font-bold">*</span></label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  onBlur={() => handleBlur('variant')}
                  className={`${touched.variant && errors.variant ? "!border-red-500 !bg-red-500/10" : ""}`}
                >
                  <option value="">-- Select a variant --</option>
                  {product.variant.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                {touched.variant && errors.variant && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>⚠</span> {errors.variant}
                  </p>
                )}
              </div>
            )}

            {/* Camera, Lens, Flash models - Hidden for Twin Flash */}
            {!isTwinFlash && (
              <>
                {/* Camera model */}
                <div className="form-field">
                  <label htmlFor="cameraModel" className="form-label">
                    Provide your camera model <span className="text-red-500 font-bold">*</span>
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
                    className={`form-input ${touched.cameraModel && errors.cameraModel ? "!border-red-500 !bg-red-500/10" : ""}`}
                    value={cameraModel}
                    onChange={(e) => setCameraModel(e.target.value)}
                    onBlur={() => handleBlur('cameraModel')}
                    aria-invalid={Boolean(touched.cameraModel && errors.cameraModel)}
                  />
                  {touched.cameraModel && errors.cameraModel && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span>⚠</span> {errors.cameraModel}
                    </p>
                  )}
                </div>

                {/* Lens model */}
                <div className="form-field">
                  <label htmlFor="lensModel" className="form-label">
                    Provide your lens make & model{" "}
                    <span className="text-red-500 font-bold">*</span>
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
                    className={`form-input ${touched.lensModel && errors.lensModel ? "!border-red-500 !bg-red-500/10" : ""}`}
                    value={lensModel}
                    onChange={(e) => setLensModel(e.target.value)}
                    onBlur={() => handleBlur('lensModel')}
                    aria-invalid={Boolean(touched.lensModel && errors.lensModel)}
                  />
                  {touched.lensModel && errors.lensModel && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span>⚠</span> {errors.lensModel}
                    </p>
                  )}
                </div>

                {/* Flash model */}
                <div className="form-field">
                  <label htmlFor="flashModel" className="form-label">
                    Provide your flash make & model{" "}
                    <span className="text-red-500 font-bold">*</span>
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
                    className={`form-input ${touched.flashModel && errors.flashModel ? "!border-red-500 !bg-red-500/10" : ""}`}
                    value={flashModel}
                    onChange={(e) => setFlashModel(e.target.value)}
                    onBlur={() => handleBlur('flashModel')}
                    aria-invalid={Boolean(touched.flashModel && errors.flashModel)}
                  />
                  {touched.flashModel && errors.flashModel && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span>⚠</span> {errors.flashModel}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Filter Thread Size - moved above Quantity */}
            {!isTwinFlash && product.sizes && product.sizes.length > 0 && (
              <div className="form-field">
                <label className="form-label">Select Filter Thread size <span className="text-red-500 font-bold">*</span></label>
                <select
                  value={selectedSize || ''}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  onBlur={() => handleBlur('size')}
                  className={`${touched.size && errors.size ? "!border-red-500 !bg-red-500/10" : ""}`}
                >
                  <option value="">-- Select a size --</option>
                  {product.sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                {touched.size && errors.size && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>⚠</span> {errors.size}
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="form-field">
              <label htmlFor="quantity" className="form-label">
                Quantity <span className="text-red-500 font-bold">*</span>
              </label>
              <select
                id="quantity"
                name="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onBlur={() => handleBlur('quantity')}
                className={`${touched.quantity && errors.quantity ? "!border-red-500 !bg-red-500/10" : ""}`}
              >
                <option value="">-- Select quantity --</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
              {touched.quantity && errors.quantity && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span>⚠</span> {errors.quantity}
                </p>
              )}
            </div>
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

      {/* Compatibility notes - Hidden for Twin Flash */}
      {!isTwinFlash && (
        <div className="specifications-table">
          {/* <h2>Guides</h2> */}
        
          <div className="spec-row">
            <div className="spec-label">»</div>
            <div className="spec-value">Though most flash models are supported, a few small flashes—such as the Meike MK-320 and Olympus FL-LM3—are not compatible.</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">»</div>
            <div className="spec-value">Most macro lenses use the thread sizes listed in the dropdown, and a matching ring is included. If your lens size isn't listed, select “Filter thread size not listed” — you can still use the diffuser by tightening the cord panel around the lens.</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">»</div>
            <div className="spec-value">Lenses below Physical length of 2.5 inches (6.3 cm)  are not supported</div>
          </div>
       
        </div>
      )}
      {!isTwinFlash && product.loader && product.loader.length > 0 && (
        <div className="specifications-table">
          <h2>Guides</h2>
          {product.loader.map((load, index) => (
            <div key={index} className="spec-row">
              <div className="spec-label">»</div>
              <div className="spec-value">{load}</div>
            </div>
          ))}
        </div>
      )}

      {/* Package Includes Section - Pro Model */}
      {product.name && product.name.toLowerCase().includes('pro') && (
        <div className="specifications-table">
          <h2>Package Includes</h2>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Diffuser Body & diffusion panel</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">LED Light with On/Off - dimmer switch cable</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Zipper bag</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Raynox holder</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Angle adjuster (Latch-strap mechanism)</div>
          </div>
          {isIndia ? (
            <div className="spec-row">
              <div className="spec-label">•</div>
              <div className="spec-value">Power bank</div>
            </div>
          ) : (
            <div className="spec-row">
              <div className="spec-label">•</div>
              <div className="spec-value">Velcro sticker for power bank</div>
            </div>
          )}
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Beetle Ring</div>
          </div>
        </div>
      )}

      {/* Package Includes Section - Lite Model */}
      {product.name && product.name.toLowerCase().includes('lite') && (
        <div className="specifications-table">
          <h2>Package Includes</h2>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Diffuser body & diffusion panel</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">LED with on/off cable</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">2 custom Bands</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Velcro strap</div>
          </div>
          {isIndia ? (
            <div className="spec-row">
              <div className="spec-label">•</div>
              <div className="spec-value">Mini power bank</div>
            </div>
          ) : (
            <div className="spec-row">
              <div className="spec-label">•</div>
              <div className="spec-value">Velcro sticker for power bank</div>
            </div>
          )}
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Beetle ring</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Zipper bag</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Raynox holder </div>
          </div>
        </div>
      )}

      {/* Package Includes Section - Twin Flash Model */}
      {product.name && product.name.toLowerCase().includes('twin') && (
        <div className="specifications-table">
          <h2>Package Includes</h2>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Diffuser body & 2 sets of diffusion Panels</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">2 Custom Mounting clamps</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Zipper Bag</div>
          </div>
        </div>
      )}

      {/* Key Features Section - Pro Model */}
      {product.name && product.name.toLowerCase().includes('pro') && (
        <div className="specifications-table">
          <h2>Key Features</h2>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Comes with a unique latch-strap mechanism that allows you to vary the lighting angle more precisely.</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Powerful (5-6 watts) focus assist light with dimmer switch which can also be used for shooting videos.</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Comes with Raynox holder for quick storage of Raynox in the field.</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Unique Beetle Diffuser Ring to avoid panel from slipping out and still be able to use the original lens cap.</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Bottom Reflector.</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Can be packed flat in a Bag.</div>
          </div>
        </div>
      )}

      {/* Key Features Section - Lite Model */}
      {product.name && product.name.toLowerCase().includes('lite') && (
        <div className="specifications-table">
          <h2>Key Features</h2>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">The lightest Beetle diffuser to date.</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Fastest Diffuser to assemble.</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Unique Beetle band with gripper tags for mounting on speedlights.</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Unique Beetle Diffuser Ring to avoid panel from slipping out and still be able to use the original lens cap.</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Variable lighting angle.</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Comes with Raynox holder for quick storage of Raynox in the field.</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Can be purchased with or without LED.</div>
          </div>
        </div>
      )}

      {/* Key Features Section - Twin Flash Model */}
      {product.name && product.name.toLowerCase().includes('twin') && (
        <div className="specifications-table">
          <h2>Key Features</h2>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Custom made mounting clamps for perfect fit on the Laowa/Kuangren twin flash.</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Easy assembly.</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Can be packed flat in a Bag.</div>
          </div>
          <div className="spec-row">
            <div className="spec-label">•</div>
            <div className="spec-value">Extra pair of Diffusion panels.</div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setShowLightbox(false)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 text-white hover:text-[#E8C547] transition-colors z-10"
            onClick={() => setShowLightbox(false)}
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Container */}
          <div 
            className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imgSrc}
              alt={product.name}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg text-center">
              <h3 className="text-white font-bold text-2xl">
                {product.name}
              </h3>
              {product.subtitle && (
                <span className="text-[#E8C547]">
                  {product.subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Navigation hint */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm">
            Click anywhere to close
          </p>
        </div>
      )}
      
    
    </div>
  );
};

export default ProductDetails;
