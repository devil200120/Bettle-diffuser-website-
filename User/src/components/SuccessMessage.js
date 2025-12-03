import React from 'react';
import { useCart } from '../context/CartContext';

const SuccessMessage = () => {
  const { successMessage } = useCart();

  return (
    <div className={`success-message ${successMessage ? 'show' : ''}`}>
      {successMessage}
    </div>
  );
};

export default SuccessMessage;
