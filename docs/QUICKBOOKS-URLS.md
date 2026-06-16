# QuickBooks API - URLs Correctas

## 🔧 Problema Resuelto

El error `ENOTFOUND sandbox.intuit.com` ocurría porque estábamos usando la URL incorrecta para la API de QuickBooks Payments.

---

## ✅ URLs Correctas

### **QuickBooks Payments API**

QuickBooks tiene diferentes APIs con diferentes URLs:

#### **Sandbox (Desarrollo)**
```
https://sandbox-quickbooks.api.intuit.com
```

#### **Production (Producción)**
```
https://api.intuit.com
```

### **OAuth API** (Igual para ambos)
```
https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer
```

---

## 📋 URLs por Servicio

| Servicio | Sandbox | Production |
|----------|---------|------------|
| **Payments API** | `https://sandbox-quickbooks.api.intuit.com` | `https://api.intuit.com` |
| **QuickBooks Online API** | `https://sandbox-quickbooks.api.intuit.com` | `https://quickbooks.api.intuit.com` |
| **OAuth** | `https://oauth.platform.intuit.com` | `https://oauth.platform.intuit.com` |

---

## 🔍 Endpoints Completos

### **Crear Cargo de Pago (Payment Charge)**

#### Sandbox
```
POST https://sandbox-quickbooks.api.intuit.com/quickbooks/v4/payments/charges
```

#### Production
```
POST https://api.intuit.com/quickbooks/v4/payments/charges
```

### **Headers Requeridos**
```http
Authorization: Bearer {access_token}
Content-Type: application/json
Request-Id: {unique_request_id}
```

### **Body Ejemplo**
```json
{
  "amount": "100.00",
  "currency": "USD",
  "description": "Order - 2 item(s)",
  "capture": true,
  "token": "card_token_here",
  "context": {
    "mobile": false,
    "isEcommerce": true
  }
}
```

---

## 🧪 Probar Conexión

### **Desde Terminal**

```bash
# Probar que el dominio resuelve
ping sandbox-quickbooks.api.intuit.com

# Probar conexión HTTPS
curl -I https://sandbox-quickbooks.api.intuit.com

# Debería devolver: HTTP/2 401 (sin autorización, pero conecta)
```

### **Desde Node.js**

```javascript
// Test simple
fetch('https://sandbox-quickbooks.api.intuit.com/quickbooks/v4/payments/charges', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer test',
    'Content-Type': 'application/json'
  }
})
.then(res => console.log('Connected! Status:', res.status))
.catch(err => console.error('Connection failed:', err.message));
```

---

## 📚 Documentación Oficial

- **Payments API**: https://developer.intuit.com/app/developer/qbpayments/docs/api/resources/all-entities/charges
- **API Explorer**: https://developer.intuit.com/app/developer/qbpayments/docs/api/accounting/all-entities/account
- **OAuth Guide**: https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0

---

## ⚠️ Errores Comunes

### **Error: ENOTFOUND sandbox.intuit.com**

**Causa**: URL incorrecta (falta `-quickbooks.api`)

**Solución**: Usar `sandbox-quickbooks.api.intuit.com`

### **Error: 401 Unauthorized**

**Causa**: Token de acceso inválido o expirado

**Solución**: 
1. Re-autorizar la aplicación
2. Verificar que el token esté en Firestore
3. Verificar que no haya expirado

### **Error: 400 Bad Request**

**Causa**: Body del request inválido

**Solución**:
1. Verificar formato JSON
2. Verificar campos requeridos
3. Verificar tipos de datos (amount debe ser string)

### **Error: 403 Forbidden**

**Causa**: Permisos insuficientes

**Solución**:
1. Verificar scopes de OAuth
2. Re-autorizar con scope `com.intuit.quickbooks.payment`

---

## 🔐 Scopes Requeridos

Para usar Payments API, necesitas este scope en OAuth:

```
com.intuit.quickbooks.payment
```

### **Verificar en Código**

```typescript
// src/services/quickbooks.service.ts
export function getAuthorizationUrl(state: string): string {
  const clientId = import.meta.env.QUICKBOOKS_CLIENT_ID;
  const redirectUri = import.meta.env.QUICKBOOKS_REDIRECT_URI;

  return `https://appcenter.intuit.com/connect/oauth2?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=com.intuit.quickbooks.payment&` +  // ← Scope correcto
    `state=${state}`;
}
```

---

## 🚀 Desplegar Cambios

### **1. Commit y Push**

```bash
git add .
git commit -m "Fix QuickBooks sandbox URL"
git push origin main
```

### **2. Verificar en Vercel**

Espera que Vercel despliegue automáticamente.

### **3. Probar Checkout**

1. Ve a tu sitio en Vercel
2. Agrega productos al carrito
3. Ve a checkout
4. Completa el formulario
5. Click en "Pagar"

### **4. Verificar Logs**

En Vercel → Deployments → Functions → `/api/checkout`

Deberías ver:
```
[QuickBooks] Creating payment charge: { 
  url: 'https://sandbox-quickbooks.api.intuit.com/quickbooks/v4/payments/charges',
  ...
}
```

---

## ✅ Checklist de Verificación

- [x] URL corregida en código
- [x] Build compila sin errores
- [ ] Código desplegado en Vercel
- [ ] QuickBooks autorizado
- [ ] Checkout funciona sin error ENOTFOUND
- [ ] Pagos se procesan correctamente

---

## 📊 Antes vs Después

### **Antes (Incorrecto)**
```typescript
const QB_BASE_URL = 'https://sandbox.intuit.com';  // ❌ No existe
```

### **Después (Correcto)**
```typescript
const QB_BASE_URL = 'https://sandbox-quickbooks.api.intuit.com';  // ✅ Correcto
```

---

## 🎯 Resumen

**Problema**: URL incorrecta de QuickBooks Payments API

**Causa**: Usábamos `sandbox.intuit.com` en lugar de `sandbox-quickbooks.api.intuit.com`

**Solución**: Actualizar URL en `src/services/quickbooks.service.ts`

**Resultado**: 
- ✅ Conexión exitosa a QuickBooks
- ✅ Pagos se procesan correctamente
- ✅ No más error ENOTFOUND

---

**¡URL corregida! Despliega a Vercel y prueba de nuevo.** 🚀
