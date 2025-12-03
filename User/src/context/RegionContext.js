import React, { createContext, useContext, useState, useEffect } from 'react';

const RegionContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const RegionProvider = ({ children }) => {
  const [region, setRegion] = useState({
    region: 'IN',
    country: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    isIndia: true,
    loading: true
  });

  // Auto-detect region on mount
  useEffect(() => {
    detectRegion();
  }, []);

  const detectRegion = async () => {
    try {
      const response = await fetch(`${API_URL}/region/detect`);
      const data = await response.json();
      
      if (data.success) {
        setRegion({
          ...data.data,
          loading: false
        });
      }
    } catch (error) {
      console.error('Region detection failed:', error);
      // Default to India on error
      setRegion({
        region: 'IN',
        country: 'India',
        currency: 'INR',
        currencySymbol: '₹',
        isIndia: true,
        loading: false
      });
    }
  };

  // Format price based on region
  const formatPrice = (product, quantity = 1) => {
    if (region.isIndia) {
      // Indian pricing in INR
      return {
        price: product.price * quantity,
        currency: 'INR',
        symbol: '₹',
        formatted: `₹${(product.price * quantity).toLocaleString('en-IN')}`
      };
    } else {
      // International pricing in USD
      const intlPrice = product.internationalPrice || {};
      let unitPrice;
      
      if (quantity >= 2 && intlPrice.double) {
        // Use double price (for 2 qty)
        unitPrice = intlPrice.double / 2; // Price per unit when buying 2
      } else {
        unitPrice = intlPrice.single || 0;
      }
      
      const totalPrice = quantity >= 2 ? intlPrice.double : intlPrice.single * quantity;
      
      return {
        price: totalPrice || 0,
        currency: 'USD',
        symbol: '$',
        formatted: `$${(totalPrice || 0).toLocaleString('en-US')}`
      };
    }
  };

  // Get display price for product card (shows single unit price)
  const getDisplayPrice = (product) => {
    if (region.isIndia) {
      return {
        price: product.price,
        currency: 'INR',
        symbol: '₹',
        formatted: `₹${product.price?.toLocaleString('en-IN') || 0}`
      };
    } else {
      // For international: use international price if available, otherwise convert INR to approximate USD
      const singlePrice = product.internationalPrice?.single;
      const hasIntlPrice = singlePrice && singlePrice > 0;
      
      // If no international price set, show INR price (admin needs to set intl price)
      if (!hasIntlPrice) {
        return {
          price: product.price,
          currency: 'INR',
          symbol: '₹',
          formatted: `₹${product.price?.toLocaleString('en-IN') || 0}`,
          needsIntlPricing: true
        };
      }
      
      return {
        price: singlePrice,
        currency: 'USD',
        symbol: '$',
        formatted: `$${singlePrice.toLocaleString('en-US')}`
      };
    }
  };

  // Get price breakdown for cart (handles quantity discounts)
  const getCartPrice = (product, quantity) => {
    if (region.isIndia) {
      return {
        unitPrice: product.price,
        totalPrice: product.price * quantity,
        currency: 'INR',
        symbol: '₹',
        formatted: `₹${(product.price * quantity).toLocaleString('en-IN')}`,
        unitFormatted: `₹${product.price?.toLocaleString('en-IN')}`,
        hasDiscount: false
      };
    } else {
      const intlPrice = product.internationalPrice || {};
      const hasIntlPrice = intlPrice.single && intlPrice.single > 0;
      
      // If no international price, fall back to INR pricing
      if (!hasIntlPrice) {
        return {
          unitPrice: product.price,
          totalPrice: product.price * quantity,
          currency: 'INR',
          symbol: '₹',
          formatted: `₹${(product.price * quantity).toLocaleString('en-IN')}`,
          unitFormatted: `₹${product.price?.toLocaleString('en-IN')}`,
          hasDiscount: false,
          needsIntlPricing: true
        };
      }
      
      let totalPrice, unitPrice, hasDiscount = false;
      
      if (quantity >= 2 && intlPrice.double && intlPrice.double > 0) {
        totalPrice = intlPrice.double;
        unitPrice = intlPrice.double / 2;
        hasDiscount = intlPrice.single * 2 > intlPrice.double;
      } else {
        unitPrice = intlPrice.single || 0;
        totalPrice = unitPrice * quantity;
      }
      
      return {
        unitPrice,
        totalPrice,
        currency: 'USD',
        symbol: '$',
        formatted: `$${totalPrice.toLocaleString('en-US')}`,
        unitFormatted: `$${unitPrice.toLocaleString('en-US')}`,
        hasDiscount,
        originalTotal: intlPrice.single * quantity
      };
    }
  };

  return (
    <RegionContext.Provider value={{
      ...region,
      detectRegion,
      formatPrice,
      getDisplayPrice,
      getCartPrice
    }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};

export default RegionContext;
