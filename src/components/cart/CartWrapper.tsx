/**
 * Cart Wrapper Component
 * Wraps the app with CartProvider and includes CartDrawer and CartBadge
 */

import React from 'react';
import { CartProvider } from '../../context/CartContext';
import CartDrawerNew from './CartDrawerNew';
import CartBadge from './CartBadge';

interface CartWrapperProps {
  lang?: string;
  children?: React.ReactNode;
}

export default function CartWrapper({ lang = 'en', children }: CartWrapperProps) {
  return (
    <CartProvider>
      <CartBadge />
      <CartDrawerNew lang={lang} />
      {children}
    </CartProvider>
  );
}
