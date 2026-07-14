# Component documentation

Reference docs for every component in `app/components/`, grouped the same way the
folder is. Each page documents props, emits/v-model, slots, and includes a
realistic usage example pulled from (or matching) how the component is actually
used in the app — nothing here is aspirational API that isn't real yet.

| Doc | Covers | Components |
|---|---|---|
| [`ui.md`](./ui.md) | Generic, reusable primitives — the closest thing this app has to a design system | `AppButton`, `AppChip`, `AppToast`, `BrowserIcon`, `UiFieldError` |
| [`shared.md`](./shared.md) | Small cross-page building blocks | `AuthField`, `PageHero` |
| [`layout.md`](./layout.md) | Nav, footer, and account-menu chrome | `AppNav`, `AdminNav`, `AppFooter`, `BrandLogo`, `UserMenu`, `NotificationsBell`, `UnsubscribeModal`, `AuthPanel` |
| [`icons.md`](./icons.md) | The icon set | All 18 components in `icons/` |
| [`admin.md`](./admin.md) | Admin dashboard panels — data-display only, no fetching | `AdminKpis`, `AdminQueuePanel`, `AdminGrowthPanel`, `AdminCategoryChart`, `AdminSubscriberChart`, `AdminMembersPanel`, `AdminContributorsPanel`, `AdminSignupsPanel`, `AdminActionRequired`, `AdminNewsletterPanel` |
| [`domain.md`](./domain.md) | Page-specific content components | `ArchiveIssue`, `ArchiveControls`, `CategoryGrid`, `CategoryDetail`, `IssueDay`, `LinkRow`, `SubmitForm`, `HomeHero` |
| [`art.md`](./art.md) | Decorative, prop-less illustration SVGs | `HomeHeroArt`, `ArchiveHeroArt`, `CategoriesHeroArt`, `AuthPanelArt`, `SubmitAsideArt` |

## Conventions that apply to every component

**Auto-import.** This is a Nuxt 4 app — everything in `app/components/` is
auto-imported and PascalCased by its folder path. `components/ui/AppButton.vue`
is used as `<UiAppButton>`, `components/layout/AppNav.vue` as `<LayoutAppNav>`,
`components/icons/Bell.vue` as `<IconsBell>`, and so on. You will not see an
`import` statement for these anywhere in the app — that's expected, not an
oversight. The one place components *are* imported explicitly is inside other
`.vue` files that need TypeScript to resolve a type from the sibling file
(e.g. `IconsGrid` inside `AdminCategoryChart.vue`'s `<script setup>`) — either
form works, the explicit import is just belt-and-braces in a few spots.

**Props are TypeScript-only.** Every component uses `defineProps<{...}>()`
(optionally with `withDefaults`) rather than the runtime `props: {}` object
syntax. There's no separate prop-types export to import — the type lives
inline in the `<script setup>` block of the `.vue` file itself, and that file
is the source of truth if these docs and the code ever drift.

**RTL and Persian-first.** The whole app is RTL (`dir="rtl"` on `<html>`),
and static copy in components is Persian. Numerals shown to users go through
`app/utils/persian.ts`'s `toPersian()` so they render as Persian digits
(۰–۹), not Arabic-numeral `0-9` — components that display counts do this
themselves (see `admin.md`), it isn't automatic.

**Design tokens, not literals.** Colors, spacing rhythm, and motion timing
come from CSS custom properties defined once in
`app/assets/css/shared/base.css` — things like `--forest`, `--clay`, `--ink`,
`--line`, `--ease`, `--dur-fast`. New components should reach for these
instead of hardcoding hex values or transition durations, both for visual
consistency and because `prefers-reduced-motion` is handled globally by
zeroing out `--dur-*` — a component with a hardcoded `0.2s` transition won't
respect that.

**No component library.** There's no headless-UI dependency here — modals,
dropdowns, and popovers (`UnsubscribeModal`, `UserMenu`, `NotificationsBell`)
are hand-rolled with `ref`, `Teleport`, click-outside listeners, and `Escape`
key handling implemented directly in each component. If you're adding a new
overlay, the existing ones are the pattern to copy rather than reaching for a
new dependency.

**Global CSS, not scoped styles, is the norm.** Only three components in the
whole app carry a `<style>` block at all — `AppButton`, `AppChip`, and
`UiFieldError` (all `scoped`, since as generic primitives they need to be
self-contained wherever they're dropped). Everything else — `AppNav`,
`AdminKpis`, `SubmitForm`, all of it — is styled by class name from global
CSS files imported once in `app/assets/css/main.css`
(`shared/base.css` for tokens, then one file per component/page/layout under
`components/`, `pages/`, `layouts/`). If you're adding a new page-specific
component, add its styles to a matching new file there and `@import` it in
`main.css` — don't reach for a scoped `<style>` block just because that's
the more common Vue default; it'd break from how the rest of the app is
organized. `:deep()` (used in `AppButton` to size slotted icon SVGs) is only
relevant to those three scoped components.
