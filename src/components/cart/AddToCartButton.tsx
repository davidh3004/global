/**
 * Add to Cart Button Component
 * Reusable button to add products to cart
 */

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import type { CartItem } from '../../types/cart';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
  };
  quantity?: number;
  lang?: string;
  className?: string;
  onSuccess?: () => void;
}

const translations = {
  en: {
    addToCart: 'Add to Cart',
    adding: 'Adding...',
    added: 'Added!',
  },
  es: {
    addToCart: 'Agregar al Carrito',
    adding: 'Agregando...',
    added: '¡Agregado!',
  },
};

export default function AddToCartButton({
  product,
  quantity = 1,
  lang = 'en',
  className = '',
  onSuccess,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const t = translations[lang as keyof typeof translations] || translations.es;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
        description: product.description,
      };

      await addItem(cartItem);
      
      // Show success feedback
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Call success callback if provided
      onSuccess?.();
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`add-to-cart-btn ${showSuccess ? 'success' : ''} ${className}`}
    >
      {showSuccess ? t.added : isAdding ? t.adding : t.addToCart}
    </button>
  );
}
