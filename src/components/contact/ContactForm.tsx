import { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { executeRecaptcha } from '../security/RecaptchaProvider';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

export default function ContactForm() {
  const { isEnglish } = useI18n();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Execute reCAPTCHA
      const recaptchaToken = await executeRecaptcha('contact_form');

      // Verify reCAPTCHA
      const verifyResponse = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: recaptchaToken, action: 'contact_form' }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        throw new Error(isEnglish ? 'Security verification failed' : 'Verificación de seguridad fallida');
      }

      // Submit contact form
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
          language: isEnglish ? 'en' : 'es',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (isEnglish ? 'Failed to send message' : 'Error al enviar mensaje'));
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);

    } catch (err: any) {
      console.error('Contact form error:', err);
      setError(err.message || (isEnglish ? 'An error occurred' : 'Ocurrió un error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-container">
      <div className="contact-form-header">
        <h2>{isEnglish ? 'Send Us a Message' : 'Envíanos un Mensaje'}</h2>
        <p>{isEnglish ? 'Fill out the form below and we\'ll get back to you as soon as possible.' : 'Completa el formulario y te responderemos lo antes posible.'}</p>
      </div>

      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">
              {isEnglish ? 'Full Name' : 'Nombre Completo'} <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder={isEnglish ? 'John Doe' : 'Juan Pérez'}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              {isEnglish ? 'Email' : 'Correo Electrónico'} <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder={isEnglish ? 'john@example.com' : 'juan@ejemplo.com'}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">
              {isEnglish ? 'Phone Number' : 'Número de Teléfono'}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(813) 373-6467"
            />
          </div>

          <div className="form-group">
            <label htmlFor="company">
              {isEnglish ? 'Company' : 'Empresa'}
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder={isEnglish ? 'Your Company' : 'Tu Empresa'}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="message">
            {isEnglish ? 'Message' : 'Mensaje'} <span className="required">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            placeholder={isEnglish ? 'Tell us about your project or inquiry...' : 'Cuéntanos sobre tu proyecto o consulta...'}
          />
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {isEnglish 
              ? 'Thank you! Your message has been sent successfully. We\'ll contact you soon.' 
              : '¡Gracias! Tu mensaje ha sido enviado exitosamente. Te contactaremos pronto.'}
          </div>
        )}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading 
            ? (isEnglish ? 'Sending...' : 'Enviando...') 
            : (isEnglish ? 'Send Message' : 'Enviar Mensaje')}
        </button>

        <p className="recaptcha-notice">
          {isEnglish 
            ? 'This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.' 
            : 'Este sitio está protegido por reCAPTCHA y se aplican la Política de Privacidad y los Términos de Servicio de Google.'}
        </p>
      </form>

      <style>{`
        .contact-form-container {
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .contact-form-header {
          margin-bottom: 32px;
        }

        .contact-form-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 8px;
        }

        .contact-form-header p {
          color: var(--gray-600);
          font-size: 16px;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 600;
          font-size: 14px;
          color: var(--gray-700);
        }

        .required {
          color: var(--red);
        }

        .form-group input,
        .form-group textarea {
          padding: 12px 16px;
          border: 2px solid var(--gray-200);
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--green);
          box-shadow: 0 0 0 3px rgba(45, 140, 78, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        .alert {
          padding: 14px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .alert-error {
          background: #FEE;
          border: 1px solid var(--red);
          color: var(--red);
        }

        .alert-success {
          background: var(--green-pale);
          border: 1px solid var(--green);
          color: var(--green-dark);
        }

        .btn-submit {
          padding: 14px 32px;
          background: var(--green);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-submit:hover:not(:disabled) {
          background: var(--green-dark);
          transform: translateY(-1px);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .recaptcha-notice {
          font-size: 12px;
          color: var(--gray-500);
          text-align: center;
          margin-top: -8px;
        }

        @media (max-width: 768px) {
          .contact-form-container {
            padding: 24px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .contact-form-header h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
