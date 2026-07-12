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
        <div v-if="showSuccess" key="success" class="hero__success">
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
              :class="{ 'is-invalid': !!fieldError }"
              :aria-invalid="!!fieldError"
              required
              @blur="emailBlurred = true"
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

          <UiFieldError v-if="displayError" :message="displayError" variant="light" />
          <p v-else-if="alreadySubscribedNotice" class="hero__note">
            این ایمیل قبلاً عضو خبرنامه است.
          </p>
          <p v-else class="hero__note">بدون اسپم. هر روز کاری، یک ایمیل کوتاه.</p>
        </div>
      </Transition>
    </div>
    <ArtHomeHeroArt />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { subscribeSchema } from "#shared/validation/schemas";

const { user, isLoggedIn, markSubscribed } = useAuth();

// A single-field form doesn't need the full useZodForm() ceremony — useField
// on its own, pinned to the same shared schema, is enough here.
const { value: email, errorMessage: fieldError } = useField<string>(
  "email",
  toTypedSchema(subscribeSchema.shape.email),
  { initialValue: "" }
);
const emailBlurred = ref(false);

// Only tracks the current submit attempt (idle/loading) — not "have they
// ever subscribed", which now lives in the account (or, for guests, a
// cookie) rather than component/page state.
const status = useState<"idle" | "loading">("newsletter_submit_status", () => "idle");
const serverError = ref("");
// True right after a submit that turned out to already be subscribed —
// only used to pick the note text below the (still-visible) form; it
// never affects THIS account's own subscribed state (see isOwnEmail below).
const alreadySubscribedNotice = ref(false);
// Keeps the form on screen for one extra beat after a "this email is
// already subscribed" result, even though `isSubscribed` below may have
// just flipped true (e.g. the guest cookie got set) — otherwise the note
// would be replaced by the success view before anyone could read it.
// Clears as soon as they touch the input again.
const suppressSuccessView = ref(false);
watch(email, () => {
  suppressSuccessView.value = false;
});

const guestSubscribedCookie = useNewsletterGuestCookie();

const isSubscribed = computed(() =>
  isLoggedIn.value ? !!user.value?.subscribed : guestSubscribedCookie.value === "1"
);
const showSuccess = computed(() => isSubscribed.value && !suppressSuccessView.value);

// Inline format errors only once the person has actually left the field —
// not while they're still mid-typing their first character. Server errors
// (rate limit, etc.) always take priority once they exist.
const displayError = computed(() =>
  serverError.value || (emailBlurred.value ? fieldError.value : "") || ""
);

async function onSubscribe() {
  emailBlurred.value = true;
  if (fieldError.value || status.value !== "idle") return;
  status.value = "loading";
  serverError.value = "";
  alreadySubscribedNotice.value = false;

  // Whether this submission is for the logged-in account's OWN email.
  // Someone logged in can still subscribe an email that isn't theirs
  // (e.g. an admin checking a member's status) — that must never flip
  // *their own* subscribed badge or guest cookie, only reflect the
  // result for the email they actually typed.
  const isOwnEmail =
    isLoggedIn.value && user.value?.email.toLowerCase() === email.value.toLowerCase();

  try {
    const res = await $fetch<{ ok: boolean; alreadySubscribed: boolean }>(
      "/api/newsletter/subscribe",
      { method: "POST", body: { email: email.value } }
    );

    if (isOwnEmail) {
      // Optimistic — the server already linked this subscription to the
      // account, so just reflect it in shared auth state immediately.
      markSubscribed();
    } else if (!isLoggedIn.value) {
      // Deliberately only set the guest cookie for guests, and only for
      // their own submission — logging out shouldn't retroactively mark
      // this browser subscribed, and a logged-in person subscribing a
      // different email shouldn't mark THIS browser as a subscribed
      // guest either.
      guestSubscribedCookie.value = "1";
    }

    if (res.alreadySubscribed && !isOwnEmail) {
      // Already on the list — say so instead of claiming a "join" that
      // didn't actually happen, and keep the form visible so the note
      // is actually readable (see suppressSuccessView above).
      alreadySubscribedNotice.value = true;
      suppressSuccessView.value = true;
      status.value = "idle";
      return;
    }

    email.value = "";
    emailBlurred.value = false;
    status.value = "idle";
  } catch (err) {
    const msg =
      err && typeof err === "object" && "data" in err
        ? (err as { data?: { statusMessage?: string } }).data?.statusMessage
        : undefined;
    serverError.value = msg || "مشکلی پیش آمد. دوباره تلاش کنید.";
    status.value = "idle";
  }
}
</script>
