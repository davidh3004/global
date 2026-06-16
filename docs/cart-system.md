# Sistema de Carrito de Compras - Documentación

## Descripción General

Sistema completo de carrito de compras con persistencia dual (localStorage y Firestore), sincronización automática entre estados de autenticación, y UI responsive con React.

## Arquitectura

### Componentes Principales

1. **CartContext** (`src/context/CartContext.tsx`)
   - Proveedor de estado global del carrito
   - Maneja sincronización automática entre localStorage y Firestore
   - Detecta cambios de autenticación y migra datos

2. **CartPersistenceService** (`src/services/cart-persistence.service.ts`)
   - Operaciones de lectura/escritura en localStorage
   - Operaciones de lectura/escritura en Firestore
   - Funciones de fusión y sincronización de datos

3. **CartDrawerNew** (`src/components/cart/CartDrawerNew.tsx`)
   - UI del carrito en formato drawer lateral
   - Operaciones CRUD de items
   - Cálculo de totales
   - Soporte multiidioma

4. **CartBadge** (`src/components/cart/CartBadge.tsx`)
   - Badge que muestra cantidad de items
   - Se actualiza automáticamente

5. **AddToCartButton** (`src/components/cart/AddToCartButton.tsx`)
   - Botón reutilizable para agregar productos
   - Feedback visual de éxito

## Flujos de Datos

### Usuario No Logueado

```
Agregar Item → CartContext → localStorage
              ↓
         CartBadge actualizado
```

### Usuario Logueado

```
Agregar Item → CartContext → Firestore
              ↓
         CartBadge actualizado
```

### Login (Sincronización)

```
Usuario inicia sesión
    ↓
CartContext detecta cambio de auth
    ↓
Lee items de localStorage
    ↓
Lee items de Firestore
    ↓
Fusiona items (suma cantidades si existen)
    ↓
Guarda items fusionados en Firestore
    ↓
Borra localStorage
    ↓
Actualiza UI
```

### Logout (Sincronización)

```
Usuario cierra sesión
    ↓
CartContext detecta cambio de auth
    ↓
Lee items de Firestore
    ↓
Guarda items en localStorage
    ↓
Borra documento de Firestore
    ↓
Actualiza UI
```

## Uso

### 1. Integración en Layout Principal

```astro
---
// src/layouts/MainLayout.astro
import CartWrapper from '../components/cart/CartWrapper';
---

<html>
  <body>
    <!-- Tu contenido -->
    
    <!-- Cart System -->
    <CartWrapper client:only="react" lang={lang} />
  </body>
</html>
```

### 2. Usar el Hook en Componentes React

```tsx
import { useCart } from '../context/CartContext';

function MyComponent() {
  const { state, addItem, removeItem, updateQuantity, clearCart } = useCart();
  
  // Agregar item
  const handleAdd = async () => {
    await addItem({
      id: 'product-1',
      name: 'Producto',
      price: 100,
      quantity: 1,
      image: '/image.jpg',
    });
  };
  
  // Acceder al estado
  console.log(state.items); // Array de items
  console.log(state.total); // Total en dinero
  console.log(state.itemCount); // Cantidad total de items
  console.log(state.isLoading); // Estado de carga
  console.log(state.isSyncing); // Estado de sincronización
  
  return <div>...</div>;
}
```

### 3. Botón de Agregar al Carrito

```tsx
import AddToCartButton from '../components/cart/AddToCartButton';

<AddToCartButton
  product={{
    id: 'prod-123',
    name: 'Concrete',
    price: 50.00,
    image: '/images/concrete.jpg',
    description: 'Crushed concrete',
  }}
  quantity={1}
  lang="en"
  onSuccess={() => console.log('Added!')}
/>
```

### 4. Badge del Carrito

```astro
---
import CartBadge from '../components/cart/CartBadge';
---

<button id="cartIcon">
  <svg>...</svg>
  <CartBadge client:only="react" />
</button>
```

