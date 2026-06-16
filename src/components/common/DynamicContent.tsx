import { useEffect, useState, createElement } from 'react';
import i18n from '../../i18n/config';

interface DynamicContentProps {
  translationKey: string;
  tag?: string;
  className?: string;
  style?: React.CSSProperties;
  dangerouslySetInnerHTML?: boolean;
}

export default function DynamicContent({ 
  translationKey, 
  tag = 'span',
  className,
  style,
  dangerouslySetInnerHTML = false
}: DynamicContentProps) {
  const [content, setContent] = useState('');

  useEffect(() => {
    // Load initial translation
    updateContent();

    // Listen for language changes
    const handleLanguageChange = () => {
      updateContent();
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [translationKey]);

  const updateContent = () => {
    setContent(i18n.t(translationKey));
  };

  if (dangerouslySetInnerHTML) {
    return createElement(tag, {
      className,
      style,
      dangerouslySetInnerHTML: { __html: content }
    });
  }

  return createElement(tag, { className, style }, content);
}
