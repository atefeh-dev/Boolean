# `icons/` — icon set

18 components, one per icon. Every single one follows the exact same shape,
so this is one doc instead of 18.

## The pattern

```vue
<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- icon-specific paths -->
  </svg>
</template>
```

- **No props, no emits, no slots, on any icon component.** They're
  intentionally as dumb as possible.
- **Color comes from `currentColor`** — an icon takes on whatever `color`
  the surrounding text/button has. To recolor one, set `color` on a parent
  or wrapper, not by editing the icon.
- **Size comes from the parent**, usually via a `:deep(svg) { width; height }`
  rule on the component that renders it (`AppButton` and `AppChip` both do
  this) rather than a `size` prop on the icon itself. If you're dropping an
  icon somewhere with no existing sizing rule, add `width`/`height` (or
  `font-size` + `1em` sizing) in that parent's own scoped styles — don't add
  a size prop to the icon component; that would break the one-pattern-fits-all
  consistency across all 18.
- **`aria-hidden="true"` on every icon.** They're always decorative relative
  to adjacent text, or the interactive element around them carries its own
  `aria-label` (see `AppButton`'s icon-only variants). Don't rely on an
  icon alone to convey meaning to a screen reader.

## The set

| Component | Usage | Used in |
|---|---|---|
| `IconsArchive` | Archive nav link | `AppNav` |
| `IconsBell` | Notifications trigger | `NotificationsBell` |
| `IconsCheckCircle` | Success / published state | `NotificationsBell`, `AdminKpis`, `AdminGrowthPanel` |
| `IconsChevronDown` | Dropdown affordance | `UserMenu` |
| `IconsClock` | Pending / time-based state | `NotificationsBell`, `AdminKpis`, `AdminQueuePanel` |
| `IconsDashboard` | Dashboard nav link | `AdminNav`, `UserMenu` |
| `IconsEye` | "Show password" | `AuthField` |
| `IconsEyeOff` | "Hide password" | `AuthField` |
| `IconsGrid` | Categories nav link | `AppNav`, `AdminKpis`, `AdminCategoryChart` |
| `IconsList` | Links nav link | `AdminNav` |
| `IconsMail` | Newsletter nav link | `AdminNav`, `AdminNewsletterPanel` |
| `IconsMailOff` | "Unsubscribe" menu item | `UserMenu` |
| `IconsPlus` | "Submit link" CTA | `AppNav` |
| `IconsPower` | "Log out" menu item | `UserMenu` |
| `IconsSend` | Newsletter send action | `AdminNewsletterPanel` |
| `IconsTrash` | Delete action | (available for admin link-queue actions) |
| `IconsUsers` | Subscribers nav link / member counts | `AdminNav`, `AdminKpis`, `AdminContributorsPanel`, `AdminMembersPanel`, `AdminSignupsPanel`, `AdminSubscriberChart` |
| `IconsX` | Close / dismiss | `NotificationsBell`, `UnsubscribeModal` |
| `IconsXCircle` | Rejected / error state | `NotificationsBell`, `AdminKpis` |

## Example

```vue
<UiAppButton variant="icon" size="sm" aria-label="حذف">
  <IconsTrash />
</UiAppButton>
```

## Adding a new icon

Copy an existing icon component as a template (`Bell.vue` is a simple,
representative one), keep the same `viewBox`/`stroke-*` attributes so it
matches the set's visual weight, swap the inner paths, and give it a
descriptive PascalCase filename — the component name is auto-derived from
that filename (`icons/Download.vue` → `<IconsDownload>`), so there's no
registration step beyond adding the file.
