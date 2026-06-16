# Forms Documentation - Contact & Quote Forms

## 📋 Overview

The application has **two main forms** that collect user information, send email notifications via Resend, and store data in Firestore:

1. **Quote Form** (Main Hero Section)
2. **Contact Form** (Contact Page)

---

## 🎯 1. Quote Form (Hero Section)

### Location
- **Page**: `src/pages/[...lang].astro`
- **Lines**: 44-60
- **Form ID**: `mainQuoteForm`

### Purpose
Allows users to request a quote for recycled materials directly from the homepage hero section.

### Fields
- **Name** (required) - Customer's full name
- **Material** (required) - Type of material (Concrete, Asphalt, Road Base, Paver Base)
- **Quantity** (required) - Amount needed
- **Contact** (required) - Email or phone number

### API Endpoint
`POST /api/quote`

**Request Body:**
```json
{
  "name": "John Doe",
  "material": "Concrete",
  "quantity": "10 cubic yards",
  "contact": "john@example.com",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "quoteId": "abc123xyz",
  "message": "Quote request sent successfully"
}
```

### Firestore Collection
**Collection**: `leads`

**Document Structure:**
```javascript
{
  name: string,
  material: string,
  quantity: string,
  contact: string,
  language: 'en' | 'es',
  status: 'new',
  type: 'quote',
  createdAt: Timestamp
}
```

### Email Notification
- **Subject**: "New Quote Request from [Name]"
- **To**: `CONTACT_EMAIL_TO` (from .env)
- **From**: `CONTACT_EMAIL_FROM` (from .env)
- **Template**: Professional HTML email with quote details

---

## 📧 2. Contact Form (Contact Page)

### Location
- **Page**: `src/pages/contact.astro`
- **Component**: `src/components/contact/ContactForm.tsx`

### Purpose
General contact form for inquiries, questions, and customer support.

### Fields
- **Name** (required) - Full name
- **Email** (required) - Email address
- **Phone** (optional) - Phone number
- **Company** (optional) - Company name
- **Message** (required) - Detailed message

### Security
- ✅ **reCAPTCHA v3** protection
- ✅ **Score threshold**: 0.5
- ✅ **Action verification**: `contact_form`

