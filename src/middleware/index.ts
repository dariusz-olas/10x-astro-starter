import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const response = await next();
  
  // Dla stron HTML - wyłącz cache, aby zawsze dostarczać najnowszą wersję
  const url = context.url;
  const protectedPaths = ['/dashboard', '/flashcards', '/generate', '/review'];
  
  if (url.pathname === '/' || protectedPaths.some(path => url.pathname.startsWith(path))) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  
  return response;
};

