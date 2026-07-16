<template>
  <div class="auth-page">
    <LayoutAuthPanel />

    <div class="auth-form-side">
      <div class="auth-card">
        <div class="auth-card__mark" aria-hidden="true" />
        <h1 class="auth-card__title">ورود</h1>
        <p class="auth-card__sub">به بولتن خوش آمدید.</p>

        <p v-if="errorMsg && !unverified" class="auth-error">
          {{ errorMsg }}
        </p>

        <form novalidate @submit.prevent="onSubmit">
          <SharedAuthField
            id="f-email"
            v-model="email"
            label="ایمیل"
            type="text"
            name="email"
            autocomplete="email"
            placeholder="you@example.com"
            :error="errors.email"
            @blur="emailAttrs.onBlur"
          />

          <SharedAuthField
            id="f-password"
            v-model="password"
            label="رمز عبور"
            type="password"
            name="password"
            autocomplete="current-password"
            placeholder="••••••••"
            :error="errors.password"
            @blur="passwordAttrs.onBlur"
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

    <SharedVerifyEmailModal v-model="unverified" :email="email" />
  </div>
</template>

<script setup lang="ts">
import { loginSchema } from "#shared/validation/schemas"

definePageMeta({ layout: "auth", title: "بولتن — ورود" })

const route = useRoute()
const router = useRouter()
const { login } = useAuth()

const { defineField, errors, handleSubmit } = useZodForm(loginSchema, { email: "", password: "" })
const [email, emailAttrs] = defineField("email", { validateOnModelUpdate: false })
const [password, passwordAttrs] = defineField("password", { validateOnModelUpdate: false })

const loading = ref(false)
const errorMsg = ref("")
const unverified = ref(false)

const onSubmit = handleSubmit(async (values) => {
  errorMsg.value = ""
  unverified.value = false
  loading.value = true
  try {
    await login(values.email, values.password)
    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/"
    router.push(redirect)
  } catch (err) {
    const statusCode = err instanceof Error ? (err as Error & { statusCode?: number }).statusCode : undefined
    if (statusCode === 403) {
      // Unverified account — the modal (not inline text) explains this and
      // offers a resend action, rather than surfacing the raw "log in
      // first"-style message that doesn't tell the person why they can't.
      unverified.value = true
    } else {
      errorMsg.value = err instanceof Error ? err.message : "خطایی رخ داد."
    }
  } finally {
    loading.value = false
  }
})
</script>
