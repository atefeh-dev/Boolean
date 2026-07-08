<template>
  <div class="controls">
    <div class="search-field">
      <svg class="search-field__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
        <path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <input
        v-model="query"
        type="search"
        class="search-input"
        placeholder="جستجو در عنوان لینک‌ها..."
        @input="emit('update:query', query)"
      />
    </div>
    <div class="filter-chips" role="tablist" aria-label="فیلتر دسته‌بندی">
      <button
        v-for="chip in chips"
        :key="chip.id || 'all'"
        type="button"
        class="chip"
        :class="{ 'chip--active': activeCategory === chip.id }"
        :aria-selected="activeCategory === chip.id ? 'true' : 'false'"
        @click="emit('update:activeCategory', chip.id)"
      >
        {{ chip.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  query: string
  activeCategory: string
  chips: Array<{ id: string; label: string }>
}>()

const emit = defineEmits<{
  'update:query': [value: string]
  'update:activeCategory': [value: string]
}>()

const query = ref(props.query)

watch(
  () => props.query,
  (value) => {
    query.value = value
  },
)
</script>
