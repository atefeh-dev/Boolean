<template>
  <Transition name="ui-field-error">
    <p
      v-if="message"
      :id="id"
      class="ui-field-error"
      :class="{ 'ui-field-error--light': variant === 'light' }"
      role="alert"
    >{{ message }}</p>
  </Transition>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string | null;
    id?: string;
    /** Use "light" on dark backgrounds (e.g. the homepage hero). */
    variant?: "default" | "light";
  }>(),
  { variant: "default" }
);
</script>

<style scoped>
.ui-field-error {
  margin: 6px 2px 0;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: var(--error);
}
.ui-field-error--light {
  /* --error-soft is a pale wash meant for light backgrounds, too faint to
     read as text on the hero's dark background — a lighter, more
     saturated coral keeps it legible there while still feeling gentle. */
  color: #e3a89c;
}

.ui-field-error-enter-active,
.ui-field-error-leave-active {
  transition: opacity var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease);
}
.ui-field-error-enter-from,
.ui-field-error-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
