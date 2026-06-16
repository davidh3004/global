/**
 * Checkout Wrapper Component
 * Wraps checkout form with CartProvider
 */

import React from 'react';
import { CartProvider } from '../../context/CartContext';
import CheckoutForm from './CheckoutForm';

interface Props {
  lang?: string;
}

export default function CheckoutWrapper({ lang = 'en' }: Props) {
  return (
    <CartProvider>
      <CheckoutForm lang={lang} />
    </CartProvider>
  );
}
