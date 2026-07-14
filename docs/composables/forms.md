# `useZodForm`, `useToast`

## `useZodForm(schema, initialValues?)`

```ts
function useZodForm<S extends ZodType>(
  schema: S,
  initialValues?: FormOptions<z.input<S>, z.output<S>>["initialValues"]
): ReturnType<typeof useForm> // vee-validate's useForm() return value
```

A thin wrapper around vee-validate's `useForm`, pinned to a Zod schema via
`@vee-validate/zod`'s `toTypedSchema`. Every multi-field form in the app
(register, submit-link) goes through this rather than calling
`useForm` directly, so field-error/touched/dirty state behaves identically
everywhere. `validateOnMount` is hardcoded to `false` — fields don't show
red until the user actually interacts with them.

It deliberately does **not** pass an explicit `useForm<...>` type
parameter — `toTypedSchema(schema)` already infers the correct
input/output split (the pre-parse shape the user types vs. what
`handleSubmit` receives after Zod applies `.default()`/`.transform()`).
Collapsing that to a single `z.infer<S>` would make any field with a
default (like `submitLinkSchema`'s `categories: z.array(z.string()).default([])`)
look permanently required, silently defeating the type checker's ability to
catch a missing default before `resetForm()`. **If you're adding a new
multi-field form, use this as-is rather than reaching for `useForm`
directly or adding your own generic.**

### Returns

Whatever `vee-validate`'s `useForm()` returns — most commonly used:

| Key | Type |
|---|---|
| `defineField(name, opts?)` | Binds one field; returns `[value, attrs]` |
| `errors` | Reactive map of field → error message |
| `handleSubmit(fn)` | Wraps your submit handler; only calls `fn` with parsed, valid data |
| `resetForm(opts?)` | Resets values/touched/errors |

### Example

```ts
const { defineField, errors, handleSubmit, resetForm } = useZodForm(submitLinkSchema, {
  url: "", title: "", body: "", credit: "", categories: [],
})

const [title, titleAttrs] = defineField("title", { validateOnModelUpdate: false })

const onSubmit = handleSubmit(async (values) => {
  await $fetch("/api/links", { method: "POST", body: values })
})
```

For a single-field form (the homepage's email-only subscribe box), the full
ceremony isn't worth it — `HomeHero` uses vee-validate's plain `useField()`
pinned to just `subscribeSchema.shape.email` instead. Reach for the full
`useZodForm` when a form has more than one interdependent field.

---

## `useToast()`

```ts
function useToast(): {
  toastMessage: Readonly<Ref<string>>
  toastVisible: Readonly<Ref<boolean>>
  showToast: (message: string, duration?: number) => void
}
```

Backs the single global `AppToast` mounted once in `app.vue`. Unlike the
other composables, its state lives in **module-scope `ref`s** (not
`useState`) — meaning it's shared even without going through Nuxt's
per-request state system. That's fine here because a toast is inherently
transient, client-only UI feedback, not something that needs to hydrate
correctly from SSR — don't copy this pattern for state that does.

### Usage

```ts
const { showToast } = useToast()
showToast("عضویت شما لغو شد.")          // default 3000ms
showToast("در حال ذخیره...", 5000)      // custom duration
```

`toastMessage`/`toastVisible` are exposed `readonly` — you can read them to
build your own toast UI, but only `showToast()` can set them. There's no
`hideToast()`; a new call to `showToast` cancels any pending auto-hide timer
and starts a fresh one, so it's safe to call it again before the previous
toast has finished.
