# `layout/` — nav, footer, account chrome

Structural, page-frame components. Most of these read from `useAuth()`,
`useNotifications()`, or `useToast()` directly rather than taking that data
as props — they're meant to be dropped into a page layout as-is, not
reused as generic presentational pieces.

## `AppNav` → `<LayoutAppNav>`

The public-site header: brand, archive/categories links, submit CTA,
notifications bell, and either a login link or the user menu.

### Props / Emits

None. Pulls `user`, `isLoggedIn`, `logout` from `useAuth()` and
`resetNotifications` from `useNotifications()` directly, and owns its own
`showUnsubscribeModal` state, rendering `LayoutUnsubscribeModal` internally.

### Example

```vue
<!-- app/layouts/default.vue -->
<template>
  <LayoutAppNav />
  <slot />
  <LayoutAppFooter />
</template>
```

Because it's fully self-contained, there's nothing to configure — the only
way to change what it shows is to change auth state (log in/out) or the
current route (active-link highlighting is computed from `useRoute()`
internally).

---

## `AdminNav` → `<LayoutAdminNav>`

The admin-section equivalent of `AppNav` — dashboard/links/subscribers/
newsletter links instead of the public nav's archive/categories links.
Same self-contained shape: no props, reads `useAuth()` directly, renders its
own `UnsubscribeModal`.

```vue
<!-- app/layouts/admin.vue -->
<template>
  <LayoutAdminNav />
  <slot />
</template>
```

---

## `AppFooter` → `<LayoutAppFooter>`

Static footer with archive/categories/submit/contact links and a copyright
line. No props, no slots, no logic — if the links or copy need to change,
edit the component directly rather than trying to configure it.

---

## `BrandLogo` → `<LayoutBrandLogo>`

The "B" mark SVG used in both nav bars and the auth panel. No props.
`aria-hidden="true"` — always pair it with visible text (both navs put
"Booltan" next to it) rather than relying on the mark alone for the brand
name.

```vue
<NuxtLink to="/" class="nav__brand">
  <span class="nav__brand-word">Booltan</span>
  <LayoutBrandLogo />
</NuxtLink>
```

---

## `UserMenu` → `<LayoutUserMenu>`

The account dropdown shown in both navs once a user is logged in. Purely
presentational/controlled — it doesn't call `useAuth()` itself; the parent
nav passes in the display data and handles the actual logout/unsubscribe
side effects.

### Props

| Prop | Type | Required | Notes |
|---|---|---|---|
| `name` | `string` | yes | Shown as the label; its first character becomes the avatar initial |
| `roleLabel` | `string` | yes | e.g. `"کاربر"` or `"مدیر سیستم"` |
| `adminLinkTo` | `string` | no | If set, adds a "پنل مدیریت" item linking here. Omit for non-admin users |
| `subscribed` | `boolean` | no | If truthy, adds a "لغو عضویت خبرنامه" item |

### Emits

| Event | When |
|---|---|
| `logout` | "خروج از حساب" clicked |
| `unsubscribe` | "لغو عضویت خبرنامه" clicked — the parent is expected to open `UnsubscribeModal` in response, not perform the unsubscribe itself |

### Example

```vue
<LayoutUserMenu
  :name="user?.name ?? ''"
  role-label="کاربر"
  :admin-link-to="user?.role === 'ADMIN' ? '/admin' : undefined"
  :subscribed="user?.subscribed"
  @logout="handleLogout"
  @unsubscribe="showUnsubscribeModal = true"
/>
```

Closes itself on outside click and `Escape` — no need to manage its open
state from outside.

---

## `NotificationsBell` → `<LayoutNotificationsBell>`

The bell icon + dropdown panel showing link-approval notifications, with
swipe-to-dismiss on touch devices. Fully self-contained: reads from
`useNotifications()`, polls for new notifications every 45s while closed,
and marks everything read as soon as the panel opens.

### Props / Emits

None.

```vue
<LayoutNotificationsBell v-if="isLoggedIn" />
```

Only render it when there's a logged-in user with something to be notified
about — both navs gate it behind `isLoggedIn` (or, for the admin nav, always
show it since every admin-nav visitor is logged in by definition).

---

## `UnsubscribeModal` → `<LayoutUnsubscribeModal>`

The confirm/cancel modal for unsubscribing from the newsletter, with a small
animated illustration that reacts to hover and cursor position. Supports
`v-model` for open/closed state; everything else (the actual API call,
toast, auth-state update) is handled internally.

### Props (v-model)

| Prop | Type | Default |
|---|---|---|
| `modelValue` (via `defineModel`) | `boolean` | `false` |

### Example

```vue
<script setup lang="ts">
const showUnsubscribeModal = ref(false)
</script>

<template>
  <UiAppButton @click="showUnsubscribeModal = true">لغو عضویت</UiAppButton>
  <LayoutUnsubscribeModal v-model="showUnsubscribeModal" />
</template>
```

On confirm, it calls `POST /api/newsletter/unsubscribe`, updates auth state
via `markUnsubscribed()`, clears the guest newsletter cookie, and shows a
toast — the parent doesn't need to (and shouldn't) duplicate any of that; its
only job is opening the modal.

---

## `AuthPanel` → `<LayoutAuthPanel>`

The decorative side panel shown next to the login/register/forgot-password
forms — brand mark, a static "curated daily" pitch, and three hardcoded
sample link previews.

### Props

| Prop | Type | Default |
|---|---|---|
| `heading` | `string` | `"هر روز، پنج لینک که ارزش وقتتان را دارد"` |
| `footer` | `string` | `"بهترین محتوای طراحی، هر روز کاری در صندوق ورودی شما"` |

The three sample "picks" shown in the panel are hardcoded inside the
component, not a prop — if you need different picks per page, that's a
component change, not a usage change.

```vue
<LayoutAuthPanel />
<!-- or, with page-specific copy -->
<LayoutAuthPanel heading="به خبرنامه بولتن خوش آمدید" />
```
