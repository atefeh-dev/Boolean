<template>
  <div class="link-row">
    <div class="link-row__chip">
      <UiBrowserIcon />
    </div>
    <div class="link-row__body">
      <span class="link-row__domain">{{ link.domain }}</span>
      <h3 class="link-row__title">
        <a :href="link.url" target="_blank" rel="noopener">{{ link.title }}</a>
      </h3>
      <p class="link-row__desc">{{ link.description }}</p>
      <div class="link-row__tags">
        <span
          v-for="categoryId in link.categories"
          :key="categoryId"
          class="tag"
        >
          {{ categoryMap[categoryId] || categoryId }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LinkItem } from "../../types/links";

defineProps<{
  link: LinkItem;
  categoryMap: Record<string, string>;
}>();
</script>
