import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const addToCart = (item) => {
    const cartItem = {
      id: Date.now(),
      ...item
    };
    setCart(prev => [...prev, cartItem]);
    showSuccessMessage('Product added to cart!');
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    showSuccessMessage('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      getCartCount,
      getCartTotal,
      successMessage,
      showSuccessMessage
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
