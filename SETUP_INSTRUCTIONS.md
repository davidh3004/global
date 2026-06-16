# Setup Instructions - reCAPTCHA & Contact Form

## 📋 Overview

This document provides step-by-step instructions to configure:
1. **Google reCAPTCHA v3** for checkout and contact form security
2. **Resend** email service for contact form notifications
3. **Firestore** collection for storing contact messages

---

## 🔐 1. Google reCAPTCHA v3 Setup

### Step 1: Create reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click **"+"** to create a new site
3. Fill in the form:
   - **Label**: Global Recycling Tampa Bay
   - **reCAPTCHA type**: Select **reCAPTCHA v3**
   - **Domains**: Add your domains:
     - `localhost` (for development)
     - `yourdomain.com` (your production domain)
4. Click **Submit**
5. Copy the **Site Key** and **Secret Key**

### Step 2: Add Keys to Environment Variables

Add these to your `.env` file:

```env
PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

⚠️ **Important**: 
- `PUBLIC_RECAPTCHA_SITE_KEY` must start with `PUBLIC_` to be accessible in the browser
- `RECAPTCHA_SECRET_KEY` should NEVER be exposed to the client

---

## 📧 2. Resend Email Service Setup

### Step 1: Create Resend Account

1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### Step 2: Get API Key

1. Go to **API Keys** in your Resend dashboard
2. Click **Create API Key**
3. Name it: `Global Recycling Contact Form`
4. Copy the API key (you won't be able to see it again!)

### Step 3: Verify Domain (Production)

For production, you need to verify your domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain: `globalrecyclingtampabay.com`
4. Follow the DNS verification instructions
5. Wait for verification (usually takes a few minutes)

### Step 4: Add to Environment Variables

```env
RESEND_API_KEY=re_your_api_key_here
CONTACT_EMAIL_TO=info@globalrecyclingtampabay.com
CONTACT_EMAIL_FROM=noreply@globalrecyclingtampabay.com
```

⚠️ **For Development**:
- Use the test API key
- Emails will only be sent to verified email addresses
- You can use any `@resend.dev` email for testing

---

## 🔥 3. Firestore Collection Setup

### Collection: `contactMessages`

The collection is automatically created when the first message is submitted.

**Document Structure**:
```javascript
{
  name: string,              // Contact's full name
  email: string,             // Contact's email
  phone: string,             // Contact's phone (optional)
  company: string,           // Contact's company (optional)
  message: string,           // The message content
  language: 'en' | 'es',     // Language of submission
  status: 'new' | 'read' | 'replied' | 'archived',
  createdAt: Timestamp,      // Auto-generated timestamp
  recaptchaScore: number     // reCAPTCHA score (0-1)
}
```

### Firestore Security Rules

Add these rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Contact Messages - Admin only
    match /contactMessages/{messageId} {
      allow read, write: if request.auth != null && 
                         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 🚀 4. Testing

### Test reCAPTCHA

1. Go to `/checkout` page
2. Fill out the form
3. Submit - you should see reCAPTCHA verification in console
4. Check that the order is created successfully

### Test Contact Form

1. Go to `/contact` page
2. Fill out the contact form
3. Submit the form
4. Check:
   - ✅ Success message appears
   - ✅ Email is received at `CONTACT_EMAIL_TO`
   - ✅ Message appears in `/admin/contact-messages`

### Test Admin Panel

1. Log in as admin
2. Go to `/admin/contact-messages`
3. You should see all submitted messages
4. Test:
   - ✅ View message details
   - ✅ Update status (New → Read → Replied → Archived)
   - ✅ Delete message

---

## 📝 5. Environment Variables Summary

Create a `.env` file in the project root with:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Google reCAPTCHA v3
PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Resend (Email Service)
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL_TO=info@globalrecyclingtampabay.com
CONTACT_EMAIL_FROM=noreply@globalrecyclingtampabay.com

# Stripe (if using)
PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

---

## 🎯 6. Features Implemented

### ✅ reCAPTCHA v3 Integration
- **Checkout page**: Verifies users before payment processing
- **Contact form**: Prevents spam submissions
- **Score-based filtering**: Blocks low-score submissions (< 0.5)
- **Action verification**: Ensures tokens match expected actions

### ✅ Contact Form
- **Bilingual**: Works in English and Spanish
- **Validation**: Client-side and server-side validation
- **reCAPTCHA protected**: Spam prevention
- **Email notifications**: Sends email via Resend
- **Firestore storage**: Saves all messages to database
- **Responsive design**: Works on all devices

### ✅ Admin Panel
- **Contact Messages page**: View all submissions
- **Filtering**: Filter by status (New, Read, Replied, Archived)
- **Status management**: Update message status
- **Message details**: View full message with metadata
- **Delete functionality**: Remove spam or unwanted messages
- **Real-time updates**: Uses Firestore snapshots

---

## 🔒 7. Security Considerations

1. **reCAPTCHA Secret Key**: Never expose to client
2. **Resend API Key**: Keep server-side only
3. **Firestore Rules**: Ensure only admins can access contact messages
4. **Email validation**: Both client and server-side
5. **Rate limiting**: Consider adding rate limits to API endpoints

---

## 📱 8. Language Support

All components support dynamic language switching:

- **Default language**: English (`en`)
- **Supported languages**: English, Spanish
- **Persistence**: Language preference saved in localStorage
- **No page reload**: Language changes happen instantly

---

## 🐛 9. Troubleshooting

### reCAPTCHA not loading
- Check that `PUBLIC_RECAPTCHA_SITE_KEY` is set correctly
- Verify domain is added in reCAPTCHA console
- Check browser console for errors

### Emails not sending
- Verify `RESEND_API_KEY` is correct
- Check domain verification status
- Ensure email addresses are valid
- Check Resend dashboard for logs

### Messages not appearing in admin
- Verify Firestore security rules
- Check user has admin role
- Look for console errors
- Verify Firebase configuration

---

## 📞 Support

For issues or questions, contact the development team or refer to:
- [reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/v3)
- [Resend Documentation](https://resend.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
