# QuickBooks intuit_tid Logging Implementation

## 📋 Overview

Following Intuit's best practices, we've implemented logging of the `intuit_tid` header in all QuickBooks API calls. This transaction ID is crucial for debugging and support requests with Intuit.

---

## 🔍 What is intuit_tid?

The `intuit_tid` is a unique transaction identifier returned by QuickBooks in the response headers of every API call. It helps Intuit support team:

- Track specific API requests
- Debug issues faster
- Provide better support
- Correlate logs across systems

**Intuit Recommendation**: Always log this value for production debugging.

---

## ✅ Implementation Details

### Modified File: `src/services/quickbooks.service.ts`

We've added `intuit_tid` logging to **all three QuickBooks API functions**:

#### 1. **getAccessToken** (OAuth Token Exchange)

**Location**: Lines 78-85

```typescript
// Log intuit_tid for debugging (Intuit recommendation)
const intuitTid = response.headers.get('intuit_tid');
console.log('[QuickBooks OAuth] intuit_tid:', intuitTid);

if (!response.ok) {
  const err = await response.text();
  console.error('[QuickBooks OAuth] Token exchange failed. intuit_tid:', intuitTid);
  throw new Error(`OAuth token exchange failed: ${err}`);
}
```

**When it runs**: During initial QuickBooks authorization
**Logged as**: `[QuickBooks OAuth] intuit_tid: xxxxx`

---

#### 2. **refreshAccessToken** (Token Refresh)

**Location**: Lines 110-117

```typescript
// Log intuit_tid for debugging (Intuit recommendation)
const intuitTid = response.headers.get('intuit_tid');
console.log('[QuickBooks Refresh] intuit_tid:', intuitTid);

if (!response.ok) {
  const err = await response.text();
  console.error('[QuickBooks Refresh] Token refresh failed. intuit_tid:', intuitTid);
  throw new Error(`Token refresh failed: ${err}`);
}
```

**When it runs**: Every time the access token expires (every hour)
**Logged as**: `[QuickBooks Refresh] intuit_tid: xxxxx`

---

#### 3. **createPaymentCharge** (Payment Processing)

**Location**: Lines 187-208

```typescript
// Log intuit_tid for debugging (Intuit recommendation)
const intuitTid = response.headers.get('intuit_tid');
console.log('[QuickBooks Payment] intuit_tid:', intuitTid, 'Request-Id:', requestId);

if (!response.ok) {
  const err = await response.text();
  console.error('[QuickBooks] Payment charge failed:', {
    status: response.status,
    statusText: response.statusText,
    error: err,
    intuit_tid: intuitTid,
    request_id: requestId,
  });
  throw new Error(`Payment charge failed (${response.status}): ${err}`);
}

const data = await response.json();
console.log('[QuickBooks] Payment charge created:', {
  chargeId: data.id,
  intuit_tid: intuitTid,
  request_id: requestId,
});
```

**When it runs**: Every time a customer makes a payment
**Logged as**: `[QuickBooks Payment] intuit_tid: xxxxx Request-Id: xxxxx`

---

## 📊 Log Examples

### Successful Payment
```
[QuickBooks] Creating payment charge: {
  url: 'https://sandbox.api.intuit.com/quickbooks/v4/payments/charges',
  amount: '150.00',
  currency: 'USD',
  requestId: '1704825600000-a1b2c3d4e5f6g7h8'
}
[QuickBooks Payment] intuit_tid: 1234567890abcdef Request-Id: 1704825600000-a1b2c3d4e5f6g7h8
[QuickBooks] Payment charge created: {
  chargeId: 'CHG_abc123xyz',
  intuit_tid: '1234567890abcdef',
  request_id: '1704825600000-a1b2c3d4e5f6g7h8'
}
```

### Failed Payment
```
[QuickBooks Payment] intuit_tid: 1234567890abcdef Request-Id: 1704825600000-a1b2c3d4e5f6g7h8
[QuickBooks] Payment charge failed: {
  status: 400,
  statusText: 'Bad Request',
  error: 'Invalid card number',
  intuit_tid: '1234567890abcdef',
  request_id: '1704825600000-a1b2c3d4e5f6g7h8'
}
```

### Token Refresh
```
[Checkout API] Token expired, refreshing...
[QuickBooks Refresh] intuit_tid: fedcba0987654321
[Checkout API] Token refreshed successfully
```

---

## 🔧 How to Use These Logs

### 1. **For Debugging**
When an error occurs, check the logs for the `intuit_tid`:
```bash
# Search Firebase logs
grep "intuit_tid" logs.txt

# Or in console
console.log output will show: [QuickBooks Payment] intuit_tid: xxxxx
```

### 2. **For Support Requests**
When contacting Intuit support, provide:
- The `intuit_tid` from the failed request
- The `Request-Id` (our internal ID)
- Timestamp of the request
- Error message

Example support request:
```
Subject: Payment Charge Failed - intuit_tid: 1234567890abcdef

Details:
- intuit_tid: 1234567890abcdef
- Request-Id: 1704825600000-a1b2c3d4e5f6g7h8
- Timestamp: 2026-01-09 15:00:00 UTC
- Error: Payment charge failed (400): Invalid card number
- Environment: Sandbox
```

### 3. **For Monitoring**
Set up alerts for failed requests:
```javascript
// Example: Alert if payment fails
if (error && intuitTid) {
  sendAlert({
    type: 'QUICKBOOKS_PAYMENT_FAILED',
    intuit_tid: intuitTid,
    request_id: requestId,
    error: error.message,
  });
}
```

---

## 📝 Best Practices

### ✅ DO:
- Always include `intuit_tid` in error logs
- Store `intuit_tid` with order records for future reference
- Provide `intuit_tid` when contacting Intuit support
- Monitor logs for patterns of failures

### ❌ DON'T:
- Don't expose `intuit_tid` to end users
- Don't use `intuit_tid` for business logic
- Don't assume `intuit_tid` format will remain constant

---

## 🔐 Security Considerations

- `intuit_tid` is **safe to log** - it doesn't contain sensitive data
- It's a transaction identifier, not authentication data
- Can be shared with Intuit support without security concerns
- Should be included in internal logs but not exposed in public APIs

---

## 📚 Additional Resources

- [Intuit Developer Documentation](https://developer.intuit.com/app/developer/qbpayments/docs/api/resources/all-entities/charges)
- [QuickBooks Payments API Reference](https://developer.intuit.com/app/developer/qbpayments/docs/get-started)
- [OAuth 2.0 Implementation](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0)

---

## 🎯 Summary

All QuickBooks API calls now log `intuit_tid` for:
- ✅ OAuth token exchange (`getAccessToken`)
- ✅ Token refresh (`refreshAccessToken`)
- ✅ Payment charges (`createPaymentCharge`)

This follows Intuit's recommendation and will help with debugging and support requests.

**Location**: All changes are in `src/services/quickbooks.service.ts`

**Impact**: Better debugging, faster support resolution, improved monitoring
