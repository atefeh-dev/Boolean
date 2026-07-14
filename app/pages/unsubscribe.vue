<template>
  <div class="auth-page">
    <LayoutAuthPanel
      heading="دلمون براتون تنگ می‌شه، ولی مشکلی نیست"
      footer="هر وقت خواستید، دوباره عضو شوید"
    />

    <div class="auth-form-side">
      <div class="auth-card">

        <!-- No/invalid token -->
        <template v-if="!token">
          <h1 class="auth-card__title">لینک نامعتبر</h1>
          <p class="auth-card__sub">
            این لینک لغو عضویت معتبر نیست.
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
          <h1 class="auth-card__title">عضویت شما لغو شد</h1>
          <p class="auth-card__sub">
            دیگر خبرنامه روزانه برای شما ارسال نمی‌شود.
          </p>
          <UiAppButton to="/" shape="rounded" size="lg" block class="auth-cta">
            بازگشت به صفحه اصلی
          </UiAppButton>
        </template>

        <!-- Confirm -->
        <template v-else>
          <h1 class="auth-card__title">لغو عضویت خبرنامه</h1>
          <p class="auth-card__sub">
            با تأیید، دیگر خبرنامه روزانه بولتن برای شما ارسال نمی‌شود.
          </p>

          <p v-if="errorMsg" class="auth-error">{{ errorMsg }}</p>

          <UiAppButton
            shape="rounded"
            size="lg"
            block
            class="auth-cta"
            :disabled="stage === 'loading'"
            @click="handleUnsubscribe"
          >
            {{ stage === "loading" ? "در حال لغو…" : "لغو عضویت" }}
          </UiAppButton>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsCheckCircle from "../components/icons/CheckCircle.vue"

definePageMeta({ layout: "auth", title: "بولتن — لغو عضویت خبرنامه" })

const route = useRoute()
const token = computed(() => route.query.token as string | undefined)

type Stage = "confirm" | "loading" | "done"
const stage = ref<Stage>("confirm")
const errorMsg = ref("")

async function handleUnsubscribe() {
  stage.value = "loading"
  errorMsg.value = ""
  try {
    await $fetch("/api/newsletter/unsubscribe", {
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
