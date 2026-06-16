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
      <section className="shop">
        <div className="container">
          <div className="shop-header">
            <div>
              <div className="sec-tag"><div className="sec-tag-line"></div>{isEnglish ? 'Our Products' : 'Nuestros Productos'}</div>
              <h2 className="sec-title">{isEnglish ? 'Shop' : 'Compra'} <span>{isEnglish ? 'Recycled' : 'Materiales Reciclados'}</span> {isEnglish ? 'Materials' : ''}</h2>
              <p className="sec-lead">{isEnglish ? 'Premium quality. Pickup or delivery. Buy online or request a custom quote for large orders.' : 'Calidad premium. Recogida o entrega. Compra en línea o solicita una cotización personalizada para pedidos grandes.'}</p>
            </div>
            <a href={isEnglish ? '/en/materials' : '/materiales'} className="btn-secondary">{isEnglish ? 'View All Materials' : 'Ver Todos los Materiales'} →</a>
          </div>
          <div className="shop-grid">
            <div className="prod-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)' }}>
              {isEnglish ? 'Loading products...' : 'Cargando productos...'}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="shop">
        <div className="container">
          <div className="shop-header">
            <div>
              <div className="sec-tag"><div className="sec-tag-line"></div>{isEnglish ? 'Our Products' : 'Nuestros Productos'}</div>
              <h2 className="sec-title">{isEnglish ? 'Shop' : 'Compra'} <span>{isEnglish ? 'Recycled' : 'Materiales Reciclados'}</span> {isEnglish ? 'Materials' : ''}</h2>
              <p className="sec-lead fade fade-d2">{isEnglish ? 'Premium quality. Pickup or delivery. Buy online or request a custom quote for large orders.' : 'Calidad premium. Recogida o entrega. Compra en línea o solicita una cotización personalizada para pedidos grandes.'}</p>
            </div>
            <a href={isEnglish ? '/en/materials' : '/materiales'} className="btn-secondary">{isEnglish ? 'View All Materials' : 'Ver Todos los Materiales'} →</a>
          </div>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--red)' }}>
            {error}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="shop">
        <div className="container">
          <div className="shop-header">
            <div>
              <div className="sec-tag fade"><div className="sec-tag-line"></div>{isEnglish ? 'Our Products' : 'Nuestros Productos'}</div>
              <h2 className="sec-title fade fade-d1">{isEnglish ? 'Shop' : 'Compra'} <span>{isEnglish ? 'Recycled' : 'Materiales Reciclados'}</span> {isEnglish ? 'Materials' : ''}</h2>
              <p className="sec-lead fade fade-d2">{isEnglish ? 'Premium quality. Pickup or delivery. Buy online or request a custom quote for large orders.' : 'Calidad premium. Recogida o entrega. Compra en línea o solicita una cotización personalizada para pedidos grandes.'}</p>
            </div>
            <a href={isEnglish ? '/en/materials' : '/materiales'} className="btn-secondary">{isEnglish ? 'View All Materials' : 'Ver Todos los Materiales'} →</a>
          </div>
          <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--gray-50)', borderRadius: '10px', border: '1px solid var(--gray-200)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: 'var(--gray-900)', marginBottom: '8px' }}>
              {isEnglish ? 'No products available' : 'No hay productos disponibles'}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-400)' }}>
              {isEnglish ? 'Products will be displayed here once they are added from the admin panel.' : 'Los productos se mostrarán aquí una vez que sean agregados desde el panel de administración.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="shop products" id="products">
      <div className="container">
        <div className="shop-header">
          <div>
            <div className="sec-tag"><div className="sec-tag-line"></div>{isEnglish ? 'Our Products' : 'Nuestros Productos'}</div>
            <h2 className="sec-title">{isEnglish ? 'Shop' : 'Compra'} <span>{isEnglish ? 'Recycled' : 'Materiales Reciclados'}</span> {isEnglish ? 'Materials' : ''}</h2>
            <p className="sec-lead">{isEnglish ? 'Premium quality. Pickup or delivery. Buy online or request a custom quote for large orders.' : 'Calidad premium. Recogida o entrega. Compra en línea o solicita una cotización personalizada para pedidos grandes.'}</p>
          </div>
          {/* <a href={isEnglish ? '/en/materials' : '/materiales'} className="btn-secondary">{isEnglish ? 'View All Materials' : 'Ver Todos los Materiales'} →</a> */}
        </div>
        <div className="shop-grid">
          {products.map((product, index) => (
            <div key={product.id} className="prod-card">
              <div className="prod-img">
                <img src={product.imageUrl} alt={product.name} loading="lazy" />
                {product.badge && <div className="prod-badge">{product.badge}</div>}
              </div>
              <div className="prod-body">
                <div className="prod-name">{product.name}</div>
                <div className="prod-desc">{product.description}</div>
                <div className="prod-price">
                  {product.price ? (
                    <>
                      <div className="price-num">${product.price}</div>
                      <div className="price-unit">{product.priceUnit || '/ ton'}</div>
                    </>
                  ) : (
                    <div className="price-call">{isEnglish ? 'Call for Pricing' : 'Llamar para Precio'}</div>
                  )}
                </div>
                <div className="prod-actions">
                  <button 
                    className="btn-cart" 
                    disabled={!product.price}
                    style={!product.price ? { background: 'var(--gray-300)', cursor: 'not-allowed' } : {}}
                    onClick={() => handleAddToCart(product)}
                  >
                    {isEnglish ? 'Add to Cart' : 'Agregar al Carrito'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
