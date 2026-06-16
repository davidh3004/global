/**
 * Cart Badge Component
 * Displays the number of items in the cart
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../../context/CartContext';

export default function CartBadge() {
  const { state } = useCart();
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Find the placeholder element in the header
    const placeholder = document.getElementById('cartBadgePlaceholder');
    console.log('[CartBadge] Placeholder element:', placeholder);
    setContainer(placeholder);
  }, []);

  useEffect(() => {
    console.log('[CartBadge] Item count:', state.itemCount);
  }, [state.itemCount]);

  if (!container) {
    console.log('[CartBadge] No container found, not rendering');
    return null;
  }

  if (state.itemCount === 0) {
    console.log('[CartBadge] Item count is 0, not rendering badge');
    return null;
  }

  return createPortal(
    <span className="cart-badge">
      {state.itemCount > 99 ? '99+' : state.itemCount}
    </span>,
    container
  );
}
