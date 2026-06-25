import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase/client';
import type { Product } from '../../firebase/types';
import type { CartItem } from '../../types/cart';
import { useI18n } from '../../hooks/useI18n';

interface Props {
  lang?: string;
}

function formatPrice(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function formatPriceUnit(unit?: string, isEnglish = true) {
  if (!unit) return isEnglish ? 'per ton' : 'por tonelada';
  return unit.replace(/^\//, '').trim() || (isEnglish ? 'per ton' : 'por tonelada');
}

export default function ProductsSection({ lang = 'en' }: Props) {
  const { isEnglish } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ name: string; leaving: boolean } | null>(null);

  const copy = isEnglish
    ? {
        tag: 'MATERIALS WE SELL',
        title: 'HIGH-QUALITY MATERIALS FOR YOUR PROJECTS',
        lead: 'We supply a wide range of recycled materials for construction and landscaping needs.',
        loading: 'Loading materials…',
        addToCart: 'Add to Cart',
        callForPricing: 'Call for Pricing',
        addedTitle: 'Added to cart',
        addedBody: 'was added to your cart.',
      }
    : {
        tag: 'MATERIALES QUE VENDEMOS',
        title: 'MATERIALES DE ALTA CALIDAD PARA SUS PROYECTOS',
        lead: 'Suministramos una amplia gama de materiales reciclados para necesidades de construcción y paisajismo.',
        loading: 'Cargando materiales…',
        addToCart: 'Agregar al Carrito',
        callForPricing: 'Consulte Precio',
        addedTitle: 'Agregado al carrito',
        addedBody: 'fue agregado a su carrito.',
      };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let q;
        try {
          q = query(
            collection(db, 'products'),
            where('isActive', '==', true),
            orderBy('order', 'asc'),
            limit(6)
          );
        } catch {
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

        productsData.sort((a, b) => (a.order || 0) - (b.order || 0));
        setProducts(productsData);
        setLoading(false);
      } catch (err: unknown) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Error loading products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!toast || toast.leaving) return;
    const hideTimer = window.setTimeout(() => {
      setToast((current) => (current ? { ...current, leaving: true } : null));
    }, 2800);
    return () => window.clearTimeout(hideTimer);
  }, [toast]);

  useEffect(() => {
    if (!toast?.leaving) return;
    const removeTimer = window.setTimeout(() => setToast(null), 280);
    return () => window.clearTimeout(removeTimer);
  }, [toast]);

  const handleAddToCart = (product: Product) => {
    const cartItem: CartItem = {
      id: product.id!,
      name: product.name,
      price: product.price || 0,
      quantity: 1,
      image: product.imageUrl,
      description: product.description,
      priceUnit: product.priceUnit || '',
    };

    window.dispatchEvent(
      new CustomEvent('addToCart', {
        detail: cartItem,
      })
    );

    setToast({ name: product.name, leaving: false });
  };

  if (loading) {
    return (
      <section className="shop products home-products" id="products">
        <div className="container">
          <header className="home-products-head">
            <div className="sec-eyebrow">{copy.tag}</div>
            <h2 className="home-products-title">{copy.title}</h2>
            <p className="home-products-lead">{copy.lead}</p>
          </header>
          <p className="home-products-loading">{copy.loading}</p>
        </div>
      </section>
    );
  }

  if (error) {
    return null;
  }

  return (
    <section className="shop products home-products" id="products">
      <div className="container">
        <header className="home-products-head">
          <div className="sec-eyebrow">{copy.tag}</div>
          <h2 className="home-products-title">{copy.title}</h2>
          <p className="home-products-lead">{copy.lead}</p>
        </header>

        <div className="shop-grid home-products-grid">
          {products.map((product) => (
            <article key={product.id} className="prod-card home-prod-card">
              <div className="prod-img">
                {product.badge ? <span className="prod-badge">{product.badge}</span> : null}
                <img src={product.imageUrl} alt={product.name} loading="lazy" />
              </div>
              <div className="prod-body">
                <h3 className="prod-name">{product.name}</h3>
                {product.description ? <p className="prod-desc">{product.description}</p> : null}
                {product.price != null && product.price > 0 ? (
                  <div className="prod-price">
                    <span className="price-num">${formatPrice(product.price)}</span>
                    <span className="price-unit">{formatPriceUnit(product.priceUnit, isEnglish)}</span>
                  </div>
                ) : (
                  <div className="price-call">{copy.callForPricing}</div>
                )}
                <div className="prod-actions">
                  <button
                    type="button"
                    className="btn-cart home-prod-cart"
                    onClick={() => handleAddToCart(product)}
                  >
                    {copy.addToCart}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {toast ? (
        <div
          className={`cart-toast${toast.leaving ? ' is-leaving' : ''}`}
          role="status"
          aria-live="polite"
        >
          <span className="cart-toast-icon" aria-hidden="true">✓</span>
          <div className="cart-toast-text">
            <strong>{copy.addedTitle}</strong>
            {toast.name} {copy.addedBody}
          </div>
        </div>
      ) : null}
    </section>
  );
}
