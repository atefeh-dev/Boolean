<template>
  <section
    v-for="section in sections"
    :key="section.id"
    class="cat-section"
    :class="{ visible: section.id === activeCategory }"
    :data-cat="section.id"
  >
    <div class="cat-section-card">
      <div class="cat-section-header">
        <h2 class="cat-section-title">{{ section.label }}</h2>
        <span class="cat-section-count"
          >{{ toPersian(section.count) }} لینک</span
        >
      </div>
      <div v-for="link in section.links" :key="link.url" class="link-item">
        <span class="link-item__domain">{{ link.domain }}</span>
        <p class="link-item__title">
          <a :href="link.url" target="_blank" rel="noopener">{{
            link.title
          }}</a>
        </p>
        <span class="link-item__date">{{ link.date }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CategorySection } from "../../types/links";

defineProps<{
  sections: CategorySection[];
  activeCategory: string;
}>();
</script>
