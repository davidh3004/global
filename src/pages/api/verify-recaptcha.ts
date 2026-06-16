import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { token, action } = await request.json();

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'No token provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const secretKey = import.meta.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'reCAPTCHA not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify token with Google
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'reCAPTCHA verification failed',
          details: verifyData['error-codes']
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check score (for reCAPTCHA v3)
    const score = verifyData.score || 0;
    const threshold = 0.5; // Adjust this threshold as needed

    if (score < threshold) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Low reCAPTCHA score',
          score
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify action matches
    if (action && verifyData.action !== action) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Action mismatch'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        score,
        action: verifyData.action
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
