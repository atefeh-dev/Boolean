const SUBSCRIBED_KEY = "booltan_subscribed";

// Guests have no account to attach a subscription to, so their status
// falls back to a cookie for this browser. A cookie (unlike localStorage)
// is sent with the initial request and readable during SSR, so the
// success state renders correctly on the very first paint — no flash of
// the form before flipping over on the client. Logged-in users always
// defer to the account instead, which is synced from the server on every
// navigation via the auth middleware.
//
// Extracted to a composable (rather than declared inline wherever it's
// needed) so every place that reads or writes it — the subscribe form,
// the unsubscribe flow — uses the exact same key and options. Two
// separate `useCookie` calls with a typo'd or drifted key would silently
// stop agreeing with each other.
export function useNewsletterGuestCookie() {
  return useCookie<"1" | undefined>(SUBSCRIBED_KEY, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
