import { useEffect, useState } from 'react';
import i18n from '../../i18n/config';

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    // Initialize with current language
    setCurrentLang(i18n.language || 'en');

    const handleLanguageChange = (lng: string) => {
      setCurrentLang(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    // Dispatch custom event for non-React components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  };

  return (
    <div className="lang-selector">
      <button
        onClick={() => changeLanguage('es')}
        className={`lang-link ${currentLang === 'es' ? 'active' : ''}`}
        aria-label="Cambiar a Español"
      >
        ES
      </button>
      <span style={{ color: 'var(--gray-300)', margin: '0 4px' }}>|</span>
      <button
        onClick={() => changeLanguage('en')}
        className={`lang-link ${currentLang === 'en' ? 'active' : ''}`}
        aria-label="Switch to English"
      >
        EN
      </button>

      <style>{`
        .lang-selector {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .lang-link {
          background: none;
          border: none;
          color: var(--gray-600);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          transition: color 0.2s;
          font-family: inherit;
        }

        .lang-link:hover {
          color: var(--green);
        }

        .lang-link.active {
          color: var(--green);
        }
      `}</style>
    </div>
  );
}
