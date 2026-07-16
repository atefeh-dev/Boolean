// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  vite: {
    optimizeDeps: {
      include: [
        "@vee-validate/zod",
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "vee-validate",
        "vue3-apexcharts",
        "zod",
      ],
    },
  },

  runtimeConfig: {
    // Falls back to an obvious placeholder — server/plugins/startup.ts will
    // warn in dev and throw in production if this is still the default.
    authSecret: process.env.AUTH_SECRET || "dev-only-insecure-secret",
  },

  app: {
    head: {
      htmlAttrs: { lang: "fa", dir: "rtl" },
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/icon.svg" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      ],
    },
  },

  // Vazirmatn/Newsreader used to load from fonts.googleapis.com — two
  // third-party origins (CSS host + font-file host) in the critical
  // rendering path on every single page view. Self-hosted via @fontsource
  // instead: no external DNS/connection, no extra round trip, and the
  // exact weights actually used ship as part of the normal build.
  css: [
    "@fontsource/vazirmatn/400.css",
    "@fontsource/vazirmatn/500.css",
    "@fontsource/vazirmatn/600.css",
    "@fontsource/vazirmatn/700.css",
    "@fontsource/vazirmatn/800.css",
    "@fontsource/newsreader/400-italic.css",
    "~/assets/css/main.css",
  ],

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
      // API routes: no caching, no embedding, by default...
      "/api/**": {
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
      // Categories is a GET-only, public endpoint and can safely use SWR.
      // Do not cache `/api/links` here: that URL is shared by the public GET
      // list and the authenticated POST submission. Nitro route rules apply
      // to every HTTP method, so caching it can hide the POST request's
      // session cookie and incorrectly return 401, redirecting valid users
      // to `/login`.
      "/api/categories": { swr: 3600 },
    },
  },
});
