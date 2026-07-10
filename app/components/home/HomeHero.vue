<template>
  <section class="hero">
    <div>
      <p class="hero__eyebrow">since 1403</p>
      <h1 class="hero__title">پنج لینک خوب، هر روز کاری</h1>
      <p class="hero__desc">
        از میان صدها مقاله، ابزار و تجربه طراحی, هر روز فقط پنج مورد را
        برمی‌گزینیم — همان‌هایی که واقعاً ارزش وقت شما را دارند.
      </p>

      <form class="hero__form" novalidate @submit.prevent="onSubscribe">
        <input
          v-model="email"
          type="email"
          placeholder="ایمیل شما"
          dir="ltr"
          :disabled="state !== 'idle'"
          required
        />
        <UiAppButton
          type="submit"
          :variant="state === 'done' ? 'forest' : 'clay'"
          class="hero__submit-btn"
          :disabled="state !== 'idle'"
        >
          <span v-if="state === 'idle'" class="hero__btn-label">عضویت رایگان</span>
          <span v-else-if="state === 'loading'" class="hero__btn-label hero__btn-dots" aria-label="در حال ارسال">
            <span />
            <span />
            <span />
          </span>
          <span v-else class="hero__btn-label">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 10.5l4.5 4.5 7.5-9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            ثبت شد!
          </span>
        </UiAppButton>
      </form>

      <p v-if="errorMsg" class="hero__form-error">{{ errorMsg }}</p>
      <p v-else class="hero__note">بدون اسپم. هر روز کاری، یک ایمیل کوتاه.</p>
    </div>
    <ArtHomeHeroArt />
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";

const email = ref("");
const state = ref<"idle" | "loading" | "done">("idle");
const errorMsg = ref("");

async function onSubscribe() {
  if (!email.value.trim() || state.value !== "idle") return;
  state.value = "loading";
  errorMsg.value = "";

  try {
    const res = await $fetch<{ ok: boolean; alreadySubscribed: boolean }>(
      "/api/newsletter/subscribe",
      { method: "POST", body: { email: email.value } }
    );
    // Stay in done state — button shows success, form input clears.
    // Already-subscribed also counts as success (no error needed).
    state.value = "done";
    email.value = "";

    // If already subscribed, silently revert back to idle after a beat
    // so the user can try a different email if they want.
    if (res.alreadySubscribed) {
      setTimeout(() => { state.value = "idle"; }, 3000);
    }
  } catch (err) {
    const msg =
      err && typeof err === "object" && "data" in err
        ? (err as { data?: { statusMessage?: string } }).data?.statusMessage
        : undefined;
    errorMsg.value = msg || "مشکلی پیش آمد. دوباره تلاش کنید.";
    state.value = "idle";
  }
}
</script>
