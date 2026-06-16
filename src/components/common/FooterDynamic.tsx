import { useEffect, useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/client';
import { t } from '../../utils/i18n';

interface SiteConfig {
  phone: string;
  address: string;
  hours: string;
  hoursEs: string;
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
}

interface FooterDynamicProps {
  lang: string;
}

export default function FooterDynamic({ lang }: FooterDynamicProps) {
  const { isEnglish } = useI18n();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      try {
        const docRef = doc(db, 'siteConfig', 'main');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setConfig(docSnap.data() as SiteConfig);
        } else {
          // Fallback data
          setConfig({
            phone: '(813) 373-6467',
            address: '5011 N. Clark St., Tampa, FL 33614',
            hours: 'Mon–Sat 7:00am – 5:00pm',
            hoursEs: 'Lun–Sáb 7:00am – 5:00pm',
            socialMedia: {
              instagram: '',
              facebook: '',
              twitter: ''
            }
          });
        }
      } catch (error) {
        console.error('Error loading site config:', error);
        setConfig({
          phone: '(813) 373-6467',
          address: '5011 N. Clark St., Tampa, FL 33614',
          hours: 'Mon–Sat 7:00am – 5:00pm',
          hoursEs: 'Lun–Sáb 7:00am – 5:00pm',
          socialMedia: {
            instagram: '',
            facebook: '',
            twitter: ''
          }
        });
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  // Set default config immediately to avoid blank footer
  if (!config) {
    return (
      <footer>
        <div className="footer-grid">
          <div>
            <a href="/#hero">
              <img src="/logo.png" style={{ height: '52px', width: 'auto' }} alt="Global Recycling of Tampa Bay"/>
            </a>
            <p className="footer-desc">{t('footer.description', lang)}</p>
            <div className="footer-social"></div>
          </div>
          <div>
            <div className="footer-col-title">{isEnglish ? 'Navigation' : 'Navegación'}</div>
            <ul className="footer-links">
              <li><a href="/#hero">{isEnglish ? 'Home' : 'Inicio'}</a></li>
              <li><a href="/#products">{isEnglish ? 'Materials' : 'Materiales'}</a></li>
              <li><a href="/roll-off-service">{isEnglish ? 'Roll-Off Service' : 'Servicio Roll-Off'}</a></li>
              <li><a href="/information">{isEnglish ? 'Information' : 'Información'}</a></li>
              <li><a href="/calculating-your-project">{isEnglish ? 'Calculating Your Project' : 'Calcula Tu Proyecto'}</a></li>
              <li><a href="/weigh-your-truck">{isEnglish ? 'Weigh Your Truck' : 'Pesa Tu Camión'}</a></li>
              <li><a href="/credit-card-authorization">{isEnglish ? 'Credit Card Authorization' : 'Autorización de Tarjeta'}</a></li>
              <li><a href="/#about">{isEnglish ? 'About Us' : 'Nosotros'}</a></li>
              <li><a href="/#contact">{isEnglish ? 'Contact' : 'Contacto'}</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">{t('footer.materials', lang)}</div>
            <ul className="footer-links">
              <li><a href="#">Loading...</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">{t('footer.contact', lang)}</div>
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Loading...</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">{t('footer.copyright', lang)}</div>
          <div className="footer-built">{t('footer.builtBy', lang)}</div>
        </div>
      </footer>
    );
  }

  const basePath = isEnglish ? '/en' : '';
  const hours = isEnglish ? config.hours : (config.hoursEs || config.hours);
  const phoneLink = config.phone.replace(/[^0-9]/g, '');
  const addressLines = config.address.split(',');
  const addressLine1 = addressLines[0]?.trim() || '';
  const addressLine2 = addressLines.slice(1).join(',').trim() || '';

  return (
    <footer>
      <div className="footer-grid">
        <div>
          <a href="/#hero">
            <img src="/logo.png" style={{ height: '52px', width: 'auto' }} alt="Global Recycling of Tampa Bay"/>
          </a>
          <p className="footer-desc">{isEnglish ? '"The World Is Yours" — Tampa Bay\'s trusted recycled concrete, asphalt, and aggregate supplier since 1990. Owned by Max & Denise Sanchez.' : '"El Mundo Es Tuyo" — Proveedor confiable de concreto reciclado, asfalto y agregados de Tampa Bay desde 1990. Propiedad de Max y Denise Sánchez.'}</p>
          <div className="footer-social">
            {config.socialMedia.instagram && (
              <a 
                href={config.socialMedia.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="soc-btn"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            )}
            {config.socialMedia.facebook && (
              <a 
                href={config.socialMedia.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="soc-btn"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
            )}
            {config.socialMedia.twitter && (
              <a 
                href={config.socialMedia.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="soc-btn"
                aria-label="Twitter"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
        <div>
          <div className="footer-col-title">{isEnglish ? 'Navigation' : 'Navegación'}</div>
          <ul className="footer-links">
            <li><a href="/#hero">{isEnglish ? 'Home' : 'Inicio'}</a></li>
            <li><a href="/#products">{isEnglish ? 'Materials' : 'Materiales'}</a></li>
            <li><a href="/roll-off-service">{isEnglish ? 'Roll-Off Service' : 'Servicio Roll-Off'}</a></li>
            <li><a href="/information">{isEnglish ? 'Information' : 'Información'}</a></li>
            <li><a href="/calculating-your-project">{isEnglish ? 'Calculating Your Project' : 'Calcula Tu Proyecto'}</a></li>
            <li><a href="/weigh-your-truck">{isEnglish ? 'Weigh Your Truck' : 'Pesa Tu Camión'}</a></li>
            <li><a href="/credit-card-authorization">{isEnglish ? 'Credit Card Authorization' : 'Autorización de Tarjeta'}</a></li>
            <li><a href="/#about">{isEnglish ? 'About Us' : 'Nosotros'}</a></li>
            <li><a href="/#contact">{isEnglish ? 'Contact' : 'Contacto'}</a></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">{t('footer.contact', lang)}</div>
          <div className="footer-contact-item">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>
              {addressLine1}<br/>{addressLine2}
            </span>
          </div>
          <div className="footer-contact-item">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
            <span>
              <a href={`tel:${phoneLink}`}>{config.phone}</a>
            </span>
          </div>
          <div className="footer-contact-item">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span dangerouslySetInnerHTML={{ __html: hours }}></span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">{t('footer.copyright', lang)}</div>
        <div className="footer-built">{t('footer.builtBy', lang)}</div>
      </div>
    </footer>
  );
}
