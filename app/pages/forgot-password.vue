<template>
  <div class="auth-page">
    <LayoutAuthPanel
      heading="رمز عبورتان را فراموش کرده‌اید؟ مشکلی نیست."
      footer="لینک بازیابی تنها یک ساعت معتبر است"
    />

    <div class="auth-form-side">
      <div class="auth-card">

        <template v-if="sent">
          <div class="auth-success-icon">
            <IconsMail />
          </div>
          <h1 class="auth-card__title">ایمیل ارسال شد</h1>
          <p class="auth-card__sub">
            اگر این ایمیل در سیستم ما ثبت شده باشد، لینک بازیابی برای
            <strong dir="ltr" style="color: var(--ink)">{{ sentEmail }}</strong>
            ارسال شد. پوشه اسپم را هم بررسی کنید.
          </p>
          <UiAppButton to="/login" shape="rounded" size="lg" block class="auth-cta">
            بازگشت به ورود
          </UiAppButton>
        </template>

        <template v-else>
          <div class="auth-card__mark" aria-hidden="true" />
          <h1 class="auth-card__title">بازیابی رمز</h1>
          <p class="auth-card__sub">
            ایمیل حساب خود را وارد کنید تا لینک بازیابی برایتان ارسال شود.
          </p>

          <p v-if="errorMsg" class="auth-error">{{ errorMsg }}</p>

          <form novalidate @submit.prevent="handleSubmit">
            <SharedAuthField
              id="f-email"
              v-model="email"
              label="ایمیل"
              type="text"
              name="email"
              autocomplete="email"
              placeholder="you@example.com"
              :disabled="loading"
            />

            <UiAppButton type="submit" shape="rounded" size="lg" block class="auth-cta" :disabled="loading">
              {{ loading ? "در حال ارسال..." : "ارسال لینک بازیابی" }}
            </UiAppButton>
          </form>

          <p class="auth-card__foot">
            رمز عبور را به خاطر آوردید؟ <NuxtLink to="/login">ورود</NuxtLink>
          </p>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsMail from "../components/icons/Mail.vue"

definePageMeta({ layout: "auth", title: "بولتن — فراموشی رمز عبور" })

const email = ref("")
const loading = ref(false)
const errorMsg = ref("")
const sent = ref(false)
const sentEmail = ref("")

async function handleSubmit() {
  if (!email.value.trim()) return
  loading.value = true
  errorMsg.value = ""
  try {
    await $fetch("/api/auth/forgot-password", {
      method: "POST",
      body: { email: email.value },
    })
    sentEmail.value = email.value.trim()
    sent.value = true
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : "خطایی رخ داد."
  } finally {
    loading.value = false
  }
}
</script>
