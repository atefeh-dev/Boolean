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
          <svg class="hero__success-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="var(--gold)"
              d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
            />
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

const { user, isLoggedIn, markSubscribed } = useAuth();

const email = ref("");
// Only tracks the current submit attempt (idle/loading) — not "have they
// ever subscribed", which now lives in the account (or, for guests, a
// cookie) rather than component/page state.
const status = useState<"idle" | "loading">("newsletter_submit_status", () => "idle");
const errorMsg = ref("");

const guestSubscribedCookie = useNewsletterGuestCookie();

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
