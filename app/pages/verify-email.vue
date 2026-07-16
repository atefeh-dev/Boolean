<template>
  <div class="auth-page">
    <LayoutAuthPanel
      heading="یک قدم تا تکمیل ثبت‌نام"
      footer="با تأیید ایمیل، حساب شما کامل می‌شود"
    />

    <div class="auth-form-side">
      <div class="auth-card">

        <!-- No/invalid token -->
        <template v-if="!token">
          <h1 class="auth-card__title">لینک نامعتبر</h1>
          <p class="auth-card__sub">
            این لینک تأیید ایمیل معتبر نیست.
          </p>
          <UiAppButton to="/" shape="rounded" size="lg" block class="auth-cta">
            بازگشت به صفحه اصلی
          </UiAppButton>
        </template>

        <!-- Done -->
        <template v-else-if="stage === 'done'">
          <div class="auth-success-icon">
            <IconsCheckCircle />
          </div>
          <h1 class="auth-card__title">ایمیل شما تأیید شد</h1>
          <p class="auth-card__sub">
            حساب شما فعال شد. اکنون می‌توانید وارد شوید.
          </p>
          <UiAppButton to="/login" shape="rounded" size="lg" block class="auth-cta">
            ورود به حساب
          </UiAppButton>
        </template>

        <!-- Confirm -->
        <template v-else>
          <h1 class="auth-card__title">تأیید ایمیل</h1>
          <p class="auth-card__sub">
            برای فعال‌سازی کامل حساب خود، ایمیل‌تان را تأیید کنید.
          </p>

          <p v-if="errorMsg" class="auth-error">{{ errorMsg }}</p>

          <UiAppButton
            shape="rounded"
            size="lg"
            block
            class="auth-cta"
            :disabled="stage === 'loading'"
            @click="handleVerify"
          >
            {{ stage === "loading" ? "در حال تأیید…" : "تأیید ایمیل" }}
          </UiAppButton>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsCheckCircle from "../components/icons/CheckCircle.vue"

definePageMeta({ layout: "auth", title: "بولتن — تأیید ایمیل" })

const route = useRoute()
const token = computed(() => route.query.token as string | undefined)

type Stage = "confirm" | "loading" | "done"
const stage = ref<Stage>("confirm")
const errorMsg = ref("")

async function handleVerify() {
  stage.value = "loading"
  errorMsg.value = ""
  try {
    await $fetch("/api/auth/verify-email", {
      method: "POST",
      body: { token: token.value },
    })
    stage.value = "done"
  } catch (err) {
    stage.value = "confirm"
    const msg = err && typeof err === "object" && "data" in err
      ? (err as { data?: { message?: string } }).data?.message
      : undefined
    errorMsg.value = msg || "خطایی رخ داد. دوباره تلاش کنید."
  }
}
</script>
