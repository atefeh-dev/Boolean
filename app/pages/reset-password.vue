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
          <NuxtLink to="/login" class="auth-btn" style="margin-top:32px">
            ورود به حساب کاربری
          </NuxtLink>
        </template>

        <!-- Invalid token -->
        <template v-else-if="!token">
          <h1 class="auth-card__title">لینک نامعتبر</h1>
          <p class="auth-card__sub">
            این لینک بازیابی معتبر نیست یا منقضی شده است.
          </p>
          <NuxtLink to="/forgot-password" class="auth-btn" style="margin-top:32px">
            درخواست لینک جدید
          </NuxtLink>
        </template>

        <!-- Form -->
        <template v-else>
          <div class="auth-card__mark" aria-hidden="true" />
          <h1 class="auth-card__title">رمز عبور جدید</h1>
          <p class="auth-card__sub">حداقل ۸ کاراکتر.</p>

          <p v-if="errorMsg" class="auth-error">{{ errorMsg }}</p>

          <form novalidate @submit.prevent="handleSubmit">
            <SharedAuthField
              id="f-password"
              v-model="password"
              label="رمز عبور جدید"
              type="password"
              name="password"
              autocomplete="new-password"
              placeholder="حداقل ۸ کاراکتر"
            />
            <SharedAuthField
              id="f-confirm"
              v-model="confirm"
              label="تکرار رمز عبور"
              type="password"
              name="confirm"
              autocomplete="new-password"
              placeholder="همان رمز عبور بالا"
            />
            <button type="submit" class="auth-btn" :disabled="loading">
              {{ loading ? "در حال ذخیره..." : "ذخیره رمز عبور" }}
            </button>
          </form>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsCheckCircle from "../components/icons/CheckCircle.vue"

definePageMeta({ title: "بولتن — تغییر رمز عبور" })

const route = useRoute()
const token = computed(() => route.query.token as string | undefined)
const password = ref("")
const confirm = ref("")
const loading = ref(false)
const errorMsg = ref("")
const done = ref(false)

async function handleSubmit() {
  errorMsg.value = ""
  if (password.value.length < 8) {
    errorMsg.value = "رمز عبور باید حداقل ۸ کاراکتر باشد."
    return
  }
  if (password.value !== confirm.value) {
    errorMsg.value = "رمز عبور و تکرار آن یکسان نیستند."
    return
  }
  loading.value = true
  try {
    await $fetch("/api/auth/reset-password", {
      method: "POST",
      body: { token: token.value, password: password.value },
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
}
</script>
