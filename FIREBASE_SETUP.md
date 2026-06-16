# Configuración de Firebase para Producción

## 🔥 Errores Actuales y Soluciones

### 1. Índices de Firestore Faltantes

Los componentes `ProductsSection` y `ReviewsSection` requieren índices compuestos en Firestore.

#### **Para Products:**
1. Abre la consola de Firebase: https://console.firebase.google.com/
2. Ve a tu proyecto `global-recycling`
3. Navega a **Firestore Database** → **Indexes**
4. Haz clic en el enlace del error o crea manualmente:
   - **Collection ID**: `products`
   - **Fields to index**:
     - `isActive` (Ascending)
     - `order` (Ascending)
     - `__name__` (Ascending)

O usa este enlace directo del error:
```
https://console.firebase.google.com/v1/r/project/global-recycling/firestore/indexes?create_composite=ClFwcm9qZWN0cy9nbG9iYWwtcmVjeWNsaW5nL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9wcm9kdWN0cy9pbmRleGVzL18QARoMCghpc0FjdGl2ZRABGgkKBW9yZGVyEAEaDAoIX19uYW1lX18QAQ
```

#### **Para Reviews:**
1. En la misma sección de **Indexes**
2. Crea un índice para:
   - **Collection ID**: `reviews`
   - **Fields to index**:
     - `isApproved` (Ascending)
     - `date` (Descending)
     - `__name__` (Descending)

O usa este enlace directo del error:
```
https://console.firebase.google.com/v1/r/project/global-recycling/firestore/indexes?create_composite=ClBwcm9qZWN0cy9nbG9iYWwtcmVjeWNsaW5nL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9yZXZpZXdzL2luZGV4ZXMvXxABGg4KCmlzQXBwcm92ZWQQARoICgRkYXRlEAIaDAoIX19uYW1lX18QAg
```

**Nota**: Los índices pueden tardar unos minutos en construirse.

---

### 2. Dominio No Autorizado en Firebase Auth

El dominio de Vercel no está autorizado para operaciones OAuth.

#### **Solución:**
1. Ve a la consola de Firebase: https://console.firebase.google.com/
2. Selecciona tu proyecto `global-recycling`
3. Navega a **Authentication** → **Settings** → **Authorized domains**
4. Haz clic en **Add domain**
5. Agrega tu dominio de Vercel: `reciclaje-five.vercel.app`
6. Guarda los cambios

**Dominios que debes tener autorizados:**
- `localhost` (para desarrollo)
- `reciclaje-five.vercel.app` (tu dominio de producción)
- Cualquier otro dominio personalizado que uses

---

## 🚀 Variables de Entorno en Vercel

Asegúrate de que todas las variables de entorno estén configuradas en Vercel:

1. Ve a tu proyecto en Vercel Dashboard
2. Navega a **Settings** → **Environment Variables**
3. Agrega las siguientes variables (cópialas de tu archivo `.env`):

```env
PUBLIC_FIREBASE_API_KEY=tu_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
PUBLIC_FIREBASE_PROJECT_ID=global-recycling
PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
PUBLIC_FIREBASE_APP_ID=tu_app_id
```

**Importante**: Marca estas variables para todos los entornos (Production, Preview, Development).

---

## ✅ Checklist de Despliegue

- [ ] CSS copiado a `/public/original.css`
- [ ] Índice de Firestore para `products` creado
- [ ] Índice de Firestore para `reviews` creado
- [ ] Dominio de Vercel agregado a Firebase Auth
- [ ] Variables de entorno configuradas en Vercel
- [ ] Redesplegar en Vercel después de los cambios

---

## 🔄 Redesplegar

Después de hacer estos cambios en Firebase:

```bash
# Commit los cambios locales
git add .
git commit -m "fix: corregir CSS y configuración de Firebase"
git push origin main
```

Vercel automáticamente redesplegarĂ¡ tu aplicación.

---

## 📝 Notas Adicionales

### Poblar la Base de Datos

Si aún no tienes datos en Firestore, ejecuta el script de seed:

```bash
pnpm run seed
```

Esto creará datos de ejemplo para products, reviews y learning articles.

### Verificar Funcionamiento

Una vez completados todos los pasos:

1. Visita tu sitio en Vercel
2. Verifica que los estilos se carguen correctamente
3. Comprueba que las secciones de Products y Reviews muestren datos
4. Prueba el cambio de idioma (ES/EN)

---

## 🆘 Soporte

Si encuentras más errores:

1. Revisa la consola del navegador (F12)
2. Verifica los logs de Vercel
3. Asegúrate de que Firebase esté configurado correctamente
