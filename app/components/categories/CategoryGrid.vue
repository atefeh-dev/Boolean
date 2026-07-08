<template>
  <div class="cat-grid">
    <button
      v-for="card in cards"
      :key="card.id"
      type="button"
      class="cat-card"
      @click="emit('select', card.id)"
    >
      <span class="cat-card__label">{{ card.label }}</span>
      <span class="cat-card__count">{{ toPersian(card.count) }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { categoryCards as staticCategoryCards } from '../../../data/content'

interface CategoryCard {
  id: string
  label: string
  count: number
}

const props = defineProps<{ cards?: CategoryCard[] }>()
const cards = computed(() => props.cards ?? staticCategoryCards)

const emit = defineEmits<{
  select: [categoryId: string]
}>()
</script>
