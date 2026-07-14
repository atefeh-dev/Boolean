# `admin/` — dashboard panels

All ten of these are pure presentation: they take already-computed numbers
and arrays as props and render them. None of them fetch data themselves —
that happens once in the admin dashboard page (`app/pages/admin/index.vue`)
and gets fanned out as props. If a panel looks like it needs new data,
that data has to be added to the page's fetch first.

Three of them (`AdminCategoryChart`, `AdminMembersPanel`,
`AdminSubscriberChart`) wrap [`vue3-apexcharts`](https://apexcharts.com/) —
options are pre-configured to match the app's fonts/colors and generally
shouldn't need further customization from the outside.

## `AdminKpis` → `<AdminAdminKpis>`

The row of top-level KPI tiles (published/pending/rejected/subscribers/
categories), two of which show a week-over-week trend delta.

### Props

| Prop | Type |
|---|---|
| `publishedCount` | `number` |
| `pendingCount` | `number` |
| `rejectedCount` | `number` |
| `subscriberCount` | `number` |
| `categoryCount` | `number` |
| `publishedThisWeek` | `number` |
| `publishedLastWeek` | `number` |
| `newSubsThisWeek` | `number` |
| `newSubsLastWeek` | `number` |

Trend deltas (`publishedThisWeek - publishedLastWeek`,
`newSubsThisWeek - newSubsLastWeek`) are computed inside the component — pass
the raw weekly counts, not a pre-computed delta.

```vue
<AdminAdminKpis
  :published-count="stats.publishedCount"
  :pending-count="stats.pendingCount"
  :rejected-count="stats.rejectedCount"
  :subscriber-count="stats.subscriberCount"
  :category-count="stats.categoryCount"
  :published-this-week="stats.publishedThisWeek"
  :published-last-week="stats.publishedLastWeek"
  :new-subs-this-week="stats.newSubsThisWeek"
  :new-subs-last-week="stats.newSubsLastWeek"
/>
```

---

## `AdminQueuePanel` → `<AdminAdminQueuePanel>`

Pending-links queue summary with a health indicator (green/amber/red) based
on how long the oldest item has been waiting.

### Props

| Prop | Type |
|---|---|
| `count` | `number` |
| `oldestPending` | `{ id: string; title: string; url: string; daysAgo: number; submittedBy: string \| null; categories: { id: string; label: string }[] }[]` |

Health status is derived entirely from `oldestPending[0].daysAgo`
(>7 days = red / needs urgent review, >3 = amber, else green) — sort
`oldestPending` oldest-first before passing it in, or the health indicator
will be wrong.

---

## `AdminGrowthPanel` → `<AdminAdminGrowthPanel>`

Submission funnel — total submitted vs. approved vs. rejected, with
percentages computed from `totalSubmitted`.

### Props

| Prop | Type |
|---|---|
| `totalSubmitted` | `number` |
| `approved` | `number` |
| `rejected` | `number` |
| `approvalRate` | `number` |

`approved`/`rejected` percentages shown in the bars are computed internally
as a share of `totalSubmitted`; `approvalRate` is a separate, already-computed
figure the panel just displays (it's not re-derived from the other three).

---

## `AdminCategoryChart` → `<AdminAdminCategoryChart>`

Donut chart of published-link counts per category. Only categories with
`publishedCount > 0` are shown; beyond the top 7 (by count), the remainder
are grouped into a single "سایر" (other) slice.

### Props

| Prop | Type |
|---|---|
| `categories` | `{ id: string; label: string; publishedCount: number }[]` |

Pass every category, including ones with a zero count — the component
filters those out itself, and needs the full set to compute an accurate
total/"other" bucket.

---

## `AdminSubscriberChart` → `<AdminAdminSubscriberChart>`

Bar chart of new-subscriber counts per week. The most recent week's bar is
rendered in a darker shade for emphasis.

### Props

| Prop | Type |
|---|---|
| `subscriberWeeklyTrend` | `{ label: string; count: number }[]` |

Expects the array in chronological order (oldest first) — "this week" and
"last week" (used for the trend figure shown above the chart) are read as
`.at(-1)` and `.at(-2)`.

---

## `AdminMembersPanel` → `<AdminAdminMembersPanel>`

Donut chart of subscribed vs. not-subscribed member counts.

### Props

| Prop | Type |
|---|---|
| `members` | `{ total: number; subscribedToday: number; subscribed: number; notSubscribed: number }` |

Note this is a single object prop, not four separate props like the KPI
panel — `subscribedToday` is accepted but not currently rendered by the
chart itself (it's part of the type for forward-compat with the member
stats endpoint; leave it in the object even though the chart doesn't show it
yet).

---

## `AdminContributorsPanel` → `<AdminAdminContributorsPanel>`

Table of top link contributors with their submitted/approved counts and
approval rate.

### Props

| Prop | Type |
|---|---|
| `contributors` | `{ name: string; email: string; submitted: number; approved: number; approvalRate: number }[]` |

`approvalRate` is taken as given, not computed from `submitted`/`approved` —
compute it server-side and pass the result in.

---

## `AdminSignupsPanel` → `<AdminAdminSignupsPanel>`

Recent-subscriptions feed with relative "زمان پیش" (time-ago) labels and a
badge distinguishing account-linked vs. guest signups.

### Props

| Prop | Type |
|---|---|
| `subscriptions` | `{ email: string; hasAccount: boolean; at: string }[]` |

`at` must be an ISO date string — the component parses it with
`new Date(iso)` internally to compute the relative label.

---

## `AdminActionRequired` → `<AdminAdminActionRequired>`

A short list of "needs your attention" callouts (e.g. queue backing up,
newsletter overdue), each with a severity level and a link to act on it.

### Props

| Prop | Type |
|---|---|
| `items` | `{ level: 'urgent' \| 'warn' \| 'info' \| 'success'; icon: string; text: string; href: string; cta: string }[]` |

Any digit sequence inside `text` (Latin or Persian) is automatically
bolded via a regex — you don't need to wrap numbers in `<strong>` yourself
when composing the `text` string. This is the one admin panel whose `text`
field is interpreted as (limited) markup rather than plain copy, so keep it
to plain sentences with numbers, not arbitrary HTML.

```ts
const items = [
  {
    level: 'urgent',
    icon: 'clock',
    text: '۱۲ لینک بیش از ۷ روز در صف مانده‌اند',
    href: '/admin/links?status=pending',
    cta: 'بررسی صف',
  },
]
```

---

## `AdminNewsletterPanel` → `<AdminAdminNewsletterPanel>`

Newsletter-readiness summary — how many links are ready to send, when the
last issue went out, and a status badge (green/amber/red) based on days
since the last send.

### Props

| Prop | Type |
|---|---|
| `readyCount` | `number` |
| `lastSentAt` | `string \| null` |
| `lastSentCount` | `number \| null` |
| `daysSinceSent` | `number \| null` |

`lastSentAt: null` renders "هرگز" (never) and forces the status badge to
red regardless of `daysSinceSent`. When `lastSentAt` is set, status is
green under 2 days, amber at 2, red at 3+.
