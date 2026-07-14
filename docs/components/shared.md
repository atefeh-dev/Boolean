# `shared/` — cross-page building blocks

Small components used on more than one page but not generic enough to live
in `ui/` — they know about a specific concern (auth fields, page headers)
rather than being pure presentation primitives.

## `AuthField` → `<SharedAuthField>`

A labeled text input with built-in error display, used on the login,
register, and forgot/reset-password pages. Supports `v-model`. When
`type="password"`, it automatically adds a show/hide toggle button.

### Props

| Prop | Type | Default | Required | Notes |
|---|---|---|---|---|
| `modelValue` | `string` | — | yes | |
| `id` | `string` | — | yes | Used for the `<label for>` / input pairing and the error's `aria-describedby` |
| `label` | `string` | — | yes | |
| `type` | `string` | `"text"` | no | Any input type; `"password"` specifically triggers the show/hide toggle |
| `name` | `string` | `undefined` | no | |
| `autocomplete` | `string` | `undefined` | no | |
| `placeholder` | `string` | `undefined` | no | |
| `disabled` | `boolean` | `false` | no | |
| `required` | `boolean` | `true` | no | |
| `error` | `string \| null` | `null` | no | Passed straight through to `UiFieldError` |

### Emits (v-model)

| Event | Payload |
|---|---|
| `update:modelValue` | `string` |
| `blur` | — |

### Example

```vue
<SharedAuthField
  id="email"
  v-model="email"
  label="ایمیل"
  type="email"
  autocomplete="email"
  :error="emailError"
  @blur="emailTouched = true"
/>

<SharedAuthField
  id="password"
  v-model="password"
  label="رمز عبور"
  type="password"
  autocomplete="current-password"
  :error="passwordError"
/>
```

The password-visibility toggle is entirely internal state (`visible` ref) —
you don't control or observe it from the parent.

---

## `PageHero` → `<SharedPageHero>`

The eyebrow / title / description header block used at the top of the
archives, categories, and submit pages, paired with a page-specific
illustration from `art/`.

### Props

| Prop | Type | Required | Notes |
|---|---|---|---|
| `eyebrow` | `string` | yes | Small label above the title |
| `title` | `string` | yes | |
| `description` | `string` | yes | |
| `artComponent` | `Component` | yes | A Vue component (not a string) rendered beside the text — pass one of the `art/*` components |

### Slots

None — this is a fixed three-piece layout (eyebrow, title, description) plus
the art component. If a page needs more than that, compose around
`PageHero` rather than extending it.

### Example

```vue
<script setup lang="ts">
import ArchiveHeroArt from '~/components/art/ArchiveHeroArt.vue'
</script>

<template>
  <SharedPageHero
    eyebrow="آرشیو"
    title="همه لینک‌های منتشرشده"
    description="مرور کامل خبرنامه‌های پیشین بر اساس تاریخ یا دسته‌بندی."
    :art-component="ArchiveHeroArt"
  />
</template>
```

Because `artComponent` takes a `Component` value rather than a slot, the
same `art/*` component reference can be reused for both the hero and any
other spot that wants the identical illustration, without duplicating markup.
