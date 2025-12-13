import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useRegion } from '../context/RegionContext';
import Footer from '../components/Footer';

// Helper to get correct image source
const getImageSrc = (icon) => {
  if (!icon) return '/images/placeholder.jpg';
  // If it's a full URL (starts with http/https), use it directly
  if (icon.startsWith('http://') || icon.startsWith('https://')) {
    return icon;
  }
  // If it already starts with /images/, use it directly
  if (icon.startsWith('/images/')) {
    return icon;
  }
  // Otherwise, prepend /images/
  return `/images/${icon}`;
};

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, showSuccessMessage } = useCart();
  const { getCartPrice, isIndia, currencySymbol, loading: regionLoading } = useRegion();
  const navigate = useNavigate();

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
    
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;
    
    return { subtotal, shipping, total };
  };

  const { subtotal, shipping, total } = calculateTotals();

  const formatPrice = (amount) => {
    return `${currencySymbol}${amount.toLocaleString(isIndia ? 'en-IN' : 'en-US')}`;
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div>
        <div className="max-w-6xl mx-auto px-5 pt-24 pb-32 lg:pb-12 min-h-[60vh] flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold text-yellow-400 mb-4">Your Cart is Empty</h1>
            <p className="text-zinc-400 mb-8">Looks like you haven't added any items yet.</p>
            <Link 
              to="/" 
              className="inline-block px-8 py-3 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-500 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      {showSuccessMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          ✓ Item added to cart successfully!
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-5 pt-24 pb-32 lg:pb-12">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8 text-center">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {!regionLoading && (
              <div className={`mb-4 px-4 py-3 rounded-xl ${isIndia ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {isIndia ? '🇮🇳 Prices shown for India' : '🌍 International pricing applied'}
              </div>
            )}
            
            {cart.map((item) => {
              const itemPriceInfo = getCartPrice(
                { price: item.price, internationalPrice: item.internationalPrice },
                item.quantity
              );
              
              return (
                <div key={item.id} className="bg-zinc-800 rounded-2xl p-4 md:p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-700">
                      <img 
                        src={getImageSrc(item.icon)} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h3 className="text-white font-semibold text-lg truncate">{item.name}</h3>
                          {item.size && (
                            <p className="text-zinc-400 text-sm">Size: {item.size}</p>
                          )}
                          {item.cameraModel && (
                            <p className="text-zinc-400 text-sm truncate">Camera: {item.cameraModel}</p>
                          )}
                          {item.lensModel && (
                            <p className="text-zinc-400 text-sm truncate">Lens: {item.lensModel}</p>
                          )}
                          {item.flashModel && (
                            <p className="text-zinc-400 text-sm truncate">Flash: {item.flashModel}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-zinc-400 hover:text-red-400 transition-colors p-1"
                          title="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        {/* Quantity Display */}
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400 text-sm">Qty:</span>
                          <span className="text-white font-medium">{item.quantity}</span>
                        </div>
                        
                        {/* Price */}
                        <div className="text-right">
                          <p className="text-yellow-400 font-bold text-lg">{itemPriceInfo.formatted}</p>
                          {itemPriceInfo.hasDiscount && (
                            <p className="text-green-400 text-xs">Bundle discount applied</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="bg-zinc-800 p-6 rounded-2xl h-fit lg:sticky lg:top-24">
            <h2 className="text-yellow-400 text-xl font-semibold mb-6 pb-2 border-b border-zinc-700">
              Order Summary
            </h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-zinc-300">
                <span>Subtotal ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-green-400">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
            </div>
            
            <div className="border-t border-zinc-700 pt-4 mb-6">
              <div className="flex justify-between text-white font-bold text-xl">
                <span>Total</span>
                <span className="text-yellow-400">{formatPrice(total)}</span>
              </div>
              <p className="text-zinc-500 text-xs mt-1">Including all taxes</p>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-4 bg-yellow-400 text-black font-semibold text-lg rounded-xl hover:bg-yellow-500 transition-all hover:-translate-y-1 hidden lg:block"
            >
              Proceed to Checkout
            </button>
            
            <Link 
              to="/" 
              className="block text-center mt-4 text-zinc-400 hover:text-yellow-400 transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      
      {/* Sticky Mobile Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 p-4 lg:hidden z-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-400">Total</span>
          <span className="text-yellow-400 font-bold text-xl">{formatPrice(total)}</span>
        </div>
        <button
          onClick={handleProceedToCheckout}
          className="w-full py-4 bg-yellow-400 text-black font-semibold text-lg rounded-xl hover:bg-yellow-500 transition-all"
        >
          Proceed to Checkout
        </button>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;
