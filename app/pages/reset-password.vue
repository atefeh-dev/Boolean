<template>
  <div class="auth-page">
    <LayoutAuthPanel
      heading="رمز عبور جدیدی انتخاب کنید که به یاد بسپارید"
      footer="لینک بازیابی پس از استفاده غیرفعال می‌شود"
    />

    <div class="auth-form-side">
      <div class="auth-card">

        <!-- Success -->
        <template v-if="done">
          <div class="auth-success-icon">
            <IconsCheckCircle />
          </div>
          <h1 class="auth-card__title">رمز تغییر کرد</h1>
          <p class="auth-card__sub">
            رمز عبور شما با موفقیت تغییر یافت. می‌توانید وارد شوید.
          </p>
          <UiAppButton to="/login" shape="rounded" size="lg" block class="auth-cta">
            ورود به حساب کاربری
          </UiAppButton>
        </template>

        <!-- Invalid token -->
        <template v-else-if="!token">
          <h1 class="auth-card__title">لینک نامعتبر</h1>
          <p class="auth-card__sub">
            این لینک بازیابی معتبر نیست یا منقضی شده است.
          </p>
          <UiAppButton to="/forgot-password" shape="rounded" size="lg" block class="auth-cta">
            درخواست لینک جدید
          </UiAppButton>
        </template>

        <!-- Form -->
        <template v-else>
          <div class="auth-card__mark" aria-hidden="true" />
          <h1 class="auth-card__title">رمز عبور جدید</h1>
          <p class="auth-card__sub">حداقل ۸ کاراکتر.</p>

          <p v-if="errorMsg" class="auth-error">{{ errorMsg }}</p>

          <form novalidate @submit.prevent="onSubmit">
            <SharedAuthField
              id="f-password"
              v-model="password"
              label="رمز عبور جدید"
              type="password"
              name="password"
              autocomplete="new-password"
              placeholder="حداقل ۸ کاراکتر"
              :error="errors.password"
              @blur="passwordAttrs.onBlur"
            />
            <SharedAuthField
              id="f-confirm"
              v-model="confirm"
              label="تکرار رمز عبور"
              type="password"
              name="confirm"
              autocomplete="new-password"
              placeholder="همان رمز عبور بالا"
              :error="errors.confirm"
              @blur="confirmAttrs.onBlur"
            />
            <UiAppButton type="submit" shape="rounded" size="lg" block class="auth-cta" :disabled="loading">
              {{ loading ? "در حال ذخیره..." : "ذخیره رمز عبور" }}
            </UiAppButton>
          </form>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsCheckCircle from "../components/icons/CheckCircle.vue"
import { resetPasswordFormSchema } from "#shared/validation/schemas"

definePageMeta({ layout: "auth", title: "بولتن — تغییر رمز عبور" })

const route = useRoute()
const token = computed(() => route.query.token as string | undefined)

const { defineField, errors, handleSubmit } = useZodForm(resetPasswordFormSchema, {
  password: "",
  confirm: "",
})
const [password, passwordAttrs] = defineField("password", { validateOnModelUpdate: false })
const [confirm, confirmAttrs] = defineField("confirm", { validateOnModelUpdate: false })

const loading = ref(false)
const errorMsg = ref("")
const done = ref(false)

const onSubmit = handleSubmit(async (values) => {
  errorMsg.value = ""
  loading.value = true
  try {
    await $fetch("/api/auth/reset-password", {
      method: "POST",
      body: { token: token.value, password: values.password },
    })
    done.value = true
  } catch (err) {
    const msg = err && typeof err === "object" && "data" in err
      ? (err as { data?: { statusMessage?: string } }).data?.statusMessage
      : undefined
    errorMsg.value = msg || "خطایی رخ داد."
  } finally {
    loading.value = false
  }
})
</script>
