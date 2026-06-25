import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { db } from '../../firebase/server';
import { FieldValue } from 'firebase-admin/firestore';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, email, phone, company, message, recaptchaToken, language } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify reCAPTCHA token
    if (!recaptchaToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'reCAPTCHA token missing' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const verifyResponse = await fetch(`${new URL(request.url).origin}/api/verify-recaptcha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: recaptchaToken, action: 'contact_form' }),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      return new Response(
        JSON.stringify({ success: false, error: 'reCAPTCHA verification failed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Save to Firestore
    const contactData = {
      name,
      email,
      phone: phone || '',
      company: company || '',
      message,
      language: language || 'en',
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
      recaptchaScore: verifyData.score || 0,
    };

    const docRef = await db.collection('contactMessages').add(contactData);

    // Send email notification using Resend
    const emailTo = import.meta.env.CONTACT_EMAIL_TO || 'info@globalrecyclingtampabay.com';
    const emailFrom = import.meta.env.CONTACT_EMAIL_FROM || 'noreply@globalrecyclingtampabay.com';

    const isEnglish = language === 'en';

    try {
      const { data: emailData, error: resendError } = await resend.emails.send({
        from: emailFrom,
        to: emailTo,
        subject: isEnglish 
          ? `New Contact Form Submission from ${name}` 
          : `Nuevo Mensaje de Contacto de ${name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2D8C4E; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .field { margin-bottom: 20px; }
                .label { font-weight: bold; color: #2D8C4E; }
                .value { margin-top: 5px; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">${isEnglish ? 'New Contact Message' : 'Nuevo Mensaje de Contacto'}</h1>
                </div>
                <div class="content">
                  <div class="field">
                    <div class="label">${isEnglish ? 'Name:' : 'Nombre:'}</div>
                    <div class="value">${name}</div>
                  </div>
                  <div class="field">
                    <div class="label">${isEnglish ? 'Email:' : 'Correo Electrónico:'}</div>
                    <div class="value"><a href="mailto:${email}">${email}</a></div>
                  </div>
                  ${phone ? `
                    <div class="field">
                      <div class="label">${isEnglish ? 'Phone:' : 'Teléfono:'}</div>
                      <div class="value">${phone}</div>
                    </div>
                  ` : ''}
                  ${company ? `
                    <div class="field">
                      <div class="label">${isEnglish ? 'Company:' : 'Empresa:'}</div>
                      <div class="value">${company}</div>
                    </div>
                  ` : ''}
                  <div class="field">
                    <div class="label">${isEnglish ? 'Message:' : 'Mensaje:'}</div>
                    <div class="value">${message.replace(/\n/g, '<br>')}</div>
                  </div>
                  <div class="footer">
                    <p>${isEnglish ? 'This message was sent from the contact form on your website.' : 'Este mensaje fue enviado desde el formulario de contacto de tu sitio web.'}</p>
                    <p>${isEnglish ? 'Message ID:' : 'ID del Mensaje:'} ${docRef.id}</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      // The Resend SDK does NOT throw on API errors (invalid key, unverified
      // domain, test-mode recipient restrictions, etc.) — it returns them in
      // `error`. We must check it explicitly or failures go unnoticed.
      if (resendError) {
        console.error('Resend API error (contact):', resendError);
      } else {
        console.log('Contact email sent via Resend:', emailData?.id);
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email fails, data is already saved
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: docRef.id,
        message: isEnglish ? 'Message sent successfully' : 'Mensaje enviado exitosamente'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
