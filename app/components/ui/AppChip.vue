<template>
  <button
    type="button"
    class="app-chip"
    :class="{ 'app-chip--active': active, 'app-chip--sm': size === 'sm' }"
    role="tab"
    :aria-selected="active ? 'true' : 'false'"
    @click="$emit('click', $event)"
  >
    <slot />
    <span v-if="count !== undefined" class="app-chip__count">{{ count }}</span>
  </button>
</template>

<script setup lang="ts">
/// <reference types="vue" />
const props = defineProps<{
  active?: boolean;
  /** Pre-formatted count label (e.g. Persian numerals) shown as a small badge. */
  count?: string | number;
  size?: "sm" | "md";
}>();

const active = props.active ?? false;
const count = props.count;
const size = props.size ?? "md";

// emits are used in the template via $emit; no runtime/TS declaration needed here
</script>

<style scoped>
.app-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex: 0 0 auto;
  font-family: var(--font);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ink-soft);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 9px 18px;
  white-space: nowrap;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease),
    border-color var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease);
}
.app-chip :deep(svg) {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.app-chip:hover {
  border-color: var(--clay);
  color: var(--clay);
}
.app-chip:active {
  transform: scale(0.96);
}
.app-chip--active {
  background: var(--forest);
  border-color: var(--forest);
  color: #fff;
}
.app-chip--active:hover {
  color: #fff;
}

.app-chip--sm {
  font-size: 0.8125rem;
  padding: 7px 16px;
}

.app-chip__count {
  background: rgba(36, 72, 61, 0.07);
  border-radius: 999px;
  padding: 1px 8px;
  font-size: 0.75rem;
  font-weight: 700;
}
.app-chip--active .app-chip__count {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}
</style>
