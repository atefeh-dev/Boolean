# `/api/categories`

## `GET /api/categories` — public

The full category list, no filtering or pagination — there are few enough
categories that this is never a concern.

### Response — `200`

```ts
{ categories: { id: string; label: string }[] }
```

Sorted alphabetically by `label`. Used by the submit form's checkbox list,
the categories page, and as the fallback-vs-live-data check in
`useArchiveData`/`useCategoryData` (see `composables/page-data.md`) — it's
the one endpoint every content-listing composable calls alongside
`/api/links`.

There's no admin write endpoint for categories in this API — creating or
editing a category is a direct DB/Prisma-Studio operation, not something
exposed through `/api`.
