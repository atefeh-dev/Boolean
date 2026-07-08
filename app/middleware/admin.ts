export default defineNuxtRouteMiddleware(async (to) => {
  const { user, isLoggedIn, ensureFetched } = useAuth()
  await ensureFetched()

  if (!isLoggedIn.value) {
    return navigateTo({ path: "/login", query: { redirect: to.fullPath } })
  }

  if (user.value?.role !== "ADMIN") {
    return navigateTo("/")
  }
})
