<template>
  <Teleport to="body">
    <Transition name="verify-fade">
      <div v-if="open" class="verify" role="dialog" aria-modal="true" aria-labelledby="verify-title">
        <div class="verify__backdrop" @click="close" />

        <div class="verify__card">
          <button type="button" class="verify__close" aria-label="بستن" @click="close">
            <IconsX />
          </button>

          <div class="verify__icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <rect x="4" y="10" width="40" height="28" rx="6" stroke="var(--forest)" stroke-width="2.5" />
              <path d="M6 14l18 14 18-14" stroke="var(--forest)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>

          <div class="verify__body">
            <h2 id="verify-title" class="verify__title">ایمیل شما تأیید نشده است</h2>
            <p class="verify__subtitle">
              ایمیل شما تأیید نشده است. لطفاً پیش از ورود، ایمیل خود را با استفاده از لینکی که برایتان ارسال
              کرده‌ایم تأیید کنید. لینک تأیید به آدرس <strong dir="ltr">{{ email }}</strong> ارسال شده است.
            </p>

            <p v-if="resendState === 'sent'" class="verify__hint verify__hint--success">
              ایمیل تأیید دوباره ارسال شد ✓
            </p>
            <p v-else-if="resendState === 'error'" class="verify__hint verify__hint--error">
              ارسال ایمیل ناموفق بود. کمی بعد دوباره تلاش کنید.
            </p>

            <div class="verify__actions">
              <UiAppButton
                variant="outline"
                :disabled="resendState === 'sending'"
                @click="handleResend"
              >
                {{ resendState === "sending" ? "در حال ارسال..." : "ارسال دوباره ایمیل تأیید" }}
              </UiAppButton>
              <UiAppButton variant="outline" @click="close">بستن</UiAppButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const open = defineModel<boolean>({ default: false })

const props = defineProps<{ email: string }>()

type ResendState = "idle" | "sending" | "sent" | "error"
const resendState = ref<ResendState>("idle")

function close() {
  open.value = false
}

watch(open, (val) => {
  if (val) resendState.value = "idle"
})

async function handleResend() {
  if (resendState.value === "sending") return
  resendState.value = "sending"
  try {
    await $fetch("/api/auth/resend-verification", {
      method: "POST",
      body: { email: props.email },
    })
    resendState.value = "sent"
  } catch {
    // Resend is enumeration-safe and basically can't fail in a way that's
    // useful to show beyond a generic retry hint.
    resendState.value = "error"
  }
}
</script>
