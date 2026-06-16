import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/client';
import i18n from '../../i18n/config';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [translations, setTranslations] = useState<any>({});

  useEffect(() => {
    // Load initial translations
    updateTranslations();

    // Listen for language changes
    const handleLanguageChange = () => {
      updateTranslations();
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const updateTranslations = () => {
    setTranslations({
      login: i18n.t('auth.login'),
      email: i18n.t('auth.email'),
      password: i18n.t('auth.password'),
      signIn: i18n.t('auth.signIn'),
      forgotPassword: i18n.t('auth.forgotPassword'),
      noAccount: i18n.t('auth.noAccount'),
      register: i18n.t('auth.register'),
      backToSite: i18n.t('auth.backToSite'),
      accessAccount: i18n.language === 'es' ? 'Accede a tu cuenta o regístrate' : 'Access your account or register',
      errorInvalidCredentials: i18n.language === 'es' ? 'Credenciales inválidas' : 'Invalid credentials',
      errorUserNotFound: i18n.language === 'es' ? 'Usuario no encontrado' : 'User not found',
      errorWrongPassword: i18n.language === 'es' ? 'Contraseña incorrecta' : 'Incorrect password',
      errorInvalidEmail: i18n.language === 'es' ? 'Correo electrónico inválido' : 'Invalid email address',
      errorUserDisabled: i18n.language === 'es' ? 'Esta cuenta ha sido deshabilitada' : 'This account has been disabled',
      errorGeneric: i18n.language === 'es' ? 'Ocurrió un error. Inténtalo de nuevo.' : 'An error occurred. Please try again.',
      signingIn: i18n.language === 'es' ? 'Iniciando sesión...' : 'Signing in...'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get ID token with custom claims
      const tokenResult = await user.getIdTokenResult(true);
      const role = tokenResult.claims.role as string | undefined;

      // Redirect based on role
      if (role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/client/dashboard';
      }
    } catch (err: any) {
      let errorMsg = translations.errorGeneric;
      
      if (err.code === 'auth/user-not-found') {
        errorMsg = translations.errorUserNotFound;
      } else if (err.code === 'auth/wrong-password') {
        errorMsg = translations.errorWrongPassword;
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = translations.errorInvalidEmail;
      } else if (err.code === 'auth/user-disabled') {
        errorMsg = translations.errorUserDisabled;
      } else if (err.code === 'auth/invalid-credential') {
        errorMsg = translations.errorInvalidCredentials;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2 className="auth-title">{translations.login}</h2>
      <p className="auth-subtitle">{translations.accessAccount}</p>

      {error && (
        <div className="error-box show">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            {translations.email}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
            placeholder="tu@email.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            {translations.password}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
            placeholder="••••••••"
          />
        </div>

        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
          <a href="/client/forgot-password" className="link" style={{ fontSize: '0.875rem' }}>
            {translations.forgotPassword}
          </a>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? translations.signingIn : translations.signIn}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
        {translations.noAccount}{' '}
        <a href="/client/register" className="link">
          {translations.register}
        </a>
      </p>
      
      <p style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
        <a href="/" className="link">
          ← {translations.backToSite}
        </a>
      </p>

      <style>{`
        .auth-form-container {
          max-width: 400px;
          margin: 0 auto;
        }

        .auth-title {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .auth-subtitle {
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 2rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.2s;
          background: white;
          box-sizing: border-box;
        }
        
        .form-input:focus {
          outline: none;
          border-color: var(--green);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        
        .form-input::placeholder {
          color: #9ca3af;
        }
        
        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }
        
        .form-group {
          margin-bottom: 1.25rem;
        }
        
        .btn-submit {
          width: 100%;
          padding: 0.875rem;
          background: var(--green);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-submit:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .btn-submit:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          transform: none;
        }
        
        .error-box {
          background: #fee2e2;
          color: #991b1b;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          display: none;
        }
        
        .error-box.show {
          display: block;
        }
        
        .link {
          color: var(--green);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .link:hover {
          color: #059669;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
