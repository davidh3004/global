import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  
  // Detect language from the URL. English is the default; Spanish lives under /es.
  if (url.pathname.startsWith('/es')) {
    context.locals.lang = 'es';
  } else {
    context.locals.lang = 'en';
  }
  
  return next();
});
