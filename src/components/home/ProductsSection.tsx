import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase/client';
import type { Product } from '../../firebase/types';
import type { CartItem } from '../../types/cart';
import { useI18n } from '../../hooks/useI18n';

interface Props {
  lang?: string;
}

export default function ProductsSection({ lang = 'en' }: Props) {
  const { isEnglish } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Try with orderBy first, if fails (no index), fetch without ordering
        let q;
        try {
          q = query(
            collection(db, 'products'),
            where('isActive', '==', true),
            orderBy('order', 'asc'),
            limit(6)
          );
        } catch (indexError) {
          // Fallback: fetch without orderBy if index doesn't exist
          q = query(
            collection(db, 'products'),
            where('isActive', '==', true),
            limit(6)
          );
        }
        
        const querySnapshot = await getDocs(q);
        const productsData: Product[] = [];
        
        querySnapshot.forEach((doc) => {
          productsData.push({ id: doc.id, ...doc.data() } as Product);
        });
        
        // Sort manually if no orderBy was used
        productsData.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        setProducts(productsData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Error loading products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    try {
      console.log('[ProductsSection] Adding product to cart:', product);
      
      const cartItem: CartItem = {
        id: product.id!,
        name: product.name,
        price: product.price || 0,
        quantity: 1,
        image: product.imageUrl,
        description: product.description,
      };
      
      // Dispatch custom event for CartContext to listen
      window.dispatchEvent(new CustomEvent('addToCart', {
        detail: cartItem
      }));
      
      alert(isEnglish ? 'Added to cart!' : '¡Agregado al carrito!');
    } catch (error) {
      console.error('[ProductsSection] Error adding to cart:', error);
      alert(isEnglish ? 'Error adding to cart' : 'Error al agregar al carrito');
    }
  };

  if (loading) {
    return (
      <section className="shop products" id="products" style={{ padding: '100px 0', background: '#fff' }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', textAlign: 'center', color: 'var(--gray-600)' }}>
          {isEnglish ? 'Loading materials…' : 'Cargando materiales…'}
        </div>
      </section>
    );
  }

  if (error) {
    return null;
  }

  return (
    <section className="shop products" id="products" style={{ padding: '100px 0', background: '#fff' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
          
          {/* Left Text Column */}
          <div style={{ flex: '1 1 350px', maxWidth: '400px' }}>
            <div style={{ color: 'var(--green)', fontFamily: "'Oswald', 'Arial Narrow', sans-serif", fontWeight: 600, letterSpacing: '2px', fontSize: '14px', marginBottom: '16px' }}>
              {isEnglish ? 'MATERIALS WE SELL' : 'MATERIALES QUE VENDEMOS'}
            </div>
            <h2 style={{ fontFamily: "'Oswald', 'Arial Narrow', sans-serif", fontSize: '42px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-dark)', lineHeight: 1.1, marginBottom: '24px' }}>
              {isEnglish ? 'HIGH-QUALITY MATERIALS FOR YOUR PROJECTS' : 'MATERIALES DE ALTA CALIDAD PARA SUS PROYECTOS'}
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: '32px' }}>
              {isEnglish ? 'We supply a wide range of recycled materials for construction and landscaping needs.' : 'Suministramos una amplia gama de materiales reciclados para necesidades de construcción y paisajismo.'}
            </p>
            <a href={isEnglish ? '/en/materials' : '/materiales'} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '15px 30px', background: 'var(--green)', color: '#fff', fontFamily: "'Oswald', 'Arial Narrow', sans-serif", fontWeight: 600, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '7px', boxShadow: '0 10px 26px rgba(47,158,84,0.30)' }}>
              {isEnglish ? 'VIEW ALL MATERIALS' : 'VER TODOS LOS MATERIALES'} →
            </a>
          </div>

          {/* Right Grid Column */}
          <div style={{ flex: '2 1 600px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
              {products.map((product, index) => (
                <div key={product.id} style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: 'none', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 28px rgba(7,26,16,0.09)' }}>
                  <div style={{ height: '150px', overflow: 'hidden' }}>
                    <img src={product.imageUrl} alt={product.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Oswald', 'Arial Narrow', sans-serif", fontSize: '16px', fontWeight: 600, color: 'var(--green-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{product.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
