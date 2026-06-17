/**
 * Photo Gallery Component
 * Displays a grid of photos from Firestore
 */

import React, { useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';

interface Photo {
  id: string;
  url: string;
  createdAt: any;
}

export default function PhotoGallery() {
  const { isEnglish } = useI18n();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    // Check if all images are loaded
    if (photos.length > 0 && imagesLoaded.size === photos.length) {
      setAllImagesLoaded(true);
    }
  }, [imagesLoaded, photos.length]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/gallery');
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = (photoId: string) => {
    setImagesLoaded(prev => new Set(prev).add(photoId));
  };

  if (loading) {
    return (
      <section className="gallery-section">
        <div className="container">
          <header className="gallery-head">
            <div className="sec-tag">
              <div className="sec-tag-line"></div>
              <span>{isEnglish ? 'Gallery' : 'Galería'}</span>
            </div>
            <h2 className="sec-title">
              {isEnglish ? 'Our Work in Action' : 'Nuestro Trabajo en Acción'}
            </h2>
          </header>
          <div className="gallery-loading">
            {isEnglish ? 'Loading photos...' : 'Cargando fotos...'}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="gallery-section">
        <div className="container">
          <header className="gallery-head">
            <div className="sec-tag">
              <div className="sec-tag-line"></div>
              <span>{isEnglish ? 'Gallery' : 'Galería'}</span>
            </div>
            <h2 className="sec-title">
              {isEnglish ? 'Our Work in Action' : 'Nuestro Trabajo en Acción'}
            </h2>
          </header>
          
          {photos.length === 0 ? (
            <div className="gallery-empty">
              <div className="empty-icon">📸</div>
              <p className="empty-text">
                {isEnglish ? 'No photos yet. Check back soon!' : '¡Aún no hay fotos. Vuelve pronto!'}
              </p>
            </div>
          ) : (
          <div className="gallery-grid">
            {photos.map((photo, index) => {
              const isLoaded = imagesLoaded.has(photo.id);
              return (
                <div
                  key={photo.id}
                  className={`gallery-item ${isLoaded ? 'fade in fade-d' + ((index % 3) + 1) : 'gallery-item-loading'}`}
                  onClick={() => setSelectedPhoto(photo.url)}
                >
                  <img 
                    src={photo.url} 
                    alt={`Gallery ${index + 1}`} 
                    loading="eager"
                    onLoad={() => handleImageLoad(photo.id)}
                    onError={(e) => {
                      console.error('Error loading image:', photo.url);
                      handleImageLoad(photo.id); // Mark as loaded even on error
                    }}
                  />
                  <div className="gallery-overlay">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                      <path d="M11 8v6"/>
                      <path d="M8 11h6"/>
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="gallery-lightbox" onClick={() => setSelectedPhoto(null)}>
          <button className="lightbox-close" onClick={() => setSelectedPhoto(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <img src={selectedPhoto} alt="Full size" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <style>{`
        .gallery-section {
          padding: 80px 0;
          background: var(--gray-50);
        }

        .gallery-loading {
          text-align: center;
          padding: 40px;
          color: var(--gray-600);
        }

        .gallery-empty {
          text-align: center;
          padding: 60px 20px;
          margin-top: 40px;
          background: white;
          border-radius: 16px;
          border: 2px dashed var(--gray-300);
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .empty-text {
          font-size: 18px;
          color: var(--gray-600);
          margin: 0;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .gallery-item {
          position: relative;
          aspect-ratio: 4/3;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s ease;
          background: var(--gray-200);
        }

        .gallery-item-loading {
          position: relative;
          aspect-ratio: 4/3;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          background: var(--gray-200);
          opacity: 0;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .gallery-item:hover {
          transform: translateY(-4px);
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .gallery-item-loading img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0;
        }

        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: rgba(45, 140, 78, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .gallery-item:hover .gallery-overlay {
          opacity: 1;
        }

        .gallery-overlay svg {
          width: 48px;
          height: 48px;
          color: white;
        }

        .gallery-lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          cursor: pointer;
        }

        .gallery-lightbox img {
          max-width: 90%;
          max-height: 90%;
          object-fit: contain;
          cursor: default;
        }

        .lightbox-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .lightbox-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .lightbox-close svg {
          width: 24px;
          height: 24px;
          color: white;
        }

        @media (max-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 12px;
          }

          .gallery-section {
            padding: 60px 0;
          }
        }
      `}</style>
    </>
  );
}
