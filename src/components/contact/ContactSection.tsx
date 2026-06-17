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

const FALLBACK_CONFIG: SiteConfig = {
  email: 'max@starqualityinc.com',
  phone: '(813) 373-6467',
  address: '5011 N. Clark St., Tampa, FL 33614',
  hours: 'Mon–Sat 7:00am – 5:00pm',
  hoursEs: 'Lun–Sáb 7:00am – 5:00pm',
  googleMapsUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3522.9!2d-82.4801!3d27.9897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88c2c768d1a8e999%3A0x1234!2s5011+N+Clark+Ave%2C+Tampa%2C+FL+33614!5e0!3m2!1sen!2sus!4v1684000000000',
  socialMedia: {
    instagram: '',
    facebook: 'https://www.facebook.com/globalrecyclingtampabay',
    twitter: '',
  },
};

const LABELS = {
  en: {
    tag: 'FIND US',
    title: 'SERVING TAMPA BAY & BEYOND',
    location: 'LOCATION',
    phone: 'PHONE',
    hours: 'HOURS',
    follow: 'FOLLOW US',
    facebook: 'Facebook',
  },
  es: {
    tag: 'ENCUÉNTRANOS',
    title: 'SIRVIENDO A TAMPA BAY Y MÁS ALLÁ',
    location: 'UBICACIÓN',
    phone: 'TELÉFONO',
    hours: 'HORARIO',
    follow: 'SÍGUENOS',
    facebook: 'Facebook',
  },
};

export default function ContactSection({ lang }: ContactSectionProps) {
  const { isEnglish } = useI18n();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const copy = isEnglish ? LABELS.en : LABELS.es;

  useEffect(() => {
    async function loadConfig() {
      try {
        const docRef = doc(db, 'siteConfig', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig({ ...FALLBACK_CONFIG, ...docSnap.data() } as SiteConfig);
        } else {
          setConfig(FALLBACK_CONFIG);
        }
      } catch (error) {
        console.error('Error loading site config:', error);
        setConfig(FALLBACK_CONFIG);
      }
    }

    loadConfig();
  }, []);

  const currentConfig = config || FALLBACK_CONFIG;
  const hours = isEnglish ? currentConfig.hours : currentConfig.hoursEs || currentConfig.hours;
  const phoneLink = currentConfig.phone.replace(/[^0-9]/g, '');
  const addressLines = currentConfig.address.split(',');
  const addressLine1 = addressLines[0]?.trim() || '';
  const addressLine2 = addressLines.slice(1).join(',').trim() || '';
  const email = currentConfig.email || FALLBACK_CONFIG.email;
  const facebookUrl =
    currentConfig.socialMedia.facebook || FALLBACK_CONFIG.socialMedia.facebook;

  return (
    <section className="contact home-contact" id="contact">
      <div className="container">
        <header className="home-contact-head">
          <div className="home-contact-eyebrow">{copy.tag}</div>
          <div className="home-contact-title-row">
            <span className="home-contact-title-line" aria-hidden="true" />
            <h2 className="home-contact-title">{copy.title}</h2>
            <span className="home-contact-title-line" aria-hidden="true" />
          </div>
        </header>

        <div className="home-contact-grid">
          <div className="home-contact-cards">
            <article className="home-contact-card">
              <div className="home-contact-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="home-contact-card-lbl">{copy.location}</div>
              <div className="home-contact-card-val">
                {addressLine1}
                {addressLine2 ? (
                  <>
                    <br />
                    {addressLine2}
                  </>
                ) : null}
              </div>
            </article>

            <article className="home-contact-card">
              <div className="home-contact-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <div className="home-contact-card-lbl">{copy.phone}</div>
              <div className="home-contact-card-val is-accent">
                <a href={`tel:${phoneLink}`}>{currentConfig.phone}</a>
              </div>
            </article>

            <article className="home-contact-card">
              <div className="home-contact-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="home-contact-card-lbl">{copy.hours}</div>
              <div
                className="home-contact-card-val"
                dangerouslySetInnerHTML={{ __html: hours }}
              />
            </article>

            <article className="home-contact-card">
              <div className="home-contact-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className="home-contact-card-lbl">{copy.follow}</div>
              <div className="home-contact-card-val is-accent home-contact-follow">
                <a href={`mailto:${email}`}>{email}</a>
                {facebookUrl ? (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
                    {copy.facebook}
                  </a>
                ) : (
                  <span>{copy.facebook}</span>
                )}
              </div>
            </article>
          </div>

          <div className="home-contact-map">
            <iframe
              src={currentConfig.googleMapsUrl}
              allowFullScreen
              loading="lazy"
              title={
                isEnglish
                  ? 'Global Recycling of Tampa Bay location map'
                  : 'Mapa de ubicación de Global Recycling of Tampa Bay'
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
