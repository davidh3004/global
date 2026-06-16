/**
 * Checkout Form Component
 * Handles payment processing with QuickBooks Payments
 */

import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import type { CartItem } from '../../types/cart';
import { executeRecaptcha } from '../security/RecaptchaProvider';

interface Props {
  lang?: string;
}

export default function CheckoutForm({ lang = 'en' }: Props) {
  const { state, clearCart } = useCart();
  const isEnglish = lang === 'en';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
  }>({});

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatCardExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const validateCardNumber = (value: string): boolean => {
    const cleaned = value.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const validateCardExpiry = (value: string): boolean => {
    const match = value.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    
    const month = parseInt(match[1]);
    const year = parseInt('20' + match[2]);
    
    if (month < 1 || month > 12) return false;
    
    const now = new Date();
    const expiry = new Date(year, month - 1);
    return expiry > now;
  };

  const validateCardCvv = (value: string): boolean => {
    return /^\d{3,4}$/.test(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Format card fields
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value.replace(/\s/g, '').slice(0, 19));
    } else if (name === 'cardExpiry') {
      formattedValue = formatCardExpiry(value);
    } else if (name === 'cardCvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    // Clear validation error when user types
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate card fields
    const errors: typeof validationErrors = {};
    
    if (!validateCardNumber(formData.cardNumber)) {
      errors.cardNumber = isEnglish ? 'Invalid card number' : 'Número de tarjeta inválido';
    }
    
    if (!validateCardExpiry(formData.cardExpiry)) {
      errors.cardExpiry = isEnglish ? 'Invalid or expired date' : 'Fecha inválida o vencida';
    }
    
    if (!validateCardCvv(formData.cardCvv)) {
      errors.cardCvv = isEnglish ? 'Invalid CVV' : 'CVV inválido';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setLoading(true);

    try {
      console.log('[Checkout] Processing payment...');
      
      // Execute reCAPTCHA verification
      let recaptchaToken = '';
      try {
        recaptchaToken = await executeRecaptcha('checkout');
        console.log('[Checkout] reCAPTCHA token obtained');
      } catch (recaptchaError) {
        console.error('[Checkout] reCAPTCHA error:', recaptchaError);
        throw new Error(isEnglish ? 'Security verification failed' : 'Verificación de seguridad fallida');
      }

      // Verify reCAPTCHA token
      const verifyResponse = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: recaptchaToken, action: 'checkout' }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        throw new Error(isEnglish ? 'Security verification failed' : 'Verificación de seguridad fallida');
      }

      console.log('[Checkout] reCAPTCHA verified, score:', verifyData.score);
      
      // Prepare order data
      const orderData = {
        items: state.items,
        total: state.total,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
          },
        },
        payment: {
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          cardExpiry: formData.cardExpiry,
          cardCvv: formData.cardCvv,
        },
        recaptchaToken,
        recaptchaScore: verifyData.score,
      };

      // Call checkout API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed');
      }

      console.log('[Checkout] Payment successful:', result);
      
      // Clear cart and show success
      await clearCart();
      setSuccess(true);
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        window.location.href = `/client/orders/${result.orderId}`;
      }, 2000);

    } catch (err: any) {
      console.error('[Checkout] Error:', err);
      setError(err.message || (isEnglish ? 'Payment failed' : 'Error al procesar el pago'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✅</div>
        <h2 style={{ color: 'var(--green)', marginBottom: '10px' }}>
          {isEnglish ? 'Payment Successful!' : '¡Pago Exitoso!'}
        </h2>
        <p style={{ color: 'var(--gray-600)' }}>
          {isEnglish ? 'Redirecting to your order...' : 'Redirigiendo a tu orden...'}
        </p>
      </div>
    );
  }

  return (
    <div className="checkout-form">
      <h2 style={{ marginBottom: '24px', fontFamily: 'var(--font-display)' }}>
        {isEnglish ? 'Checkout' : 'Finalizar Compra'}
      </h2>

      {error && (
        <div className="error-message" style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Customer Information */}
        <div className="form-section">
          <h3>{isEnglish ? 'Contact Information' : 'Información de Contacto'}</h3>
          
          <div className="form-group">
            <label htmlFor="name">
              {isEnglish ? 'Full Name' : 'Nombre Completo'} *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder={isEnglish ? 'John Doe' : 'Juan Pérez'}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              {isEnglish ? 'Email' : 'Correo Electrónico'} *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="email@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              {isEnglish ? 'Phone' : 'Teléfono'} *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="(813) 555-1234"
            />
          </div>
        </div>

        {/* Shipping Address */}
        <div className="form-section">
          <h3>{isEnglish ? 'Delivery Address' : 'Dirección de Entrega'}</h3>
          
          <div className="form-group">
            <label htmlFor="address">
              {isEnglish ? 'Street Address' : 'Dirección'} *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              placeholder="123 Main St"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">
                {isEnglish ? 'City' : 'Ciudad'} *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                placeholder="Tampa"
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">
                {isEnglish ? 'State' : 'Estado'} *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                placeholder="FL"
                maxLength={2}
              />
            </div>

            <div className="form-group">
              <label htmlFor="zip">
                {isEnglish ? 'ZIP Code' : 'Código Postal'} *
              </label>
              <input
                type="text"
                id="zip"
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
                required
                placeholder="33614"
                maxLength={5}
              />
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="form-section">
          <h3>{isEnglish ? 'Payment Information' : 'Información de Pago'}</h3>
          
          <div className="form-group">
            <label htmlFor="cardNumber">
              {isEnglish ? 'Card Number' : 'Número de Tarjeta'} *
            </label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              required
              placeholder="4111 1111 1111 1111"
              maxLength={19}
              className={validationErrors.cardNumber ? 'input-error' : ''}
            />
            {validationErrors.cardNumber && (
              <span className="error-text">{validationErrors.cardNumber}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cardExpiry">
                {isEnglish ? 'Expiry Date' : 'Fecha de Vencimiento'} *
              </label>
              <input
                type="text"
                id="cardExpiry"
                name="cardExpiry"
                value={formData.cardExpiry}
                onChange={handleInputChange}
                required
                placeholder="MM/YY"
                maxLength={5}
                className={validationErrors.cardExpiry ? 'input-error' : ''}
              />
              {validationErrors.cardExpiry && (
                <span className="error-text">{validationErrors.cardExpiry}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="cardCvv">CVV *</label>
              <input
                type="text"
                id="cardCvv"
                name="cardCvv"
                value={formData.cardCvv}
                onChange={handleInputChange}
                required
                placeholder="123"
                maxLength={4}
                className={validationErrors.cardCvv ? 'input-error' : ''}
              />
              {validationErrors.cardCvv && (
                <span className="error-text">{validationErrors.cardCvv}</span>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>{isEnglish ? 'Order Summary' : 'Resumen del Pedido'}</h3>
          <div className="summary-items">
            {state.items.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>{isEnglish ? 'Total' : 'Total'}</span>
            <span>${state.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary btn-pay"
          disabled={loading}
        >
          {loading ? (
            isEnglish ? 'Processing...' : 'Procesando...'
          ) : (
            `${isEnglish ? 'Pay' : 'Pagar'} $${state.total.toFixed(2)}`
          )}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '16px' }}>
          🔒 {isEnglish ? 'Secure payment powered by QuickBooks' : 'Pago seguro con QuickBooks'}
        </p>
      </form>

      <style>{`
        .checkout-form {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .form-section {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--gray-200);
        }

        .form-section h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 16px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-700);
          margin-bottom: 6px;
        }

        .form-group input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--gray-300);
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--green);
          box-shadow: 0 0 0 3px rgba(45, 140, 78, 0.1);
        }

        .form-group input.input-error {
          border-color: #dc2626;
        }

        .form-group input.input-error:focus {
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }

        .error-text {
          display: block;
          color: #dc2626;
          font-size: 0.75rem;
          margin-top: 4px;
          font-weight: 500;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .order-summary {
          background: var(--gray-50);
          padding: 20px;
          border-radius: 8px;
          margin-top: 24px;
        }

        .order-summary h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .summary-items {
          margin-bottom: 12px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 0.875rem;
          color: var(--gray-600);
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 2px solid var(--gray-300);
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--gray-900);
        }

        .btn-pay {
          width: 100%;
          margin-top: 24px;
          padding: 16px 32px;
          font-size: 1.125rem;
          font-weight: 600;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 56px;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .btn-pay:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(45, 140, 78, 0.3);
        }

        .btn-pay:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
