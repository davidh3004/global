import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase/client';
import type { Review } from '../../firebase/types';
import { useI18n } from '../../hooks/useI18n';

interface Props {
  lang?: string;
}

export default function ReviewsSection({ lang = 'en' }: Props) {
  const { isEnglish } = useI18n();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('isApproved', '==', true),
          orderBy('date', 'desc'),
          limit(3)
        );
        
        const querySnapshot = await getDocs(q);
        const reviewsData: Review[] = [];
        
        querySnapshot.forEach((doc) => {
          reviewsData.push({ id: doc.id, ...doc.data() } as Review);
        });
        
        setReviews(reviewsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(isEnglish ? 'Error loading reviews' : 'Error al cargar reseñas');
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} className="star" viewBox="0 0 24 24">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
    ));
  };

  if (loading) {
    return (
      <section className="reviews">
        <div className="container">
          <div className="sec-tag"><div className="sec-tag-line"></div>{isEnglish ? 'Customer Reviews' : 'Reseñas de Clientes'}</div>
          <h2 className="sec-title">{isEnglish ? 'What Our' : 'Lo Que Dicen Nuestros'} <span>{isEnglish ? 'Clients' : 'Clientes'}</span> {isEnglish ? 'Say' : ''}</h2>
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
            {isEnglish ? 'Loading reviews...' : 'Cargando reseñas...'}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="reviews">
        <div className="container">
          <div className="sec-tag"><div className="sec-tag-line"></div>{isEnglish ? 'Customer Reviews' : 'Reseñas de Clientes'}</div>
          <h2 className="sec-title">{isEnglish ? 'What Our' : 'Lo Que Dicen Nuestros'} <span>{isEnglish ? 'Clients' : 'Clientes'}</span> {isEnglish ? 'Say' : ''}</h2>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--red)' }}>
            {error}
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="reviews">
        <div className="container">
          <div className="sec-tag"><div className="sec-tag-line"></div>{isEnglish ? 'Customer Reviews' : 'Reseñas de Clientes'}</div>
          <h2 className="sec-title">{isEnglish ? 'What Our' : 'Lo Que Dicen Nuestros'} <span>{isEnglish ? 'Clients' : 'Clientes'}</span> {isEnglish ? 'Say' : ''}</h2>
          <div style={{ padding: '60px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
              {isEnglish ? 'No reviews available' : 'No hay reseñas disponibles'}
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
              {isEnglish ? 'Approved reviews will be displayed here once they are added from the admin panel.' : 'Las reseñas aprobadas se mostrarán aquí una vez que sean agregadas desde el panel de administración.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="reviews">
      <div className="container">
        <div className="sec-tag"><div className="sec-tag-line"></div>{isEnglish ? 'Customer Reviews' : 'Reseñas de Clientes'}</div>
        <h2 className="sec-title">{isEnglish ? 'What Our' : 'Lo Que Dicen Nuestros'} <span>{isEnglish ? 'Clients' : 'Clientes'}</span> {isEnglish ? 'Say' : ''}</h2>
        <div className="rev-grid">
          {reviews.map((review, index) => (
            <div key={review.id} className="rev-card">
              <div className="rev-stars">
                {renderStars(review.rating)}
              </div>
              <div className="rev-text">"{review.content}"</div>
              <div className="rev-author">
                <div className="rev-av">{review.authorInitials}</div>
                <div>
                  <div className="rev-name">{review.author}</div>
                  <div className="rev-meta">{review.source || 'Customer Review'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