### 5. Abrir el Drawer desde JavaScript

```javascript
// Desde cualquier parte de la aplicación
window.dispatchEvent(new Event('toggleCart'));
```

## Estructura de Datos

### CartItem

```typescript
interface CartItem {
  id: string;          // ID único del producto
  name: string;        // Nombre del producto
  price: number;       // Precio unitario
  quantity: number;    // Cantidad
  image?: string;      // URL de imagen (opcional)
  description?: string; // Descripción (opcional)
}
```

### CartState

```typescript
interface CartState {
  items: CartItem[];   // Array de items
  total: number;       // Total en dinero
  itemCount: number;   // Cantidad total de items
  isLoading: boolean;  // Cargando datos
  isSyncing: boolean;  // Sincronizando entre storages
}
```

## Firestore Schema

### Colección: `carts`

```
carts/
  {userId}/
    items: CartItem[]
    updatedAt: Timestamp
```

## LocalStorage Schema

```javascript
// Clave: 'shopping_cart'
[
  {
    id: "product-1",
    name: "Product Name",
    price: 100,
    quantity: 2,
    image: "/image.jpg",
    description: "Description"
  },
  // ... más items
]
```

## Eventos Personalizados

### cartUpdated

Disparado cada vez que el carrito cambia:

```javascript
window.addEventListener('cartUpdated', (event) => {
  console.log('Cart updated:', event.detail);
  // event.detail contiene el CartState completo
});
```

## Internacionalización

El sistema soporta español e inglés. Los textos se definen en cada componente:

```typescript
const translations = {
  en: {
    title: 'Shopping Cart',
    empty: 'Your cart is empty',
    // ...
  },
  es: {
    title: 'Carrito de Compras',
    empty: 'Tu carrito está vacío',
    // ...
  },
};
```

## Manejo de Errores

Todos los errores se capturan y se registran en la consola. Las operaciones fallan silenciosamente para no interrumpir la experiencia del usuario.

```typescript
try {
  await addItem(item);
} catch (error) {
  console.error('Error adding item:', error);
  // El usuario ve el estado anterior del carrito
}
```

## Performance

- **Lazy Loading**: El CartDrawer solo se renderiza cuando está abierto
- **Debouncing**: Las operaciones de persistencia se agrupan
- **Memoization**: Los cálculos de total se optimizan con el reducer
- **Event Batching**: Los eventos de actualización se disparan una vez por cambio

## Testing

### Flujo de Prueba Manual

1. **Como usuario no logueado:**
   - Agregar productos al carrito
   - Verificar que se guarden en localStorage
   - Verificar que el badge se actualice

2. **Login:**
   - Iniciar sesión
   - Verificar que los items se migren a Firestore
   - Verificar que localStorage se limpie

3. **Como usuario logueado:**
   - Agregar más productos
   - Verificar que se guarden en Firestore
   - Cerrar y abrir el navegador
   - Verificar que los items persistan

4. **Logout:**
   - Cerrar sesión
   - Verificar que los items se copien a localStorage
   - Verificar que el documento de Firestore se elimine

## Troubleshooting

### El carrito no se sincroniza

- Verificar que Firebase esté inicializado correctamente
- Verificar permisos de Firestore
- Revisar la consola para errores

### El badge no se actualiza

- Verificar que CartBadge esté dentro de CartProvider
- Verificar que el evento 'cartUpdated' se dispare

### Items duplicados después del login

- Verificar la función `mergeCartItems`
- Asegurarse de que los IDs de productos sean únicos

## Próximas Mejoras

- [ ] Agregar límite de cantidad por producto
- [ ] Implementar descuentos y cupones
- [ ] Agregar estimación de envío
- [ ] Persistir carrito en servidor para usuarios logueados (backup)
- [ ] Agregar animaciones de transición
- [ ] Implementar undo/redo
- [ ] Agregar wishlist integration
