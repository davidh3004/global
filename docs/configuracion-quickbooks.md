# Guía de Configuración de QuickBooks Payments

## Resumen
Esta guía proporciona instrucciones paso a paso para integrar QuickBooks Payments en la plataforma de comercio electrónico de Global Recycling. La integración permite el procesamiento seguro de pagos para pedidos de clientes.

## Arquitectura

### Componentes
- **Frontend**: UI del carrito de compras y checkout (páginas Astro)
- **Backend**: Rutas API para procesamiento de pagos (`/api/payments/*`)
- **Capa de Servicio**: `src/services/quickbooks.service.ts`
- **Gestión de Pedidos**: `src/services/order.service.ts`

### Flujo de Pago
1. Usuario agrega productos al carrito
2. Usuario procede al checkout
3. Frontend inicia pago vía ruta API
4. Backend crea cargo de pago en QuickBooks
5. Usuario completa pago vía QuickBooks
6. Webhook confirma el pago
7. Estado del pedido actualizado a "pagado"
8. Carrito limpiado, confirmación de pedido enviada

## Requisitos Previos

### 1. Cuenta de Desarrollador QuickBooks
1. Ve a [developer.intuit.com](https://developer.intuit.com)
2. Inicia sesión o crea una cuenta
3. Navega al dashboard "My Apps"

### 2. Crear una Aplicación QuickBooks

#### Paso 1: Crear Nueva App
1. Haz clic en "Create an app"
2. Selecciona "QuickBooks Online and Payments"
3. Elige nombre de app: "Global Recycling Payments"
4. Selecciona scopes:
   - `com.intuit.quickbooks.payment` (Requerido para pagos)
   - `com.intuit.quickbooks.accounting` (Opcional para integración contable)

#### Paso 2: Obtener Credenciales API
Después de crear la app, recibirás:
- **Client ID**: Identificador público de tu app
- **Client Secret**: Clave privada de tu app (¡mantener segura!)

**Importante**: Nunca subas estas credenciales a control de versiones.

### 3. Configurar OAuth 2.0

#### URIs de Redirección
Agrega estos URIs de redirección en la configuración de tu app:

**Desarrollo (Sandbox)**:
```
http://localhost:4321/api/auth/quickbooks/callback
```

**Producción**:
```
https://reciclaje-five.vercel.app/api/auth/quickbooks/callback
https://tudominio.com/api/auth/quickbooks/callback
```

#### URLs de Webhook
Configura webhooks para recibir notificaciones de pago:

**Desarrollo**:
```
http://localhost:4321/api/webhooks/quickbooks
```

**Producción**:
```
https://reciclaje-five.vercel.app/api/webhooks/quickbooks
```

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# Credenciales API de QuickBooks
QUICKBOOKS_CLIENT_ID=tu_client_id_aqui
QUICKBOOKS_CLIENT_SECRET=tu_client_secret_aqui

# Entorno (sandbox o production)
QUICKBOOKS_ENVIRONMENT=sandbox

# URI de Redirección OAuth
QUICKBOOKS_REDIRECT_URI=http://localhost:4321/api/auth/quickbooks/callback

# Secreto de Webhook (para verificar firmas de webhook)
QUICKBOOKS_WEBHOOK_SECRET=tu_webhook_secret_aqui

# ID de Compañía QuickBooks (Realm ID)
QUICKBOOKS_COMPANY_ID=tu_company_id_aqui
```

### Obtener tu Company ID (Realm ID)
1. Completa el flujo OAuth (ver abajo)
2. El Realm ID se devuelve en el callback OAuth
3. Guárdalo en tus variables de entorno

## Implementación

### Estructura de Archivos
```
src/
├── services/
│   ├── quickbooks.service.ts      # Integración API QuickBooks
│   ├── order.service.ts            # Gestión de pedidos (ya existe)
│   └── payment.service.ts          # Lógica de procesamiento de pagos
├── pages/
│   └── api/
│       ├── auth/
│       │   └── quickbooks/
│       │       └── callback.ts     # Manejador callback OAuth
│       ├── payments/
│       │   ├── create.ts           # Crear cargo de pago
│       │   └── status.ts           # Verificar estado de pago
│       └── webhooks/
│           └── quickbooks.ts       # Manejador de webhook
└── components/
    └── checkout/
        └── QuickBooksCheckout.tsx  # Componente UI de checkout
```

### 1. Servicio QuickBooks (`src/services/quickbooks.service.ts`)

```typescript
/**
 * Servicio de QuickBooks Payments
 * Maneja OAuth, creación de pagos y verificación de webhooks
 */

import axios from 'axios';

const QB_BASE_URL = import.meta.env.QUICKBOOKS_ENVIRONMENT === 'production'
  ? 'https://api.intuit.com'
  : 'https://sandbox.intuit.com';

interface PaymentCharge {
  amount: number;
  currency: string;
  description: string;
  customer: {
    email: string;
    name: string;
  };
}

/**
 * Obtener URL de autorización OAuth
 */
export function getAuthorizationUrl(): string {
  const clientId = import.meta.env.QUICKBOOKS_CLIENT_ID;
  const redirectUri = import.meta.env.QUICKBOOKS_REDIRECT_URI;
  const state = generateRandomState(); // Implementar protección CSRF
  
  return `https://appcenter.intuit.com/connect/oauth2?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=com.intuit.quickbooks.payment&` +
    `state=${state}`;
}

/**
 * Intercambiar código de autorización por token de acceso
 */
export async function getAccessToken(authCode: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  realm_id: string;
}> {
  const response = await axios.post(
    'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: import.meta.env.QUICKBOOKS_REDIRECT_URI,
    }),
    {
      auth: {
        username: import.meta.env.QUICKBOOKS_CLIENT_ID,
        password: import.meta.env.QUICKBOOKS_CLIENT_SECRET,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  
  return response.data;
}

/**
 * Crear cargo de pago
 */
export async function createPaymentCharge(
  accessToken: string,
  charge: PaymentCharge
): Promise<{ chargeId: string; status: string }> {
  const companyId = import.meta.env.QUICKBOOKS_COMPANY_ID;
  
  const response = await axios.post(
    `${QB_BASE_URL}/quickbooks/v4/payments/charges`,
    {
      amount: charge.amount.toFixed(2),
      currency: charge.currency,
      description: charge.description,
      capture: true, // Capturar fondos inmediatamente
      context: {
        mobile: false,
        isEcommerce: true,
      },
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Request-Id': generateRequestId(), // Clave de idempotencia
      },
      params: {
        minorversion: 65,
      },
    }
  );
  
  return {
    chargeId: response.data.id,
    status: response.data.status,
  };
}

/**
 * Verificar firma de webhook
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const crypto = require('crypto');
  const secret = import.meta.env.QUICKBOOKS_WEBHOOK_SECRET;
  
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const calculatedSignature = hmac.digest('base64');
  
  return calculatedSignature === signature;
}

// Funciones auxiliares
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
```

## Pruebas

### Pruebas en Sandbox
1. Usa el entorno Sandbox de QuickBooks
2. Tarjetas de crédito de prueba:
   - **Éxito**: `4111111111111111`
   - **Rechazada**: `4000000000000002`
3. Cualquier fecha de expiración futura
4. Cualquier CVV de 3 dígitos

### Lista de Verificación de Pruebas
- [ ] Flujo OAuth se completa exitosamente
- [ ] Cargo de pago creado
- [ ] Webhook recibido y procesado
- [ ] Estado del pedido actualizado
- [ ] Carrito limpiado después de pago exitoso
- [ ] Manejo de errores funciona correctamente

## Despliegue en Producción

### 1. Cambiar a Entorno de Producción
```bash
QUICKBOOKS_ENVIRONMENT=production
```

### 2. Actualizar URIs de Redirección
Usa el dominio de producción en la configuración de la app QuickBooks

### 3. Habilitar Webhooks
Configura la URL de webhook de producción en el dashboard de QuickBooks

### 4. Lista de Verificación de Seguridad
- [ ] Variables de entorno aseguradas
- [ ] HTTPS habilitado
- [ ] Firmas de webhook verificadas
- [ ] Tokens de acceso encriptados en almacenamiento
- [ ] Limitación de tasa implementada
- [ ] Registro de errores configurado

## Solución de Problemas

### Problemas Comunes

**Error OAuth: URI de Redirección Inválida**
- Asegúrate de que el URI de redirección en el código coincida exactamente con la configuración de la app QuickBooks
- Verifica barras diagonales finales

**Pago Rechazado**
- Verifica números de tarjeta de prueba en sandbox
- Verifica formato de cantidad (debe ser decimal con 2 lugares)

**Webhook No Recibido**
- Verifica que la URL del webhook sea públicamente accesible
- Verifica la verificación de firma del webhook
- Revisa los logs de webhook de QuickBooks

### Recursos de Soporte
- [Documentación API QuickBooks](https://developer.intuit.com/app/developer/qbpayments/docs/get-started)
- [Guía OAuth 2.0](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0)
- [Referencia API Payments](https://developer.intuit.com/app/developer/qbpayments/docs/api/resources/all-entities/charges)

## Mantenimiento

### Actualización de Tokens
Los tokens de acceso expiran después de 1 hora. Implementa actualización automática:

```typescript
async function refreshAccessToken(refreshToken: string) {
  const response = await axios.post(
    'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    {
      auth: {
        username: import.meta.env.QUICKBOOKS_CLIENT_ID,
        password: import.meta.env.QUICKBOOKS_CLIENT_SECRET,
      },
    }
  );
  
  return response.data;
}
```

### Monitoreo
- Monitorear tasas de éxito/fallo de pagos
- Rastrear entrega de webhooks
- Registrar todos los errores de API
- Configurar alertas para pagos fallidos

## Próximos Pasos
1. Completar flujo OAuth y guardar Company ID
2. Implementar almacenamiento de tokens (base de datos encriptada)
3. Crear componente UI de checkout
4. Probar en entorno sandbox
5. Desplegar a producción
6. Monitorear y optimizar
