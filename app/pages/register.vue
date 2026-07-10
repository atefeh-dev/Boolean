<template>
  <div class="auth-page">
    <LayoutAuthPanel
      heading="اولین قدم برای دسترسی به بهترین محتوای طراحی"
      footer="رایگان، بدون اسپم، هر روز کاری"
    />

    <div class="auth-form-side">
      <div class="auth-card">
        <div class="auth-card__mark" aria-hidden="true" />
        <h1 class="auth-card__title">ثبت‌نام</h1>
        <p class="auth-card__sub">در کمتر از یک دقیقه عضو شوید.</p>

        <p v-if="errorMsg" class="auth-error">{{ errorMsg }}</p>

        <form novalidate @submit.prevent="handleSubmit">
          <SharedAuthField
            id="f-name"
            v-model="form.name"
            label="نام"
            name="name"
            autocomplete="name"
            placeholder="نام شما"
          />
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
            autocomplete="new-password"
            placeholder="حداقل ۸ کاراکتر"
          />

          <UiAppButton type="submit" shape="rounded" size="lg" block class="auth-cta" :disabled="loading">
            {{ loading ? "در حال ساخت حساب..." : "ساخت حساب کاربری" }}
          </UiAppButton>
        </form>

        <p class="auth-card__foot">
          قبلاً ثبت‌نام کرده‌اید؟ <NuxtLink to="/login">وارد شوید</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth", title: "بولتن — ثبت‌نام" })

const route = useRoute()
const router = useRouter()
const { register } = useAuth()
const form = reactive({ name: "", email: "", password: "" })
const loading = ref(false)
const errorMsg = ref("")

async function handleSubmit() {
  errorMsg.value = ""
  if (form.password.length < 8) {
    errorMsg.value = "رمز عبور باید حداقل ۸ کاراکتر باشد."
    return
  }
  loading.value = true
  try {
    await register(form.name, form.email, form.password)
    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/"
    router.push(redirect)
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : "خطایی رخ داد."
  } finally {
    loading.value = false
  }
}
</script>
