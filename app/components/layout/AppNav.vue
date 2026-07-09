<template>
  <nav class="nav">
    <NuxtLink to="/" class="nav__brand">
      <span class="nav__brand-word">Booltan</span>
      <LayoutBrandLogo />
    </NuxtLink>

    <div class="nav__center">
      <div class="nav__links">
        <NuxtLink to="/archives" :aria-current="isActive('/archives') ? 'page' : undefined">
          <IconsArchive />
          آرشیو
        </NuxtLink>
        <NuxtLink to="/categories" :aria-current="isActive('/categories') ? 'page' : undefined">
          <IconsGrid />
          دسته‌بندی‌ها
        </NuxtLink>
      </div>
    </div>

    <div class="nav__right">
      <LayoutNotificationsBell v-if="isLoggedIn" />

      <NuxtLink
        to="/submit"
        class="nav__cta"
        :aria-current="isActive('/submit') ? 'page' : undefined"
      >
        <IconsPlus />
        ارسال لینک
      </NuxtLink>

      <LayoutUserMenu
        v-if="isLoggedIn"
        :name="user?.name ?? ''"
        role-label="کاربر"
        :admin-link-to="user?.role === 'ADMIN' ? '/admin' : undefined"
        @logout="handleLogout"
      />

      <div v-else class="nav__auth">
        <NuxtLink
          to="/login"
          class="nav__auth-link"
          :aria-current="isActive('/login') ? 'page' : undefined"
        >
          ورود
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { user, isLoggedIn, logout } = useAuth()
const { reset: resetNotifications } = useNotifications()

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

async function handleLogout() {
  await logout()
  resetNotifications()
  router.push('/')
}
</script>
