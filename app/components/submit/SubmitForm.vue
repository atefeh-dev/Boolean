<template>
  <div class="submit-layout">
    <aside class="submit-aside">
      <p class="submit-aside__eyebrow">share a good link</p>
      <h2 class="submit-aside__title">لینک خوبی پیدا کرده‌اید؟</h2>
      <p class="submit-aside__desc">
        بهترین مقاله‌ها، ابزارها و منابع طراحی را با ما در میان بگذارید. هر روز
        پنج مورد برتر را برای هزاران خواننده منتشر می‌کنیم.
      </p>
      <SubmitAsideArt />
    </aside>

    <!-- Success state — replaces form in-place so it's always visible -->
    <div v-if="submitted" class="submit-card submit-success">
      <div class="submit-success__icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="23" stroke="var(--forest)" stroke-width="2" opacity="0.2"/>
          <circle cx="24" cy="24" r="23" stroke="var(--forest)" stroke-width="2"
            stroke-dasharray="144" stroke-dashoffset="0" class="submit-success__ring"/>
          <path d="M14 25l7 7 13-14" stroke="var(--forest)" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2 class="submit-success__title">لینک دریافت شد!</h2>
      <p class="submit-success__desc">
        از مشارکت شما ممنونیم. لینک شما در صف بررسی قرار گرفت و پس از تأیید
        در بولتن منتشر می‌شود.
      </p>
      <UiAppButton type="button" size="lg" class="btn-submit" @click="reset">ارسال لینک دیگری</UiAppButton>
    </div>

    <!-- Form state -->
    <div v-else class="submit-card">
      <h1 class="submit-card__title">ارسال لینک</h1>
      <p class="submit-card__sub">
        فرم زیر را پر کنید تا لینک شما برای بررسی به دست ما برسد.
      </p>

      <p v-if="serverError" class="auth-error">{{ serverError }}</p>

      <form
        id="submit-form"
        novalidate
        @submit.prevent="onSubmit"
      >
        <div class="field">
          <label class="field-label" for="f-url">آدرس لینک</label>
          <div class="field-wrap" :class="{ 'field-wrap--invalid': !!errors.url }">
            <input
              id="f-url"
              v-model="url"
              v-bind="urlAttrs"
              type="url"
              name="url"
              placeholder="https://example.com/article"
              required
              :aria-invalid="!!errors.url"
            />
          </div>
          <UiFieldError :message="errors.url" />
        </div>

        <div class="field">
          <label class="field-label" for="f-title">عنوان</label>
          <div class="field-wrap" :class="{ 'field-wrap--invalid': !!errors.title }">
            <input
              id="f-title"
              v-model="title"
              v-bind="titleAttrs"
              type="text"
              name="title"
              maxlength="80"
              required
              placeholder="عنوان مقاله یا محتوا"
              :aria-invalid="!!errors.title"
            />
            <span class="char-count">{{ toPersian(titleRemaining) }}</span>
          </div>
          <UiFieldError :message="errors.title" />
        </div>

        <div class="field">
          <label class="field-label" for="f-body">توضیح</label>
          <div class="field-wrap" :class="{ 'field-wrap--invalid': !!errors.body }">
            <textarea
              id="f-body"
              v-model="body"
              v-bind="bodyAttrs"
              name="body"
              maxlength="150"
              rows="3"
              placeholder="توضیح کوتاهی درباره این لینک و اینکه چرا ارزش خواندن دارد..."
              :aria-invalid="!!errors.body"
            />
            <span class="char-count">{{ toPersian(bodyRemaining) }}</span>
          </div>
          <UiFieldError :message="errors.body" />
          <p v-if="!errors.body" class="field-hint">Markdown پشتیبانی می‌شود.</p>
        </div>

        <div class="field">
          <label class="field-label" for="f-credit">اعتبار</label>
          <div class="field-wrap" :class="{ 'field-wrap--invalid': !!errors.credit }">
            <input
              id="f-credit"
              v-model="credit"
              v-bind="creditAttrs"
              type="text"
              name="credit"
              maxlength="20"
              placeholder="@username"
              dir="ltr"
              style="text-align: left"
              :aria-invalid="!!errors.credit"
            />
            <span class="char-count">{{ toPersian(creditRemaining) }}</span>
          </div>
          <UiFieldError :message="errors.credit" />
          <p v-if="!errors.credit" class="field-hint">
            نام کاربری توییتر فرد یا سازمانی که باید اعتبار این لینک به او داده
            شود.
          </p>
        </div>

        <div class="field">
          <label class="field-label">دسته‌بندی‌ها</label>
          <div class="cat-pills">
            <template v-for="category in submitCategories" :key="category.id">
              <input
                :id="`c-${category.id}`"
                v-model="categories"
                type="checkbox"
                name="categories"
                :value="category.id"
                class="cat-opt"
                @change="limitCategories"
              />
              <label :for="`c-${category.id}`" class="cat-lbl">{{
                category.label
              }}</label>
            </template>
          </div>
          <UiFieldError :message="errors.categories" />
          <p v-if="!errors.categories" class="field-hint" style="margin-top: 10px">
            تا سه دسته‌بندی می‌توانید انتخاب کنید.
          </p>
        </div>

        <UiAppButton type="submit" size="lg" class="btn-submit" :disabled="submitting">
          {{ submitting ? "در حال ارسال..." : "ارسال لینک" }}
        </UiAppButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { submitLinkSchema } from "#shared/validation/schemas";
import { submitCategories } from "../../../data/content";
import { toPersian } from "../../utils/persian";
import SubmitAsideArt from "../art/SubmitAsideArt.vue";

const { defineField, errors, handleSubmit, resetForm } = useZodForm(submitLinkSchema, {
  url: "",
  title: "",
  body: "",
  credit: "",
  categories: [],
});

const [url, urlAttrs] = defineField("url", { validateOnModelUpdate: false });
const [title, titleAttrs] = defineField("title", { validateOnModelUpdate: false });
const [body, bodyAttrs] = defineField("body", { validateOnModelUpdate: false });
const [credit, creditAttrs] = defineField("credit", { validateOnModelUpdate: false });
const [categories] = defineField("categories", { validateOnModelUpdate: false });

const submitted = ref(false);
const submitting = ref(false);
const serverError = ref("");

const titleRemaining = computed(() => 80 - (title.value?.length ?? 0));
const bodyRemaining = computed(() => 150 - (body.value?.length ?? 0));
const creditRemaining = computed(() => 20 - (credit.value?.length ?? 0));

function limitCategories(event: Event) {
  const target = event.target as HTMLInputElement;
  if ((categories.value?.length ?? 0) > 3) {
    target.checked = false;
    categories.value = (categories.value ?? []).filter((id) => id !== target.value);
  }
}

const onSubmit = handleSubmit(async (values) => {
  serverError.value = "";
  submitting.value = true;
  try {
    await $fetch("/api/links", { method: "POST", body: values });
    submitted.value = true;
  } catch (err) {
    const msg =
      err && typeof err === "object" && "data" in err
        ? (err as { data?: { statusMessage?: string } }).data?.statusMessage
        : undefined;
    serverError.value = msg || "ارسال لینک ناموفق بود.";
  } finally {
    submitting.value = false;
  }
});

function reset() {
  submitted.value = false;
  serverError.value = "";
  resetForm({
    values: { url: "", title: "", body: "", credit: "", categories: [] },
  });
}
</script>
