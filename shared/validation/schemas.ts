/**
 * Single source of truth for form validation.
 *
 * These schemas run in TWO places:
 *  - Client: wrapped with `toTypedSchema()` and handed to vee-validate's
 *    `useForm()` in each page/component, for instant inline field errors.
 *  - Server: called directly as `schema.safeParse(body)` inside the
 *    matching Nitro route, as the actual security boundary. The client
 *    check is just UX — never trust it alone.
 *
 * Keep field-level rules (format, length, required-ness) here. Rules that
 * need a DB round-trip (email already registered, category exists, token
 * valid) stay in the server route itself.
 */
import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "ایمیل الزامی است.")
  .max(254, "ایمیل بیش از حد طولانی است.")
  .email("فرمت ایمیل نامعتبر است.")
  .transform((v) => v.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد.")
  .max(128, "رمز عبور بیش از حد طولانی است.");

export const nameSchema = z
  .string()
  .trim()
  .min(1, "نام الزامی است.")
  .max(80, "نام بیش از حد طولانی است.");

// ---- Newsletter ----------------------------------------------------------

export const subscribeSchema = z.object({
  email: emailSchema,
});

// ---- Auth -----------------------------------------------------------------

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "رمز عبور الزامی است."),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Server only receives { token, password } — confirmation matching is a
// client-side-only UX check (see resetPasswordFormSchema below).
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "توکن نامعتبر است."),
  password: passwordSchema,
});

// Client-side variant with the extra "confirm password" field.
export const resetPasswordFormSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string().min(1, "تکرار رمز عبور الزامی است."),
  })
  .refine((data) => data.password === data.confirm, {
    message: "رمز عبور و تکرار آن یکسان نیستند.",
    path: ["confirm"],
  });

// ---- Submit link ------------------------------------------------------

export const submitLinkSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "آدرس لینک الزامی است.")
    .max(2048, "آدرس لینک بیش از حد طولانی است.")
    .refine((v) => {
      try {
        const parsed = new URL(v);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    }, "آدرس لینک معتبر نیست (باید http یا https باشد)."),
  title: z
    .string()
    .trim()
    .min(1, "عنوان الزامی است.")
    .max(80, "عنوان نباید بیش از ۸۰ کاراکتر باشد."),
  body: z
    .string()
    .trim()
    .max(150, "توضیح نباید بیش از ۱۵۰ کاراکتر باشد.")
    .optional()
    .or(z.literal("")),
  credit: z
    .string()
    .trim()
    .max(20, "اعتبار نباید بیش از ۲۰ کاراکتر باشد.")
    .optional()
    .or(z.literal("")),
  categories: z
    .array(z.string())
    .max(3, "حداکثر سه دسته‌بندی می‌توانید انتخاب کنید.")
    .default([]),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;
export type SubmitLinkInput = z.infer<typeof submitLinkSchema>;
