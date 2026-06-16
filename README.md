# Global Recycling of Tampa Bay - Website

Sitio web oficial de Global Recycling of Tampa Bay, migrado a Astro 6 + TailwindCSS 4 + DaisyUI con Firebase como backend.

## 🚀 Stack Tecnológico

- **Astro 6.x** - Framework web moderno con Island Architecture
- **TailwindCSS 4.x** - Framework CSS utilitario
- **DaisyUI 4.x** - Componentes UI (solo para backoffice /admin)
- **Firebase** - Backend (Firestore, Authentication, Storage)
- **TypeScript** - Tipado estático
- **React** - Componentes interactivos (carrito, etc.)
- **pnpm** - Gestor de paquetes

## � Estructura del Proyecto

```
proyecto-astro/
├── src/
│   ├── components/
│   │   ├── common/          # Header, Footer, Cart
│   │   ├── home/            # Secciones del home
│   │   ├── admin/           # Componentes del backoffice
│   │   └── ui/              # Componentes reutilizables
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── PublicLayout.astro
│   │   └── AdminLayout.astro
│   ├── pages/
│   │   ├── index.astro      # Página principal
│   │   ├── en/              # Versión en inglés
│   │   └── admin/           # Panel administrativo
│   ├── firebase/            # Configuración Firebase
│   ├── services/            # Servicios (Firestore, Auth)
│   ├── i18n/                # Traducciones (es/en)
│   └── styles/              # Estilos globales
├── public/                  # Assets estáticos
└── .env                     # Variables de entorno
```

## 🔧 Configuración Inicial

### 1. Instalar Dependencias

```bash
pnpm install
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env` y configura tus credenciales de Firebase:

```bash
cp .env.example .env
```

Edita `.env` con tus valores de Firebase:

```env
PUBLIC_FIREBASE_API_KEY=tu_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### 3. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Firestore Database
3. Habilita Authentication (Email/Password)
4. Habilita Storage
5. Crea las siguientes colecciones en Firestore:
   - `crew`
   - `team`
   - `reviews`
   - `serviceAreas`
   - `fourTrades`
   - `faqs`
   - `siteConfig`

## 🧞 Comandos

| Comando | Acción |
|---------|--------|
| `pnpm install` | Instala dependencias |
| `pnpm dev` | Inicia servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Construye el sitio para producción en `./dist/` |
| `pnpm preview` | Previsualiza el build localmente |
| `pnpm astro add` | Agrega integraciones de Astro |

## 🌐 Internacionalización (i18n)

El sitio soporta español (por defecto) e inglés:

- **Español**: `/` (ruta raíz)
- **Inglés**: `/en/`

Las traducciones se encuentran en `src/i18n/`:
- `es.json` - Traducciones en español
- `en.json` - Traducciones en inglés

## 🔐 Panel Administrativo

Accede al backoffice en `/admin` (requiere autenticación).

### Funcionalidades del Admin:

#### 📦 **Products** (`/admin/products`)
- Lista de productos con filtros y búsqueda
- Crear, editar y eliminar productos
- Toggle activo/inactivo para mostrar/ocultar en la página
- Campos: nombre, descripción, precio, unidad, imagen, badge, orden
- Mensaje automático cuando no hay productos disponibles

#### ⭐ **Reviews** (`/admin/reviews`)
- Lista de reseñas con tabs (Todas/Aprobadas/Pendientes)
- Crear, editar y eliminar reseñas
- Aprobar/rechazar reseñas con un clic
- Campos: autor, iniciales, fuente, calificación (estrellas), contenido
- Filtrado por estado de aprobación

#### 📚 **Learning Center** (`/admin/learning`)
- Gestión de artículos educativos
- Crear, editar y eliminar artículos
- Toggle publicado/borrador
- Campos: título, slug, categoría, extracto, contenido, imagen, orden
- Auto-generación de slug desde el título

#### ⚙️ **Site Config** (`/admin/config`)
- Configuración global del sitio
- Información de contacto (nombre, teléfono, email, dirección, horario)
- Google Maps embed URL para la sección "Find Us"
- Enlaces de redes sociales (Instagram, Facebook, Twitter)
- Configuración única almacenada en Firestore

### 🖼️ API Routes

#### Upload de Imágenes (`POST /api/upload`)
- Subida de imágenes sin usar Firebase Storage (ahorro de costos)
- Validación de tipo de archivo (solo imágenes)
- Validación de tamaño (máximo 5MB)
- Almacenamiento en `/public/uploads/`
- Retorna URL pública de la imagen subida
- Nombres de archivo únicos con timestamp

**Uso:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const { url } = await response.json();
// url: "/uploads/1234567890-abc123.jpg"
```

Todas las secciones incluyen CRUD completo con subida de imágenes a Firebase Storage.

## 🎨 Diseño Visual

**IMPORTANTE**: El diseño visual de la web pública es **idéntico** al sitio original HTML/CSS/JS. La migración a TailwindCSS mantiene cada píxel, color, espaciado, tipografía y animación exactamente igual.

### Colores del Brand:

```css
--green: #2D8C4E
--green-dark: #1F6B3A
--green-light: #3BAE62
--green-pale: #EAF6EE
```

### Tipografías:

- **Inter** - Texto general
- **Manrope** - Títulos y display

## 🔥 Firebase Collections Schema

### crew
```typescript
{
  name: string;
  title: string;
  imageUrl: string;
  order: number;
}
```

### team
```typescript
{
  name: string;
  title: string;
  imageUrl: string;
  order: number;
}
```

### reviews
```typescript
{
  author: string;
  rating: number;
  content: string;
  date: Timestamp;
  isApproved: boolean;
}
```

### fourTrades
```typescript
{
  serviceName: string;
  description: string;
  icon: string;
  features: string[];
  priceRange: string;
  callToAction: string;
  isActive: boolean;
  order: number;
}
```

### siteConfig (documento único)
```typescript
{
  companyName: string;
  address: string;
  phone: string;
  email: string;
  googleRating: string;
  heroTitle: { es: string; en: string };
  heroSubtitle: { es: string; en: string };
  socialMedia: Array<{ platform: string; url: string }>;
}
```

## 📝 Notas de Desarrollo

- El diseño público **NO usa DaisyUI** - solo TailwindCSS puro
- DaisyUI se usa **exclusivamente** en rutas `/admin`
- Las animaciones fade usan Intersection Observer API
- El carrito es un componente React para mejor interactividad
- View Transitions API de Astro para navegación fluida

## 🚀 Deployment

El proyecto está configurado con `@astrojs/node` adapter para deployment en servidores Node.js o plataformas como Vercel, Netlify, etc.

```bash
pnpm build
```

El build generará archivos estáticos optimizados en `./dist/`

## 📞 Contacto

**Global Recycling of Tampa Bay**
- Dirección: 5011 N. Clark St., Tampa, FL 33614
- Teléfono: (813) 373-6467
- Horario: Lun–Sáb 7:00am – 5:00pm

---

Construido con ❤️ usando Astro 6 + TailwindCSS 4
