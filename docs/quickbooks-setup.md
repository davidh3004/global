# QuickBooks Payments Integration Setup Guide

## Overview
This guide provides step-by-step instructions for integrating QuickBooks Payments into the Global Recycling e-commerce platform. The integration enables secure payment processing for customer orders.

## Architecture

### Components
- **Frontend**: Shopping cart and checkout UI (Astro pages)
- **Backend**: API routes for payment processing (`/api/payments/*`)
- **Service Layer**: `src/services/quickbooks.service.ts`
- **Order Management**: `src/services/order.service.ts`

### Payment Flow
1. User adds products to cart
2. User proceeds to checkout
3. Frontend initiates payment via API route
4. Backend creates QuickBooks payment charge
5. User completes payment via QuickBooks
6. Webhook confirms payment
7. Order status updated to "paid"
8. Cart cleared, order confirmation sent

## Prerequisites

### 1. QuickBooks Developer Account
1. Go to [developer.intuit.com](https://developer.intuit.com)
2. Sign in or create an account
3. Navigate to "My Apps" dashboard

### 2. Create a QuickBooks App

#### Step 1: Create New App
1. Click "Create an app"
2. Select "QuickBooks Online and Payments"
3. Choose app name: "Global Recycling Payments"
4. Select scopes:
   - `com.intuit.quickbooks.payment` (Required for payments)
   - `com.intuit.quickbooks.accounting` (Optional for accounting integration)

#### Step 2: Get API Credentials
After creating the app, you'll receive:
- **Client ID**: Your app's public identifier
- **Client Secret**: Your app's private key (keep secure!)

**Important**: Never commit these credentials to version control.

### 3. Configure OAuth 2.0

#### Redirect URIs
Add these redirect URIs in your app settings:

**Development (Sandbox)**:
```
http://localhost:4321/api/auth/quickbooks/callback
```

**Production**:
```
https://reciclaje-five.vercel.app/api/auth/quickbooks/callback
https://yourdomain.com/api/auth/quickbooks/callback
```

#### Webhook URLs
Configure webhooks to receive payment notifications:

**Development**:
```
http://localhost:4321/api/webhooks/quickbooks
```

**Production**:
```
https://reciclaje-five.vercel.app/api/webhooks/quickbooks
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# QuickBooks API Credentials
QUICKBOOKS_CLIENT_ID=your_client_id_here
QUICKBOOKS_CLIENT_SECRET=your_client_secret_here

# Environment (sandbox or production)
QUICKBOOKS_ENVIRONMENT=sandbox

# OAuth Redirect URI
QUICKBOOKS_REDIRECT_URI=http://localhost:4321/api/auth/quickbooks/callback

# Webhook Secret (for verifying webhook signatures)
QUICKBOOKS_WEBHOOK_SECRET=your_webhook_secret_here

# QuickBooks Company ID (Realm ID)
QUICKBOOKS_COMPANY_ID=your_company_id_here
```

### Getting Your Company ID (Realm ID)
1. Complete OAuth flow (see below)
2. The Realm ID is returned in the OAuth callback
3. Save it to your environment variables

## Implementation

### File Structure
```
src/
├── services/
│   ├── quickbooks.service.ts      # QuickBooks API integration
│   ├── order.service.ts            # Order management (already exists)
│   └── payment.service.ts          # Payment processing logic
├── pages/
│   └── api/
│       ├── auth/
│       │   └── quickbooks/
│       │       └── callback.ts     # OAuth callback handler
│       ├── payments/
│       │   ├── create.ts           # Create payment charge
│       │   └── status.ts           # Check payment status
│       └── webhooks/
│           └── quickbooks.ts       # Webhook handler
└── components/
    └── checkout/
        └── QuickBooksCheckout.tsx  # Checkout UI component
```

### 1. QuickBooks Service (`src/services/quickbooks.service.ts`)

```typescript
/**
 * QuickBooks Payments Service
 * Handles OAuth, payment creation, and webhook verification
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
 * Get OAuth authorization URL
 */
export function getAuthorizationUrl(): string {
  const clientId = import.meta.env.QUICKBOOKS_CLIENT_ID;
  const redirectUri = import.meta.env.QUICKBOOKS_REDIRECT_URI;
  const state = generateRandomState(); // Implement CSRF protection
  
  return `https://appcenter.intuit.com/connect/oauth2?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=com.intuit.quickbooks.payment&` +
    `state=${state}`;
}

