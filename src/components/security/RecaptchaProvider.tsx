import { useEffect } from 'react';

interface RecaptchaProviderProps {
  siteKey: string;
  children: React.ReactNode;
}

export default function RecaptchaProvider({ siteKey, children }: RecaptchaProviderProps) {
  useEffect(() => {
    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(script);
    };
  }, [siteKey]);

  return <>{children}</>;
}

/**
 * Execute reCAPTCHA and get token
 * @param action - The action name for this reCAPTCHA execution
 * @returns Promise with the reCAPTCHA token
 */
export async function executeRecaptcha(action: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.grecaptcha) {
      reject(new Error('reCAPTCHA not loaded'));
      return;
    }

    window.grecaptcha.ready(() => {
      const siteKey = import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY;
      
      window.grecaptcha.execute(siteKey, { action }).then(
        (token: string) => resolve(token),
        (error: Error) => reject(error)
      );
    });
  });
}

// Type definitions for grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}