### API Endpoint
`POST /api/contact`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "(813) 555-1234",
  "company": "ABC Corp",
  "message": "I need information about...",
  "recaptchaToken": "03AGdBq...",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "xyz789abc",
  "message": "Message sent successfully"
}
```

### Firestore Collection
**Collection**: `contactMessages`

**Document Structure:**
```javascript
{
  name: string,
  email: string,
  phone: string,
  company: string,
  message: string,
  language: 'en' | 'es',
  status: 'new' | 'read' | 'replied' | 'archived',
  createdAt: Timestamp,
  recaptchaScore: number
}
```

### Email Notification
- **Subject**: "New Contact Form Submission from [Name]"
- **To**: `CONTACT_EMAIL_TO` (from .env)
- **From**: `CONTACT_EMAIL_FROM` (from .env)
- **Template**: Professional HTML email with all contact details

---

## 🔄 Comparison

| Feature | Quote Form | Contact Form |
|---------|-----------|--------------|
| **Location** | Homepage Hero | Contact Page |
| **Purpose** | Material quotes | General inquiries |
| **Fields** | 4 (Name, Material, Quantity, Contact) | 5 (Name, Email, Phone, Company, Message) |
| **reCAPTCHA** | ❌ No | ✅ Yes (v3) |
| **Collection** | `leads` | `contactMessages` |
| **Type** | `quote` | N/A |
| **Status** | `new` | `new`, `read`, `replied`, `archived` |
| **Admin Panel** | `/admin/leads` | `/admin/contact-messages` |

---

## 📊 Admin Management

### Quote Requests
- **View**: `/admin/leads`
- **Filter**: By status, date, material
- **Actions**: View details, update status, delete

### Contact Messages
- **View**: `/admin/contact-messages`
- **Filter**: By status (New, Read, Replied, Archived)
- **Actions**: 
  - View full message
  - Update status
  - Delete message
  - See reCAPTCHA score

---

## 🔐 Security

### Quote Form
- ✅ Server-side validation
- ✅ Required field validation
- ✅ Firestore security rules
- ⚠️ No reCAPTCHA (consider adding for production)

### Contact Form
- ✅ Server-side validation
- ✅ Required field validation
- ✅ **reCAPTCHA v3** protection
- ✅ Score-based filtering (threshold: 0.5)
- ✅ Firestore security rules

---

## 📧 Email Configuration

Both forms use **Resend** for email notifications.

### Required Environment Variables
```env
RESEND_API_KEY=re_your_api_key
CONTACT_EMAIL_TO=info@globalrecyclingtampabay.com
CONTACT_EMAIL_FROM=noreply@globalrecyclingtampabay.com
```

### Email Templates
Both forms send professional HTML emails with:
- ✅ Branded header
- ✅ All form data formatted
- ✅ Bilingual support (EN/ES)
- ✅ Unique message/quote ID
- ✅ Timestamp

---

## 🌐 Internationalization

Both forms support **English and Spanish**:

### Language Detection
```javascript
const isEnglish = window.location.pathname.includes('/en');
const language = isEnglish ? 'en' : 'es';
```

### Dynamic Messages
- Success messages
- Error messages
- Button text
- Email content

All adapt based on the user's selected language.

---

## 🎨 User Experience

### Quote Form (Hero)
1. User fills out 4 fields
2. Clicks "Send Request" / "Enviar Solicitud"
3. Button shows "Sending..." / "Enviando..."
4. Success message appears in green
5. Form resets automatically
6. Message auto-hides after 5 seconds

### Contact Form (Page)
1. User fills out form
2. reCAPTCHA executes invisibly
3. Clicks "Send Message" / "Enviar Mensaje"
4. Button shows "Sending..." / "Enviando..."
5. Success message appears
6. Form resets automatically
7. Message auto-hides after 5 seconds

---

## 🔧 Implementation Details

### Quote Form Script
**File**: `src/pages/[...lang].astro` (lines 106-172)

```typescript
function setupQuoteForm(formId: string, btnId: string, msgId: string) {
  // Form submission handler
  // Calls /api/quote endpoint
  // Shows success/error messages
  // Resets form on success
}
```

### Contact Form Component
**File**: `src/components/contact/ContactForm.tsx`

```typescript
export default function ContactForm() {
  // React component with state management
  // reCAPTCHA integration
  // Calls /api/contact endpoint
  // Dynamic translations with useI18n hook
}
```

---

## 📝 Best Practices

### ✅ DO:
- Validate all fields server-side
- Log errors for debugging
- Send confirmation emails
- Store submissions in Firestore
- Provide bilingual support
- Show clear success/error messages
- Reset form after successful submission

### ❌ DON'T:
- Trust client-side validation only
- Expose API keys in frontend
- Skip error handling
- Forget to sanitize user input
- Ignore reCAPTCHA scores
- Leave forms without feedback

---

## 🐛 Troubleshooting

### Quote Form Not Submitting
1. Check `/api/quote` endpoint is accessible
2. Verify Firestore connection
3. Check Resend API key
4. Look for console errors
5. Verify form field names match API

### Contact Form Not Submitting
1. Check reCAPTCHA site key is configured
2. Verify `/api/verify-recaptcha` endpoint works
3. Check `/api/contact` endpoint is accessible
4. Verify Firestore connection
5. Check Resend API key
6. Look for console errors

### Emails Not Sending
1. Verify `RESEND_API_KEY` is correct
2. Check domain verification in Resend
3. Verify email addresses are valid
4. Check Resend dashboard for logs
5. Look for server-side errors

---

## 📚 Related Files

### Quote Form
- `src/pages/[...lang].astro` - Main page with form
- `src/pages/api/quote.ts` - API endpoint
- `public/locales/*/translation.json` - Translations

### Contact Form
- `src/pages/contact.astro` - Contact page
- `src/components/contact/ContactForm.tsx` - Form component
- `src/pages/api/contact.ts` - API endpoint
- `src/pages/api/verify-recaptcha.ts` - reCAPTCHA verification
- `src/components/security/RecaptchaProvider.tsx` - reCAPTCHA wrapper

### Admin
- `src/pages/admin/leads.astro` - Quote requests admin
- `src/pages/admin/contact-messages.astro` - Contact messages admin
- `src/components/admin/ContactMessagesTable.tsx` - Messages table

---

## 🎯 Summary

Both forms are fully functional with:
- ✅ Email notifications via Resend
- ✅ Firestore storage
- ✅ Bilingual support (EN/ES)
- ✅ Professional UI/UX
- ✅ Admin management panels
- ✅ Error handling
- ✅ Success feedback

**Quote Form**: Simple, fast material quotes from homepage
**Contact Form**: Detailed inquiries with reCAPTCHA protection
