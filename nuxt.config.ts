// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  runtimeConfig: {
    // Falls back to an obvious placeholder — server/plugins/startup.ts will
    // warn in dev and throw in production if this is still the default.
    authSecret: process.env.AUTH_SECRET || "dev-only-insecure-secret",
  },

  app: {
    head: {
      htmlAttrs: { lang: "fa", dir: "rtl" },
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&family=Newsreader:ital@1&display=swap",
        },
        { rel: "icon", type: "image/svg+xml", href: "/icon.svg" },
      ],
    },
  },

  css: ["~/assets/css/main.css"],

  nitro: {
    routeRules: {
      // Security headers applied to every response.
      "/**": {
        headers: {
          // Prevent this site from being embedded in iframes (clickjacking)
          "X-Frame-Options": "DENY",
          // Stop browsers from MIME-sniffing responses
          "X-Content-Type-Options": "nosniff",
          // Restrict referrer information sent to third parties
          "Referrer-Policy": "strict-origin-when-cross-origin",
          // Disable browser features we don't use
          "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
          // Enable XSS auditor in older browsers
          "X-XSS-Protection": "1; mode=block",
        },
      },
      // API routes: no caching, no embedding
      "/api/**": {
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    },
  },
});
