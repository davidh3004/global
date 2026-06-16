# Guía de Migración del Sistema de Carrito

## ✅ Cambios Implementados

### Archivos Nuevos Creados

1. **`src/types/cart.ts`** - Definiciones de tipos TypeScript
2. **`src/services/cart-persistence.service.ts`** - Servicio de persistencia dual
3. **`src/context/CartContext.tsx`** - Context API con hooks
4. **`src/components/cart/CartDrawerNew.tsx`** - Drawer del carrito refactorizado
5. **`src/components/cart/CartBadge.tsx`** - Badge reactivo del contador
6. **`src/components/cart/AddToCartButton.tsx`** - Botón reutilizable
7. **`src/components/cart/CartWrapper.tsx`** - Wrapper con Provider

### Archivos Modificados

1. **`src/components/common/HeaderOriginal.astro`**
   - Reemplazado `CartDrawer` con `CartWrapper`
   - Reemplazado contador manual con `CartBadge`
   - Eliminada función `updateCartCount()`
   - Limpiado código obsoleto

2. **`src/components/common/Footer.astro`**
   - Eliminado carrito duplicado (HTML/JS viejo)
   - Removido script `toggleCart()`

### Archivos Obsoletos (Puedes eliminar)

- `src/components/cart/CartDrawer.tsx` (viejo)
- `src/services/cart.service.ts` (si no se usa en otro lugar)

## 🔄 Cómo Funciona el Nuevo Sistema

### Persistencia Dual

```
Usuario NO logueado → localStorage (clave: 'shopping_cart')
Usuario logueado → Firestore (colección: 'carts/{userId}')
```

### Sincronización Automática

**Al iniciar sesión:**
1. Lee items de `localStorage`
2. Lee items de `Firestore`
3. Fusiona items (suma cantidades si el producto ya existe)
4. Guarda en `Firestore`
5. Limpia `localStorage`

**Al cerrar sesión:**
1. Lee items de `Firestore`
2. Guarda en `localStorage`
3. Elimina documento de `Firestore`

## 📝 Cómo Usar

### 1. Agregar Producto al Carrito (React)

```tsx
import { useCart } from '../../context/CartContext';

function ProductCard({ product }) {
  const { addItem } = useCart();
  
  const handleAdd = async () => {
    await addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      description: product.description,
    });
  };
  
  return (
    <button onClick={handleAdd}>
      Add to Cart
    </button>
  );
}
```

### 2. Usar el Botón Pre-construido

```tsx
import AddToCartButton from '../components/cart/AddToCartButton';

<AddToCartButton
  product={{
    id: 'prod-123',
    name: 'Crushed Concrete',
    price: 50.00,
    image: '/images/concrete.jpg',
  }}
  quantity={1}
  lang="en"
  onSuccess={() => alert('Added!')}
/>
```

### 3. Agregar desde Astro/JavaScript

```javascript
// Despachar evento personalizado
window.dispatchEvent(new CustomEvent('addToCart', {
  detail: {
    id: 'prod-123',
    name: 'Product',
    price: 100,
    quantity: 1,
  }
}));
```

Luego en tu CartContext, escuchar este evento:

```tsx
useEffect(() => {
  const handleAddFromWindow = (e: CustomEvent) => {
    addItem(e.detail);
  };
  
  window.addEventListener('addToCart', handleAddFromWindow);
  return () => window.removeEventListener('addToCart', handleAddFromWindow);
}, []);
```

### 4. Abrir el Drawer

```javascript
// Desde cualquier parte
window.dispatchEvent(new Event('toggleCart'));
```

### 5. Acceder al Estado del Carrito

```tsx
import { useCart } from '../../context/CartContext';

function MyComponent() {
  const { state } = useCart();
  
  console.log(state.items);      // Array de items
  console.log(state.total);      // Total en $
  console.log(state.itemCount);  // Cantidad total
  console.log(state.isLoading);  // Cargando?
  console.log(state.isSyncing);  // Sincronizando?
}
```

## 🎨 Personalización

### Cambiar Estilos del Drawer

Edita `src/components/cart/CartDrawerNew.tsx` en la sección `<style>`:

