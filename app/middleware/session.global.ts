// Runs on every route so the nav (logged-in name / login link) is always
// correct, including on first SSR paint. Cheap no-op after the first call
// per request/session since useAuth() tracks an `initialized` flag.
export default defineNuxtRouteMiddleware(async () => {
  const { ensureFetched } = useAuth()
  await ensureFetched()
})
