# Despliegue en Vercel - Configuración de QuickBooks

## 📋 Variables de Entorno Requeridas

Debes configurar estas variables de entorno en Vercel para que QuickBooks funcione:

### 1. Ir a Configuración de Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Click en "Settings"
3. Click en "Environment Variables"

### 2. Agregar Variables de QuickBooks

Agrega las siguientes variables (copia desde tu `.env.sandbox`):

```bash
# QuickBooks Configuration
QUICKBOOKS_CLIENT_ID=ABXPALdmydcjTJJh40fN4PLBtbTlDkvUTYjCYElu5o7x0QJUkZ
QUICKBOOKS_CLIENT_SECRET=ykW8ZE0Kxak7eTsIngEN4Zmd8bjz0HYFHOYBwC2K
QUICKBOOKS_ENVIRONMENT=sandbox
QUICKBOOKS_REDIRECT_URI=https://tu-dominio.vercel.app/api/auth/quickbooks/callback
QUICKBOOKS_WEBHOOK_SECRET=fad9f67a-ca9d-4322-857d-62ce95018fc8
QUICKBOOKS_COMPANY_ID=9341457177897242
```

**IMPORTANTE**: Reemplaza `tu-dominio.vercel.app` con tu dominio real de Vercel.

### 3. Agregar Variables de Firebase

También necesitas las variables de Firebase:

```bash
# Firebase Client (Public)
PUBLIC_FIREBASE_API_KEY=AIzaSyDsbO8QGtPNbTejEz4DidtejgLmrtleFmA
PUBLIC_FIREBASE_AUTH_DOMAIN=global-recycling.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=global-recycling
PUBLIC_FIREBASE_STORAGE_BUCKET=global-recycling.firebasestorage.app
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=497937016588
PUBLIC_FIREBASE_APP_ID=1:497937016588:web:1b65b39fd71ab2575d8b29

# Firebase Admin (Server-side)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"global-recycling",...}'
```

**NOTA**: Para `FIREBASE_SERVICE_ACCOUNT_KEY`, copia el valor completo de tu `.env.sandbox`.

### 4. Actualizar Redirect URI en QuickBooks

1. Ve a [QuickBooks Developer Portal](https://developer.intuit.com)
2. Tu App → Keys & credentials
3. En "Redirect URIs", agrega:
   ```
   https://tu-dominio.vercel.app/api/auth/quickbooks/callback
   ```
4. Click en "Save"

### 5. Actualizar Webhook URL en QuickBooks

1. En tu app de QuickBooks, ve a "Webhooks"
2. Actualiza la URL a:
   ```
   https://tu-dominio.vercel.app/api/webhooks/quickbooks
   ```
3. Verifica que el Webhook Secret coincida con el de Vercel
4. Click en "Save"

---

## 🚀 Proceso de Autorización en Vercel

### Paso 1: Desplegar a Vercel

```bash
# Desde tu terminal
vercel --prod
```

O haz push a tu rama principal si tienes auto-deploy configurado.

### Paso 2: Autorizar QuickBooks

1. Ve a: `https://tu-dominio.vercel.app/admin/quickbooks/authorize`
2. Click en "Authorize QuickBooks"
3. Inicia sesión con tu cuenta de QuickBooks Sandbox
4. Autoriza la aplicación
5. Serás redirigido de vuelta a tu app
6. Verifica que aparezca "Connected" ✅

### Paso 3: Verificar Tokens en Firestore

1. Ve a Firebase Console → Firestore
2. Busca la colección `settings`
3. Busca el documento `quickbooks_tokens`
4. Verifica que contenga:
   - `access_token`
   - `refresh_token`
   - `expires_at`
   - `realm_id`

### Paso 4: Probar Checkout

1. Ve a tu sitio en Vercel
2. Agrega productos al carrito
3. Ve a checkout
4. Completa el formulario con datos de prueba
5. Usa tarjeta de prueba: `4111 1111 1111 1111`
6. Click en "Pagar"
7. Verifica que el pago se procese correctamente

---

## 🔍 Troubleshooting en Vercel

### Error: "QuickBooks not configured"

**Causa**: No hay tokens de QuickBooks en Firestore.

**Solución**:
1. Ve a `/admin/quickbooks/authorize`
2. Autoriza la aplicación
3. Verifica que los tokens se guarden en Firestore

### Error: "Invalid redirect URI"

**Causa**: La URI en Vercel no coincide con la configurada en QuickBooks.

**Solución**:
1. Verifica que `QUICKBOOKS_REDIRECT_URI` en Vercel sea exacta
2. Verifica que la URI esté agregada en QuickBooks Developer Portal
3. Incluye el protocolo `https://`
4. No incluyas trailing slash

### Error: "Invalid webhook signature"

**Causa**: El webhook secret no coincide.

**Solución**:
1. Verifica que `QUICKBOOKS_WEBHOOK_SECRET` en Vercel sea correcto
2. Debe coincidir con el configurado en QuickBooks Portal
3. Re-despliega después de cambiar variables

### Ver Logs en Vercel

1. Ve a tu proyecto en Vercel
2. Click en "Deployments"
3. Click en el deployment activo
4. Click en "Functions"
5. Busca logs de `/api/checkout` y `/api/webhooks/quickbooks`

---

## 📊 Verificar que Todo Funciona

### Checklist de Verificación

- [ ] Variables de entorno configuradas en Vercel
- [ ] Redirect URI actualizado en QuickBooks
- [ ] Webhook URL actualizado en QuickBooks
- [ ] Aplicación desplegada en Vercel
- [ ] QuickBooks autorizado (tokens en Firestore)
- [ ] Checkout funciona sin errores
- [ ] Pagos se procesan correctamente
- [ ] Órdenes se guardan en Firestore
- [ ] Webhooks se reciben correctamente

---

## 🔐 Seguridad en Producción

Cuando pases a producción:

1. **Cambia a credenciales de producción**:
   ```bash
   QUICKBOOKS_ENVIRONMENT=production
   QUICKBOOKS_CLIENT_ID=production_client_id
   QUICKBOOKS_CLIENT_SECRET=production_client_secret
   ```

2. **Actualiza URLs**:
   - Redirect URI: `https://tu-dominio.com/api/auth/quickbooks/callback`
   - Webhook: `https://tu-dominio.com/api/webhooks/quickbooks`

3. **Re-autoriza** con cuenta de producción

4. **Implementa tokenización client-side** (ver `QUICKBOOKS-SETUP.md`)

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en Vercel Functions
2. Verifica Firestore para ver si hay tokens
3. Prueba el endpoint de autorización manualmente
4. Consulta la documentación de QuickBooks
5. Revisa que todas las URLs sean HTTPS

---

**¡Tu aplicación ahora puede procesar pagos en Vercel!** 🎉
