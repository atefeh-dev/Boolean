<template>
  <section class="hero">
    <div>
      <p class="hero__eyebrow">since 1403</p>
      <h1 class="hero__title">پنج لینک خوب، هر روز کاری</h1>
      <p class="hero__desc">
        از میان صدها مقاله، ابزار و تجربه طراحی, هر روز فقط پنج مورد را
        برمی‌گزینیم — همان‌هایی که واقعاً ارزش وقت شما را دارند.
      </p>

      <Transition name="hero-swap-fade" mode="out-in">
        <div v-if="isSubscribed" key="success" class="hero__success">
          <svg class="hero__success-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="var(--gold)" stroke-width="1.6" />
            <circle cx="8.5" cy="10" r="1.1" fill="var(--gold)" />
            <circle cx="15.5" cy="10" r="1.1" fill="var(--gold)" />
            <path d="M7.5 14c1 1.6 2.8 2.6 4.5 2.6s3.5-1 4.5-2.6" stroke="var(--gold)" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <p class="hero__success-title">خوشحالیم که عضو ما هستید!</p>
        </div>

        <div v-else key="form">
          <form class="hero__form" novalidate @submit.prevent="onSubscribe">
            <input
              v-model="email"
              type="email"
              placeholder="ایمیل شما"
              dir="ltr"
              :disabled="status !== 'idle'"
              required
            />
            <UiAppButton
              type="submit"
              variant="clay"
              class="hero__submit-btn"
              :disabled="status !== 'idle'"
            >
              <span v-if="status === 'idle'" class="hero__btn-label">عضویت رایگان</span>
              <span v-else class="hero__btn-label hero__btn-dots" aria-label="در حال ارسال">
                <span />
                <span />
                <span />
              </span>
            </UiAppButton>
          </form>

          <p v-if="errorMsg" class="hero__form-error">{{ errorMsg }}</p>
          <p v-else class="hero__note">بدون اسپم. هر روز کاری، یک ایمیل کوتاه.</p>
        </div>
      </Transition>
    </div>
    <ArtHomeHeroArt />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const SUBSCRIBED_KEY = "booltan_subscribed";

const { user, isLoggedIn, markSubscribed } = useAuth();

const email = ref("");
// Only tracks the current submit attempt (idle/loading) — not "have they
// ever subscribed", which now lives in the account (or, for guests, a
// cookie) rather than component/page state.
const status = useState<"idle" | "loading">("newsletter_submit_status", () => "idle");
const errorMsg = ref("");

// Guests have no account to attach a subscription to, so their status
// falls back to a cookie for this browser. A cookie (unlike localStorage)
// is sent with the initial request and readable during SSR, so the
// success state renders correctly on the very first paint — no flash of
// the form before flipping over on the client. Logged-in users always
// defer to the account (see isSubscribed below), which is synced from the
// server on every navigation via the auth middleware, so it's consistent
// across browsers/devices without anything extra here.
const guestSubscribedCookie = useCookie<"1" | undefined>(SUBSCRIBED_KEY, {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax",
});

const isSubscribed = computed(() =>
  isLoggedIn.value ? !!user.value?.subscribed : guestSubscribedCookie.value === "1"
);

async function onSubscribe() {
  if (!email.value.trim() || status.value !== "idle") return;
  status.value = "loading";
  errorMsg.value = "";

  try {
    // Both a fresh signup and an already-subscribed email land the same
    // way: the person is a subscriber, so the form stays gone for good
    // and they see the same friendly confirmation.
    await $fetch<{ ok: boolean; alreadySubscribed: boolean }>(
      "/api/newsletter/subscribe",
      { method: "POST", body: { email: email.value } }
    );

    if (isLoggedIn.value) {
      // Optimistic — the server already linked this subscription to the
      // account, so just reflect it in shared auth state immediately.
      // Deliberately NOT also setting the guest cookie here: that would
      // leak this account's subscription into anonymous/guest state for
      // this browser, so logging out (or a different account logging in
      // on the same browser later) would incorrectly still show
      // "subscribed". Once logged out, subscribed status should only
      // reflect what THIS browser did anonymously.
      markSubscribed();
    } else {
      guestSubscribedCookie.value = "1";
    }

    email.value = "";
    status.value = "idle";
  } catch (err) {
    const msg =
      err && typeof err === "object" && "data" in err
        ? (err as { data?: { statusMessage?: string } }).data?.statusMessage
        : undefined;
    errorMsg.value = msg || "مشکلی پیش آمد. دوباره تلاش کنید.";
    status.value = "idle";
  }
}
</script>