```tsx
<style>{`
  .cart-drawer {
    max-width: 450px; /* Cambiar ancho */
    background: white; /* Cambiar color de fondo */
  }
  
  .btn-checkout {
    background-color: #059669; /* Cambiar color del botón */
  }
`}</style>
```

### Agregar Nuevos Idiomas

Edita las traducciones en `CartDrawerNew.tsx`:

```tsx
const translations = {
  en: { /* ... */ },
  es: { /* ... */ },
  fr: {  // Nuevo idioma
    title: 'Panier',
    empty: 'Votre panier est vide',
    // ...
  },
};
```

### Cambiar Clave de localStorage

Edita `src/services/cart-persistence.service.ts`:

```tsx
const CART_STORAGE_KEY = 'my_custom_cart_key';
```

### Cambiar Colección de Firestore

Edita `src/services/cart-persistence.service.ts`:

```tsx
const cartDoc = await getDoc(doc(db, 'my_carts', userId));
```

## 🐛 Troubleshooting

### El carrito no persiste

**Problema:** Los items desaparecen al recargar

**Solución:**
- Verifica que `CartWrapper` esté montado en el layout
- Revisa la consola para errores de Firestore
- Verifica permisos de Firestore

### El badge no se actualiza

**Problema:** El contador no cambia

**Solución:**
- Asegúrate de que `CartBadge` esté dentro del `CartWrapper`
- Verifica que uses `client:only="react"` en Astro

### Items duplicados al hacer login

**Problema:** Los productos se duplican

**Solución:**
- Verifica que los IDs de productos sean únicos
- Revisa la función `mergeCartItems` en `cart-persistence.service.ts`

### El drawer no se abre

**Problema:** Click en el icono no hace nada

**Solución:**
- Verifica que el evento `toggleCart` se dispare
- Revisa la consola para errores de React
- Asegúrate de que `CartWrapper` esté montado

## 🔒 Seguridad

### Reglas de Firestore Recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Carts collection
    match /carts/{userId} {
      // Solo el dueño puede leer/escribir su carrito
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📊 Monitoreo

### Eventos Personalizados

El sistema dispara eventos que puedes escuchar:

```javascript
// Cuando el carrito se actualiza
window.addEventListener('cartUpdated', (event) => {
  console.log('Cart state:', event.detail);
  // Enviar a analytics, etc.
});
```

### Logging

Para debugging, puedes habilitar logs detallados:

```tsx
// En CartContext.tsx
const DEBUG = true;

if (DEBUG) {
  console.log('[Cart] Action:', action);
  console.log('[Cart] New state:', newState);
}
```

## 🚀 Próximos Pasos

1. **Migrar productos existentes** - Actualiza tus páginas de productos para usar `AddToCartButton`
2. **Probar flujos** - Prueba login/logout con items en el carrito
3. **Personalizar UI** - Ajusta colores y estilos según tu marca
4. **Agregar analytics** - Trackea eventos de carrito
5. **Implementar checkout** - Conecta el carrito con tu sistema de pagos

## 📚 Recursos

- [Documentación completa](./cart-system.md)
- [React Context API](https://react.dev/reference/react/useContext)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Astro Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)

## ✨ Características Implementadas

- ✅ Persistencia dual (localStorage + Firestore)
- ✅ Sincronización automática en login/logout
- ✅ Fusión inteligente de items
- ✅ UI responsive con drawer lateral
- ✅ Badge reactivo con contador
- ✅ Soporte multiidioma (ES/EN)
- ✅ TypeScript completo
- ✅ Manejo de errores robusto
- ✅ Eventos personalizados
- ✅ Optimización de performance
- ✅ Componentes reutilizables

## 🎯 Testing Checklist

- [ ] Agregar producto como invitado
- [ ] Verificar que se guarde en localStorage
- [ ] Iniciar sesión
- [ ] Verificar que items se migren a Firestore
- [ ] Agregar más productos estando logueado
- [ ] Cerrar sesión
- [ ] Verificar que items vuelvan a localStorage
- [ ] Abrir/cerrar drawer
- [ ] Cambiar cantidades
- [ ] Eliminar items
- [ ] Vaciar carrito
- [ ] Verificar badge actualizado
- [ ] Probar en móvil
- [ ] Probar cambio de idioma
