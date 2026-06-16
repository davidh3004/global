import { useEffect, useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/client';

interface SiteConfig {
  email?: string;
  phone: string;
  address: string;
  hours: string;
  hoursEs: string;
  googleMapsUrl: string;
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
}

interface ContactSectionProps {
  lang: string;
}

export default function ContactSection({ lang }: ContactSectionProps) {
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
            googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3522.9!2d-82.4801!3d27.9897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88c2c768d1a8e999%3A0x1234!2s5011+N+Clark+Ave%2C+Tampa%2C+FL+33614!5e0!3m2!1sen!2sus!4v1684000000000',
            socialMedia: {
              instagram: '',
              facebook: '',
              twitter: ''
            }
          });
        }
      } catch (error) {
        console.error('Error loading site config:', error);
        // Use fallback on error
        setConfig({
          phone: '(813) 373-6467',
          address: '5011 N. Clark St., Tampa, FL 33614',
          hours: 'Mon–Sat 7:00am – 5:00pm',
          hoursEs: 'Lun–Sáb 7:00am – 5:00pm',
          googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3522.9!2d-82.4801!3d27.9897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88c2c768d1a8e999%3A0x1234!2s5011+N+Clark+Ave%2C+Tampa%2C+FL+33614!5e0!3m2!1sen!2sus!4v1684000000000',
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

  // Trigger fade animations after component renders
  useEffect(() => {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const fadeElements = document.querySelectorAll('.contact .fade');
      fadeElements.forEach((el) => {
        if (!el.classList.contains('in')) {
          el.classList.add('in');
        }
      });
    }, 100);
  }, [config]);

  // Use default data if config is not loaded yet
  const currentConfig = config || {
    phone: '(813) 373-6467',
    address: '5011 N. Clark St., Tampa, FL 33614',
    hours: 'Mon–Sat 7:00am – 5:00pm',
    hoursEs: 'Lun–Sáb 7:00am – 5:00pm',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3522.9!2d-82.4801!3d27.9897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88c2c768d1a8e999%3A0x1234!2s5011+N+Clark+Ave%2C+Tampa%2C+FL+33614!5e0!3m2!1sen!2sus!4v1684000000000',
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: ''
    }
  };

  const hours = isEnglish ? currentConfig.hours : (currentConfig.hoursEs || currentConfig.hours);
  const phoneLink = currentConfig.phone.replace(/[^0-9]/g, '');
  const addressLines = currentConfig.address.split(',');
  const addressLine1 = addressLines[0]?.trim() || '';
  const addressLine2 = addressLines.slice(1).join(',').trim() || '';

  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="sec-tag fade">
          <div className="sec-tag-line"></div>
          {isEnglish ? 'Find Us' : 'Encuéntranos'}
        </div>
        <h2 className="sec-title fade fade-d1" style={{ marginBottom: '32px' }}>
          {isEnglish ? 'Visit Our' : 'Visita Nuestras'} <span>{isEnglish ? 'Facility' : 'Instalaciones'}</span>
        </h2>
        <div className="contact-grid">
          <div className="contact-map fade">
            <iframe 
              src={currentConfig.googleMapsUrl}
              allowFullScreen 
              loading="lazy"
            ></iframe>
          </div>
          <div className="info-grid fade fade-d1">
            <div className="info-card">
              <div className="info-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className="info-lbl">{isEnglish ? 'Location' : 'Ubicación'}</div>
              <div className="info-val">
                {addressLine1}<br/>{addressLine2}
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </div>
              <div className="info-lbl">{isEnglish ? 'Phone' : 'Teléfono'}</div>
              <div className="info-val">
                <a href={`tel:${phoneLink}`}>{currentConfig.phone}</a>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="info-lbl">{isEnglish ? 'Hours' : 'Horario'}</div>
              <div className="info-val" dangerouslySetInnerHTML={{ __html: hours }}></div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div className="info-lbl">{isEnglish ? 'Follow Us' : 'Síguenos'}</div>
              <div className="info-val" style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {currentConfig.email && (
                  <a 
                    href={`mailto:${currentConfig.email}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'var(--green)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
                  >
                    {currentConfig.email}
                  </a>
                )}
                {currentConfig.socialMedia.instagram && (
                  <a 
                    href={currentConfig.socialMedia.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'var(--green)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Instagram
                  </a>
                )}
                {currentConfig.socialMedia.facebook && (
                  <a 
                    href={currentConfig.socialMedia.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'var(--green)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Facebook
                  </a>
                )}
                {currentConfig.socialMedia.twitter && (
                  <a 
                    href={currentConfig.socialMedia.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'var(--green)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Twitter
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
