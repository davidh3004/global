import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase/client';

interface LearningArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  order: number;
}

interface Props {
  lang?: string;
}

import { useI18n } from '../../hooks/useI18n';

export default function LearningSection({ lang = 'en' }: Props) {
  const { isEnglish } = useI18n();
  const [articles, setArticles] = useState<LearningArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        console.log('[LearningSection] Fetching articles...');
        
        // Query without orderBy to avoid index requirement
        const q = query(
          collection(db, 'learningArticles'),
          where('isPublished', '==', true),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        console.log('[LearningSection] Query snapshot size:', querySnapshot.size);
        
        const articlesData: LearningArticle[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('[LearningSection] Article:', doc.id, data);
          console.log('[LearningSection] Article fields:', {
            title: data.title,
            slug: data.slug,
            category: data.category,
            excerpt: data.excerpt,
            imageUrl: data.imageUrl,
            order: data.order,
            isPublished: data.isPublished
          });
          articlesData.push({ id: doc.id, ...data } as LearningArticle);
        });
        
        // Sort manually by order
        articlesData.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // Take only first 3
        const limitedArticles = articlesData.slice(0, 3);
        
        console.log('[LearningSection] Articles loaded:', limitedArticles.length);
        setArticles(limitedArticles);
        setLoading(false);
      } catch (err: any) {
        console.error('[LearningSection] Error fetching articles:', err);
        setError(err.message || 'Error loading articles');
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Trigger fade animations after articles are loaded
  useEffect(() => {
    if (articles.length > 0) {
      console.log('[LearningSection] Triggering fade animations');
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const fadeElements = document.querySelectorAll('.learning .fade');
        fadeElements.forEach((el) => {
          (el as HTMLElement).style.opacity = '1';
          (el as HTMLElement).style.transform = 'translateY(0)';
        });
      }, 100);
    }
  }, [articles]);

  if (loading) {
    return (
      <section className="learning" id="learning">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#2d8c4e', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ marginTop: '20px', color: '#6b7280' }}>Cargando artículos...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="learning" id="learning">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: '#ef4444', fontWeight: 600 }}>Error al cargar artículos</p>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '8px' }}>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className="learning" id="learning">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: '#6b7280' }}>
              {isEnglish ? 'No articles available yet.' : 'No hay artículos disponibles aún.'}
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '8px' }}>
              {isEnglish ? 'Check back soon for new content!' : '¡Vuelve pronto para nuevo contenido!'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  console.log('[LearningSection] Rendering with articles:', articles.length);
  
  return (
    <section className="learning" id="learning">
      <div className="container">
        <div className="sec-tag fade">
          <div className="sec-tag-line"></div>
          {isEnglish ? 'Learning Center' : 'Centro de Aprendizaje'}
        </div>
        <h2 className="sec-title fade fade-d1">
          {isEnglish ? 'Learn About ' : 'Aprende Sobre '}
          <span>{isEnglish ? 'Recycled Materials' : 'Materiales Reciclados'}</span>
        </h2>
        <p className="sec-lead fade fade-d2">
          {isEnglish 
            ? 'Discover the benefits and applications of recycled construction materials' 
            : 'Descubre los beneficios y aplicaciones de los materiales de construcción reciclados'}
        </p>
        <div className="art-grid">
          {articles.length > 0 ? (
            articles.map((article, index) => {
              console.log('[LearningSection] Rendering article:', article.title);
              return (
                <div key={article.id} className={`art-card fade ${index > 0 ? `fade-d${index}` : ''}`}>
                  <div className="art-img">
                    <img src={article.imageUrl} alt={article.title} loading="lazy" />
                  </div>
                  <div className="art-body">
                    <div className="art-tag">{article.category}</div>
                    <div className="art-title">{article.title}</div>
                    <div className="art-desc">{article.excerpt}</div>
                    <a 
                      href={isEnglish ? `/en/learning/${article.slug}` : `/aprendizaje/${article.slug}`} 
                      className="art-link"
                    >
                      {isEnglish ? 'Read More' : 'Leer Más'} →
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ color: '#6b7280', textAlign: 'center', width: '100%' }}>
              DEBUG: No articles to render
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
