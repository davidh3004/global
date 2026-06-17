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
    <section className="contact" id="contact" style={{ padding: '80px 0', background: '#f8f9fa' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="sec-tag fade" style={{ color: 'var(--green)', fontFamily: "'Oswald', 'Arial Narrow', sans-serif", fontWeight: 600, letterSpacing: '2px', fontSize: '14px', marginBottom: '12px' }}>
            {isEnglish ? 'FIND US' : 'ENCUÉNTRANOS'}
          </div>
          <h2 className="sec-title fade fade-d1" style={{ fontFamily: "'Oswald', 'Arial Narrow', sans-serif", fontSize: '42px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-dark)' }}>
            {isEnglish ? 'SERVING TAMPA BAY & BEYOND' : 'SIVIENDO A TAMPA BAY Y MÁS ALLÁ'}
          </h2>
        </div>
        
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', alignItems: 'start' }}>
          
          <div className="info-grid fade fade-d1" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="info-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', border: 'none', background: 'transparent', padding: 0 }}>
              <div className="info-icon" style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <div className="info-val" style={{ color: 'var(--gray-800)', fontSize: '15px', lineHeight: 1.5 }}>
                  {addressLine1}<br/>{addressLine2}
                </div>
              </div>
            </div>
            
            <div className="info-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', border: 'none', background: 'transparent', padding: 0 }}>
              <div className="info-icon" style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }}>
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </div>
              <div>
                <div className="info-val" style={{ color: 'var(--gray-800)', fontSize: '15px', lineHeight: 1.5 }}>
                  <a href={`tel:${phoneLink}`} style={{ color: 'inherit', textDecoration: 'none' }}>{currentConfig.phone}</a>
                </div>
              </div>
            </div>
            
            <div className="info-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', border: 'none', background: 'transparent', padding: 0 }}>
              <div className="info-icon" style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }}>
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <div className="info-val" dangerouslySetInnerHTML={{ __html: hours }} style={{ color: 'var(--gray-800)', fontSize: '15px', lineHeight: 1.5 }}></div>
              </div>
            </div>

            {currentConfig.email && (
            <div className="info-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', border: 'none', background: 'transparent', padding: 0 }}>
              <div className="info-icon" style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <div className="info-val" style={{ color: 'var(--gray-800)', fontSize: '15px', lineHeight: 1.5 }}>
                  <a href={`mailto:${currentConfig.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{currentConfig.email}</a>
                </div>
              </div>
            </div>
            )}
            
            <div className="info-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', border: 'none', background: 'transparent', padding: 0 }}>
              <div className="info-icon" style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }}>
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </div>
              <div>
                <div className="info-val" style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  {currentConfig.socialMedia.instagram && (
                    <a href={currentConfig.socialMedia.instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gray-600)', textDecoration: 'none' }}>IG</a>
                  )}
                  {currentConfig.socialMedia.facebook && (
                    <a href={currentConfig.socialMedia.facebook} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gray-600)', textDecoration: 'none' }}>FB</a>
                  )}
                  {currentConfig.socialMedia.twitter && (
                    <a href={currentConfig.socialMedia.twitter} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gray-600)', textDecoration: 'none' }}>TW</a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="contact-map fade" style={{ height: '440px', border: 'none', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 16px 40px rgba(7,26,16,0.12)' }}>
            <iframe 
              src={currentConfig.googleMapsUrl}
              allowFullScreen 
              loading="lazy"
              style={{ width: '100%', height: '100%', border: 'none' }}
            ></iframe>
          </div>

        </div>
      </div>
    </section>
  );

}
