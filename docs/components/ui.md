# `ui/` — primitives

The closest thing this app has to a design system. These are generic — they
don't know about links, subscribers, or newsletters — and are used across
admin, auth, and public pages alike.

## `AppButton` → `<UiAppButton>`

The only button in the app. Renders as a `<NuxtLink>` when `to` is set,
otherwise a `<button>`.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `"forest" \| "clay" \| "white" \| "ghost" \| "outline" \| "neutral" \| "subtle" \| "danger" \| "text" \| "line" \| "icon" \| "icon-ghost"` | `"forest"` | See table below for when to use each |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | |
| `shape` | `"pill" \| "rounded"` | `"pill"` | `rounded` is 12px corners; `icon`/`icon-ghost` usually pair with `rounded` |
| `block` | `boolean` | `false` | Full width |
| `to` | `string` | `undefined` | If set, renders `<NuxtLink>` instead of `<button>`; `type`/`disabled` are ignored in this mode |
| `type` | `"button" \| "submit"` | `"button"` | Ignored when `to` is set |
| `disabled` | `boolean` | `false` | Ignored when `to` is set — a link can't be `disabled`; gate it with `v-if` instead |

### Slots

| Slot | Description |
|---|---|
| default | Button label / icon + label. SVG icons dropped in here are auto-sized (13–19px depending on `size`) via a scoped `:deep(svg)` rule — no manual sizing needed. |

### Choosing a variant

| Variant | Use for |
|---|---|
| `forest` | Primary action — submit, save, log in |
| `clay` | Primary action on light/warm surfaces — hero CTA, admin "approve" |
| `white` | Primary action on a dark or colored background |
| `ghost` | Secondary action on a dark surface |
| `outline` | Secondary action on a light surface — e.g. a modal's "cancel" |
| `neutral` | Inactive / not-yet-ready state |
| `subtle` | Low-emphasis action — "edit" |
| `danger` | Destructive or reject action |
| `text` | Tertiary, text-only action — "back" links |
| `line` | Bordered, forest text — pagination controls |
| `icon` | Icon-only, hovers clay — delete/dismiss |
| `icon-ghost` | Icon-only, hovers ink — nav-adjacent toggles (bell, chevrons) |

### Examples

```vue
<!-- Primary submit -->
<UiAppButton type="submit" :disabled="submitting">
  {{ submitting ? "در حال ارسال…" : "ارسال" }}
</UiAppButton>

<!-- Link styled as a button -->
<UiAppButton to="/submit" size="sm">
  <IconsPlus />
  ارسال لینک
</UiAppButton>

<!-- Icon-only, e.g. dismissing a toast/notification -->
<UiAppButton variant="icon" size="sm" aria-label="حذف این اعلان" @click="dismiss(item.id)">
  <IconsX />
</UiAppButton>

<!-- Destructive action inside a modal -->
<UiAppButton variant="danger" :disabled="stage === 'loading'" @click="handleUnsubscribe">
  {{ stage === 'loading' ? 'در حال لغو…' : 'لغو عضویت' }}
</UiAppButton>
```

Icon-only variants (`icon`, `icon-ghost`) render no visible text, so always
pass an `aria-label` — the component doesn't add one for you.

---

## `AppChip` → `<UiAppChip>`

A single filter/tab pill. Used in groups for category or archive filters —
`AppChip` itself doesn't manage which one is active; the parent does, via
`active`.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `active` | `boolean` | `false` | Sets the filled/selected style and `aria-selected` |
| `count` | `string \| number` | `undefined` | Renders a small badge after the label. Pass a pre-formatted string (e.g. already run through `toPersian()`) — the component does not format it for you |
| `size` | `"sm" \| "md"` | `"md"` | |

### Emits

| Event | Payload | When |
|---|---|---|
| `click` | `MouseEvent` | Chip clicked. The component has no internal selected state — the parent is expected to update `active` in response. |

### Example

```vue
<UiAppChip
  v-for="chip in chips"
  :key="chip.id"
  :active="chip.id === activeCategory"
  :count="toPersian(chip.count)"
  @click="activeCategory = chip.id"
>
  {{ chip.label }}
</UiAppChip>
```

---

## `AppToast` → `<UiAppToast>`

A single global toast, driven entirely by the `useToast()` composable. Mount
it once near the app root (it already is, in `app.vue`) — you should never
need to add another instance or pass it props.

### Props / Slots / Emits

None. All state (`toastMessage`, `toastVisible`) comes from `useToast()`.

### Usage

You don't render this directly in a page — you trigger it from anywhere via
the composable:

```ts
const { showToast } = useToast()
showToast("عضویت شما لغو شد.")
```

---

## `BrowserIcon` → `<UiBrowserIcon>`

A single decorative browser-window glyph (used in the archive/link-preview
UI as a generic "this is a link" icon). No props, no slots — purely
presentational, `aria-hidden="true"`.

```vue
<UiBrowserIcon />
```

---

## `UiFieldError` → `<UiUiFieldError>`

Renders a form field's validation error, with a fade/slide transition, or
nothing at all when there's no message.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `message` | `string \| null` | — | Nothing renders when falsy |
| `id` | `string` | `undefined` | Pair with the input's `aria-describedby` |
| `variant` | `"default" \| "light"` | `"default"` | Use `"light"` on dark backgrounds (e.g. the homepage hero) — `"default"`'s color is too low-contrast there |

### Example

```vue
<input :id="id" :aria-describedby="error ? `${id}-error` : undefined" ... />
<UiUiFieldError :id="`${id}-error`" :message="error" />

<!-- On a dark hero background -->
<UiUiFieldError :message="displayError" variant="light" />
```
