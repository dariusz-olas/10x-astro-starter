import type { MiddlewareHandler } from "astro";
import { onRequest as loggingOnRequest } from "./logging";

export const onRequest: MiddlewareHandler = async (context, next) => {
  // First, run logging middleware for API routes
  if (context.url.pathname.startsWith("/api/")) {
    return loggingOnRequest(context, next);
  }

  // Then, run cache control middleware for HTML pages
  const response = await next();

  // Dla stron HTML - wyłącz cache, aby zawsze dostarczać najnowszą wersję
  const url = context.url;
  const protectedPaths = ["/dashboard", "/flashcards", "/generate", "/review"];

  if (url.pathname === "/" || protectedPaths.some((path) => url.pathname.startsWith(path))) {
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
};
