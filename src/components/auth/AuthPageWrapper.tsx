/**
 * AuthPageWrapper - DEPRECATED
 * Este componente requiere react-i18next que no está instalado.
 * Actualmente no se usa en el proyecto.
 * Se mantiene comentado para referencia futura.
 */

/*
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../i18n/config';

interface AuthPageWrapperProps {
  children: (t: any, isEnglish: boolean) => React.ReactNode;
}

export default function AuthPageWrapper({ children }: AuthPageWrapperProps) {
  const { t, i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure i18n is initialized
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <div>Loading...</div>;
  }

  const isEnglish = i18n.language === 'en';

  return <>{children(t, isEnglish)}</>;
}
*/

// Placeholder export to avoid errors
export default function AuthPageWrapper() {
  return null;
}
