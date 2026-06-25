import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { db } from '../../firebase/server';
import { FieldValue } from 'firebase-admin/firestore';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, material, quantity, contact, language } = await request.json();

    // Validate required fields
    if (!name || !material || !quantity || !contact) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Save to Firestore (same collection as leads for consistency)
    const quoteData = {
      name,
      material,
      quantity,
      contact,
      language: language || 'en',
      status: 'new',
      type: 'quote', // To differentiate from other leads
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('leads').add(quoteData);

    // Send email notification using Resend
    const emailTo = import.meta.env.CONTACT_EMAIL_TO || 'info@globalrecyclingtampabay.com';
    const emailFrom = import.meta.env.CONTACT_EMAIL_FROM || 'noreply@globalrecyclingtampabay.com';

    const isEnglish = language === 'en';

    try {
      const { data: emailData, error: resendError } = await resend.emails.send({
        from: emailFrom,
        to: emailTo,
        subject: isEnglish 
          ? `New Quote Request from ${name}` 
          : `Nueva Solicitud de Cotización de ${name}`,
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
                .badge { display: inline-block; padding: 4px 12px; background: #EAF6EE; color: #2D8C4E; border-radius: 12px; font-size: 12px; font-weight: 600; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">${isEnglish ? 'New Quote Request' : 'Nueva Solicitud de Cotización'}</h1>
                  <span class="badge">${isEnglish ? 'QUOTE' : 'COTIZACIÓN'}</span>
                </div>
                <div class="content">
                  <div class="field">
                    <div class="label">${isEnglish ? 'Name:' : 'Nombre:'}</div>
                    <div class="value">${name}</div>
                  </div>
                  <div class="field">
                    <div class="label">${isEnglish ? 'Contact:' : 'Contacto:'}</div>
                    <div class="value">${contact}</div>
                  </div>
                  <div class="field">
                    <div class="label">${isEnglish ? 'Material:' : 'Material:'}</div>
                    <div class="value">${material}</div>
                  </div>
                  <div class="field">
                    <div class="label">${isEnglish ? 'Quantity:' : 'Cantidad:'}</div>
                    <div class="value">${quantity}</div>
                  </div>
                  <div class="footer">
                    <p>${isEnglish ? 'This quote request was submitted from the main form on your website.' : 'Esta solicitud de cotización fue enviada desde el formulario principal de tu sitio web.'}</p>
                    <p>${isEnglish ? 'Quote ID:' : 'ID de Cotización:'} ${docRef.id}</p>
                    <p>${isEnglish ? 'Language:' : 'Idioma:'} ${isEnglish ? 'English' : 'Spanish'}</p>
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
        console.error('Resend API error (quote):', resendError);
      } else {
        console.log('Quote email sent via Resend:', emailData?.id);
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email fails, data is already saved
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        quoteId: docRef.id,
        message: isEnglish ? 'Quote request sent successfully' : 'Solicitud de cotización enviada exitosamente'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Quote form error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