/**
 * Exchange authorization code for access token
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
 * Create payment charge
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
      capture: true, // Immediately capture funds
      context: {
        mobile: false,
        isEcommerce: true,
      },
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Request-Id': generateRequestId(), // Idempotency key
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
 * Verify webhook signature
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

// Helper functions
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
```

### 2. OAuth Callback Handler (`src/pages/api/auth/quickbooks/callback.ts`)

```typescript
import type { APIRoute } from 'astro';
import { getAccessToken } from '../../../../services/quickbooks.service';

export const GET: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const realmId = url.searchParams.get('realmId');
  
  if (!code || !realmId) {
    return new Response('Missing authorization code or realm ID', { status: 400 });
  }
  
  try {
    const tokens = await getAccessToken(code);
    
    // Store tokens securely (use database or secure session)
    // For production, use encrypted storage
    // Example: await storeTokens(tokens);
    
    console.log('QuickBooks connected successfully');
    console.log('Realm ID:', realmId);
    console.log('Save this Realm ID to QUICKBOOKS_COMPANY_ID in .env');
    
    return redirect('/admin/config?qb=success');
  } catch (error) {
    console.error('OAuth error:', error);
    return redirect('/admin/config?qb=error');
  }
};
```

### 3. Payment Creation Endpoint (`src/pages/api/payments/create.ts`)

```typescript
import type { APIRoute } from 'astro';
import { createPaymentCharge } from '../../../services/quickbooks.service';
import { createOrderFromCart } from '../../../services/order.service';
import { getCurrentUser } from '../../../services/auth.service';

export const POST: APIRoute = async ({ request }) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    const { customerEmail, customerName, customerPhone } = await request.json();
    
    // Create order from cart
    const order = await createOrderFromCart(
      user.uid,
      customerEmail,
      customerName,
      customerPhone
    );
    
    // Get access token (retrieve from secure storage)
    const accessToken = await getStoredAccessToken();
    
    // Create QuickBooks payment charge
    const payment = await createPaymentCharge(accessToken, {
      amount: order.total,
      currency: 'USD',
      description: `Order ${order.orderNumber}`,
      customer: {
        email: customerEmail,
        name: customerName,
      },
    });
    
    // Update order with payment ID
    await updatePaymentStatus(order.id!, 'pending', payment.chargeId);
    
    return new Response(JSON.stringify({
      success: true,
      orderId: order.id,
      paymentId: payment.chargeId,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### 4. Webhook Handler (`src/pages/api/webhooks/quickbooks.ts`)

```typescript
import type { APIRoute } from 'astro';
import { verifyWebhookSignature } from '../../../services/quickbooks.service';
import { updatePaymentStatus, updateOrderStatus } from '../../../services/order.service';

export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get('intuit-signature');
  const payload = await request.text();
  
  // Verify webhook signature
  if (!signature || !verifyWebhookSignature(payload, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  const event = JSON.parse(payload);
  
  // Handle payment events
  if (event.eventType === 'PAYMENT.CAPTURED') {
    const paymentId = event.payload.id;
    const orderId = event.payload.metadata?.orderId;
    
    if (orderId) {
      await updatePaymentStatus(orderId, 'paid', paymentId);
      await updateOrderStatus(orderId, 'processing');
    }
  }
  
  return new Response('OK', { status: 200 });
};
```

## Testing

### Sandbox Testing
1. Use QuickBooks Sandbox environment
2. Test credit card numbers:
   - **Success**: `4111111111111111`
   - **Decline**: `4000000000000002`
3. Any future expiration date
4. Any 3-digit CVV

### Test Checklist
- [ ] OAuth flow completes successfully
- [ ] Payment charge created
- [ ] Webhook received and processed
- [ ] Order status updated
- [ ] Cart cleared after successful payment
- [ ] Error handling works correctly

## Production Deployment

### 1. Switch to Production Environment
```bash
QUICKBOOKS_ENVIRONMENT=production
```

### 2. Update Redirect URIs
Use production domain in QuickBooks app settings

### 3. Enable Webhooks
Configure production webhook URL in QuickBooks dashboard

### 4. Security Checklist
- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] Webhook signatures verified
- [ ] Access tokens encrypted in storage
- [ ] Rate limiting implemented
- [ ] Error logging configured

## Troubleshooting

### Common Issues

**OAuth Error: Invalid Redirect URI**
- Ensure redirect URI in code matches QuickBooks app settings exactly
- Check for trailing slashes

**Payment Declined**
- Verify test card numbers in sandbox
- Check amount format (must be decimal with 2 places)

**Webhook Not Received**
- Verify webhook URL is publicly accessible
- Check webhook signature verification
- Review QuickBooks webhook logs

### Support Resources
- [QuickBooks API Documentation](https://developer.intuit.com/app/developer/qbpayments/docs/get-started)
- [OAuth 2.0 Guide](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0)
- [Payments API Reference](https://developer.intuit.com/app/developer/qbpayments/docs/api/resources/all-entities/charges)

## Maintenance

### Token Refresh
Access tokens expire after 1 hour. Implement automatic refresh:

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

### Monitoring
- Monitor payment success/failure rates
- Track webhook delivery
- Log all API errors
- Set up alerts for failed payments

## Next Steps
1. Complete OAuth flow and save Company ID
2. Implement token storage (encrypted database)
3. Create checkout UI component
4. Test in sandbox environment
5. Deploy to production
6. Monitor and optimize
