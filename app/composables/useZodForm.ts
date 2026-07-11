import { useForm, type FormOptions } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import type { ZodType, z } from "zod";

/**
 * Thin wrapper around vee-validate's `useForm`, pinned to a Zod schema.
 * Every form in the app should go through this so field-error state
 * (touched/dirty/error message) behaves identically everywhere.
 *
 * Deliberately does NOT pass an explicit `useForm<...>` generic — Vue's
 * `toTypedSchema(schema)` already returns a `TypedSchema<TInput, TOutput>`
 * with the correct input/output split (TInput = the pre-parse shape the
 * user types, e.g. `PartialDeep<z.input<S>>`; TOutput = what `handleSubmit`
 * actually receives after Zod parses/transforms/defaults it). Overriding
 * that with a single `z.infer<S>` (output-only) collapses the two into one
 * type, which is unsound for any field with `.default()` or `.transform()`
 * — e.g. a `.default([])` field gets typed as always-present `string[]`,
 * when in reality it can be `undefined` right after `resetForm()` or
 * before `initialValues` is merged. TypeScript then stops warning you
 * about that, so the only thing standing between you and a runtime crash
 * is remembering to defensively `?? []` everywhere by hand.
 *
 * Usage:
 *   const { values, errors, defineField, handleSubmit } =
 *     useZodForm(loginSchema, { email: "", password: "" })
 */
export function useZodForm<S extends ZodType>(
  schema: S,
  initialValues?: FormOptions<z.input<S>, z.output<S>>["initialValues"]
) {
  return useForm<z.input<S>, z.output<S>>({
    validationSchema: toTypedSchema(schema),
    initialValues,
    validateOnMount: false,
  });
}
