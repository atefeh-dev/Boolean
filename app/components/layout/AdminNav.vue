<template>
  <nav class="nav admin-nav">
    <!-- Right: logo (RTL) -->
    <NuxtLink to="/" class="nav__brand">
      <span class="nav__brand-word">Booltan</span>
      <LayoutBrandLogo />
    </NuxtLink>

    <!-- Center: admin nav links -->
    <div class="nav__center">
      <div class="nav__links">
        <NuxtLink to="/admin" :aria-current="exact('/admin') ? 'page' : undefined">
          <IconsDashboard />
          داشبورد
        </NuxtLink>
        <NuxtLink to="/admin/links" :aria-current="isActive('/admin/links') ? 'page' : undefined">
          <IconsList />
          لینک‌ها
        </NuxtLink>
        <NuxtLink to="/admin/subscribers" :aria-current="isActive('/admin/subscribers') ? 'page' : undefined">
          <IconsUsers />
          مشترکان
        </NuxtLink>
        <NuxtLink to="/admin/newsletter" :aria-current="isActive('/admin/newsletter') ? 'page' : undefined">
          <IconsMail />
          خبرنامه
        </NuxtLink>
      </div>
    </div>

    <!-- Left: notifications + user menu (RTL = visually left) -->
    <div class="nav__right">
      <LayoutNotificationsBell />

      <LayoutUserMenu
        :name="user?.name ?? ''"
        role-label="مدیر سیستم"
        :subscribed="user?.subscribed"
        @logout="handleLogout"
        @unsubscribe="showUnsubscribeModal = true"
      />
    </div>

    <LayoutUnsubscribeModal v-model="showUnsubscribeModal" />
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { user, logout } = useAuth()
const { reset: resetNotifications } = useNotifications()
const showUnsubscribeModal = ref(false)

function exact(path: string) {
  return route.path === path
}
function isActive(path: string) {
  return route.path.startsWith(path)
}

async function handleLogout() {
  await logout()
  resetNotifications()
  router.push('/')
}
</script>
