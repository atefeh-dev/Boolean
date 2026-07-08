<template>
  <SharedPageHero
    eyebrow="browse by topic"
    title="دسته‌بندی‌ها"
    description="لینک‌ها را بر اساس موضوع مرور کنید — از تجربه کاربری و رابط کاربری تا تایپوگرافی، هوش مصنوعی و فراتر از آن."
    :art-component="CategoriesHeroArt"
  />

  <CategoriesCategoryGrid v-if="view === 'grid'" :cards="categoryCards" @select="showCategory" />

  <div v-else>
    <button type="button" class="back-btn" @click="showAll">
      ← همه دسته‌بندی‌ها
    </button>
    <CategoriesCategoryDetail
      :sections="categorySections"
      :active-category="selectedCategory"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useCategoryData } from "../composables/useCategoryData";
import CategoriesHeroArt from "../components/art/CategoriesHeroArt.vue";

const { categoryCards, categorySections } = await useCategoryData();

const view = ref<"grid" | "detail">("grid");
const selectedCategory = ref("");

function showCategory(categoryId: string) {
  selectedCategory.value = categoryId;
  view.value = "detail";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showAll() {
  view.value = "grid";
  selectedCategory.value = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>
