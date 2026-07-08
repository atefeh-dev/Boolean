export default defineNuxtRouteMiddleware(async (to) => {
  const { isLoggedIn, ensureFetched } = useAuth()
  await ensureFetched()

  if (!isLoggedIn.value) {
    return navigateTo({
      path: "/login",
      query: { redirect: to.fullPath },
    })
  }
})
