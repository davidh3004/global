/**
 * Cart Drawer Component
 * Displays shopping cart in a side drawer with full functionality
 */

import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';

interface CartDrawerProps {
  lang?: string;
}

// Translations
const translations = {
  en: {
    title: 'Shopping Cart',
    empty: 'Your cart is empty',
    emptyDesc: 'Add some products to get started',
    continueShopping: 'Continue Shopping',
    subtotal: 'Subtotal',
    total: 'Total',
    checkout: 'Proceed to Checkout',
    remove: 'Remove',
    loading: 'Loading...',
    syncing: 'Syncing cart...',
    quantity: 'Qty',
  },
  es: {
    title: 'Carrito de Compras',
    empty: 'Tu carrito está vacío',
    emptyDesc: 'Agrega algunos productos para comenzar',
    continueShopping: 'Seguir Comprando',
    subtotal: 'Subtotal',
    total: 'Total',
    checkout: 'Proceder al Pago',
    remove: 'Eliminar',
    loading: 'Cargando...',
    syncing: 'Sincronizando carrito...',
    quantity: 'Cant',
  },
};

export default function CartDrawerNew({ lang = 'en' }: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  const [currentLang, setCurrentLang] = useState(lang);
  const { state, removeItem, updateQuantity } = useCart();
  
  // Detect language from URL and listen for changes
  useEffect(() => {
    const updateLanguage = (event?: CustomEvent) => {
      let newLang: string;
      
      // If event has language detail, use it
      if (event?.detail?.language) {
        newLang = event.detail.language;
      } else {
        // Otherwise detect from URL
        const isEnglish = window.location.pathname.includes('/en');
        newLang = isEnglish ? 'en' : 'es';
      }
      
      console.log('CartDrawer: Updating language to', newLang, 'from event:', event?.type);
      setCurrentLang(newLang);
    };
    
    // Initial detection
    updateLanguage();
    
    // Listen for language changes
    window.addEventListener('languageChanged', updateLanguage as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', updateLanguage as EventListener);
    };
  }, []);
  
  const t = translations[currentLang as keyof typeof translations] || translations.es;

  // Listen for cart toggle events
  useEffect(() => {
    const handleToggleCart = () => {
      setIsOpen((prev) => !prev);
    };

    window.addEventListener('toggleCart', handleToggleCart);
    return () => window.removeEventListener('toggleCart', handleToggleCart);
  }, []);

  // Activate overlay with delay to prevent immediate close
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setOverlayActive(true), 100);
      return () => clearTimeout(timer);
    } else {
      setOverlayActive(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await removeItem(id);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleCheckout = () => {
    window.location.href = '/checkout';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => overlayActive && handleClose()}
      />

      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <h2>{t.title}</h2>
          <button className="cart-close" onClick={handleClose} aria-label="Close cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="cart-content">
          {state.isSyncing ? (
            <div className="cart-loading">
              <div className="spinner"></div>
              <p>{t.syncing}</p>
            </div>
          ) : state.isLoading ? (
            <div className="cart-loading">
              <div className="spinner"></div>
              <p>{t.loading}</p>
            </div>
          ) : state.items.length === 0 ? (
            <div className="cart-empty">
              <div className="empty-icon">🛒</div>
              <h3>{t.empty}</h3>
              <p>{t.emptyDesc}</p>
              <button className="btn-primary" onClick={handleClose}>
                {t.continueShopping}
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {state.items.map((item) => (
                  <div key={item.id} className="cart-item">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="cart-item-image"
                        loading="lazy"
                      />
                    )}
                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      {item.description && (
                        <p className="cart-item-description">{item.description}</p>
                      )}
                      <p className="cart-item-price">${item.price.toFixed(2)}</p>
                      <div className="cart-item-quantity">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      className="cart-item-remove"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label={`${t.remove} ${item.name}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="cart-footer">
                <div className="cart-summary">
                  <div className="cart-summary-row">
                    <span>{t.subtotal}</span>
                    <span>${state.total.toFixed(2)}</span>
                  </div>
                  <div className="cart-summary-row cart-total">
                    <span>{t.total}</span>
                    <span>${state.total.toFixed(2)}</span>
                  </div>
                </div>
                <button className="btn-checkout" onClick={handleCheckout}>
                  {t.checkout}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .cart-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 9998;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .cart-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .cart-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          max-width: 450px;
          background: white;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
        }

        .cart-drawer.open {
          transform: translateX(0);
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .cart-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: #111827;
        }

        .cart-close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.375rem;
          transition: background-color 0.2s;
        }

        .cart-close:hover {
          background-color: #f3f4f6;
        }

        .cart-close svg {
          width: 1.5rem;
          height: 1.5rem;
          color: #6b7280;
        }

        .cart-content {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .cart-loading,
        .cart-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }

        .spinner {
          width: 3rem;
          height: 3rem;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .cart-empty h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: #111827;
        }

        .cart-empty p {
          color: #6b7280;
          margin: 0 0 1.5rem 0;
        }

        .cart-items {
          flex: 1;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .cart-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          position: relative;
        }

        .cart-item-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 0.375rem;
          flex-shrink: 0;
        }

        .cart-item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .cart-item-details h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          color: #111827;
        }

        .cart-item-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .cart-item-price {
          font-size: 1.125rem;
          font-weight: 700;
          color: #059669;
          margin: 0.25rem 0;
        }

        .cart-item-quantity {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .cart-item-quantity button {
          width: 2rem;
          height: 2rem;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 0.375rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          transition: all 0.2s;
        }

        .cart-item-quantity button:hover:not(:disabled) {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }

        .cart-item-quantity button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cart-item-quantity span {
          min-width: 2rem;
          text-align: center;
          font-weight: 500;
        }

        .cart-item-remove {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.25rem;
          transition: background-color 0.2s;
        }

        .cart-item-remove:hover {
          background-color: #fee2e2;
        }

        .cart-item-remove svg {
          width: 1.25rem;
          height: 1.25rem;
          color: #ef4444;
        }

        .cart-footer {
          border-top: 1px solid #e5e7eb;
          padding: 1.5rem;
          background: #f9fafb;
        }

        .cart-summary {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .cart-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 1rem;
          color: #6b7280;
        }

        .cart-summary-row.cart-total {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-checkout {
          width: 100%;
          background-color: #059669;
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-checkout:hover {
          background-color: #047857;
        }

        @media (max-width: 640px) {
          .cart-drawer {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}
