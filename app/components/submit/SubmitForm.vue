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

      <p v-if="errorMsg" class="auth-error">{{ errorMsg }}</p>

      <form
        id="submit-form"
        novalidate
        @submit.prevent="handleSubmit"
      >
        <div class="field">
          <label class="field-label" for="f-url">آدرس لینک</label>
          <div class="field-wrap">
            <input
              id="f-url"
              v-model="form.url"
              type="url"
              name="url"
              placeholder="https://example.com/article"
              required
            />
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="f-title">عنوان</label>
          <div class="field-wrap">
            <input
              id="f-title"
              v-model="form.title"
              type="text"
              name="title"
              maxlength="80"
              required
              placeholder="عنوان مقاله یا محتوا"
            />
            <span class="char-count">{{ toPersian(titleRemaining) }}</span>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="f-body">توضیح</label>
          <div class="field-wrap">
            <textarea
              id="f-body"
              v-model="form.body"
              name="body"
              maxlength="150"
              rows="3"
              placeholder="توضیح کوتاهی درباره این لینک و اینکه چرا ارزش خواندن دارد..."
            />
            <span class="char-count">{{ toPersian(bodyRemaining) }}</span>
          </div>
          <p class="field-hint">Markdown پشتیبانی می‌شود.</p>
        </div>

        <div class="field">
          <label class="field-label" for="f-credit">اعتبار</label>
          <div class="field-wrap">
            <input
              id="f-credit"
              v-model="form.credit"
              type="text"
              name="credit"
              maxlength="20"
              placeholder="@username"
              dir="ltr"
              style="text-align: left"
            />
            <span class="char-count">{{ toPersian(creditRemaining) }}</span>
          </div>
          <p class="field-hint">
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
                v-model="form.categories"
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
          <p class="field-hint" style="margin-top: 10px">
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
import { reactive, ref, computed } from "vue";
import { submitCategories } from "../../../data/content";
import { toPersian } from "../../utils/persian";
import SubmitAsideArt from "../art/SubmitAsideArt.vue";

const form = reactive({
  url: "",
  title: "",
  body: "",
  credit: "",
  categories: [] as string[],
});

const submitted = ref(false);
const submitting = ref(false);
const errorMsg = ref("");

const titleRemaining = computed(() => 80 - form.title.length);
const bodyRemaining = computed(() => 150 - form.body.length);
const creditRemaining = computed(() => 20 - form.credit.length);

function limitCategories(event: Event) {
  const target = event.target as HTMLInputElement;
  if (form.categories.length > 3) {
    target.checked = false;
    form.categories = form.categories.filter((id) => id !== target.value);
  }
}

async function handleSubmit() {
  if (!form.url.trim() || !form.title.trim()) return;
  errorMsg.value = "";
  submitting.value = true;
  try {
    await $fetch("/api/links", {
      method: "POST",
      body: {
        url: form.url,
        title: form.title,
        body: form.body,
        credit: form.credit,
        categories: form.categories,
      },
    });
    submitted.value = true;
  } catch (err) {
    errorMsg.value =
      err instanceof Error ? err.message : "ارسال لینک ناموفق بود.";
  } finally {
    submitting.value = false;
  }
}

function reset() {
  submitted.value = false;
  errorMsg.value = "";
  Object.assign(form, { url: "", title: "", body: "", credit: "", categories: [] });
}
</script>
