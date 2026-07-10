<template>
  <div class="auth-page">
    <LayoutAuthPanel />

    <div class="auth-form-side">
      <div class="auth-card">
        <div class="auth-card__mark" aria-hidden="true" />
        <h1 class="auth-card__title">ورود</h1>
        <p class="auth-card__sub">به بولتن خوش آمدید.</p>

        <p v-if="errorMsg" class="auth-error">{{ errorMsg }}</p>

        <form novalidate @submit.prevent="handleSubmit">
          <SharedAuthField
            id="f-email"
            v-model="form.email"
            label="ایمیل"
            type="text"
            name="email"
            autocomplete="email"
            placeholder="you@example.com"
          />

          <SharedAuthField
            id="f-password"
            v-model="form.password"
            label="رمز عبور"
            type="password"
            name="password"
            autocomplete="current-password"
            placeholder="••••••••"
          />

          <div class="auth-card__forgot">
            <NuxtLink to="/forgot-password">فراموشی رمز عبور؟</NuxtLink>
          </div>

          <UiAppButton type="submit" shape="rounded" size="lg" block class="auth-cta" :disabled="loading">
            {{ loading ? "در حال ورود..." : "ورود به حساب" }}
          </UiAppButton>
        </form>

        <p class="auth-card__foot">
          حساب کاربری ندارید؟ <NuxtLink to="/register">ثبت‌نام کنید</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth", title: "بولتن — ورود" })

const route = useRoute()
const router = useRouter()
const { login } = useAuth()
const form = reactive({ email: "", password: "" })
const loading = ref(false)
const errorMsg = ref("")

async function handleSubmit() {
  errorMsg.value = ""
  loading.value = true
  try {
    await login(form.email, form.password)
    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/"
    router.push(redirect)
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : "خطایی رخ داد."
  } finally {
    loading.value = false
  }
}
</script>
