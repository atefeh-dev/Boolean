<template>
  <component
    :is="to ? resolvedNuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="to ? undefined : disabled"
    class="app-btn"
    :class="[
      `app-btn--${variant}`,
      `app-btn--${size}`,
      shape === 'rounded' ? 'app-btn--rounded' : 'app-btn--pill',
      { 'app-btn--block': block },
    ]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { resolveComponent } from "vue";

const resolvedNuxtLink = resolveComponent("NuxtLink");

withDefaults(
  defineProps<{
    /** Visual style. Each maps 1:1 to a design-system CTA color used elsewhere in the app. */
    variant?:
      | "forest"    // solid forest — primary action (submit, save, auth)
      | "clay"      // solid clay — primary action on light surfaces (hero, admin approve)
      | "white"     // solid white — primary action on dark/colored surfaces
      | "ghost"     // translucent outline — secondary action on dark surfaces
      | "outline"   // neutral bordered — secondary action on light surfaces (modal cancel)
      | "neutral"   // muted line-colored — inactive/not-ready state
      | "subtle"    // faint forest tint — low-emphasis action (edit)
      | "danger"    // clay-tinted — destructive/reject action
      | "text"      // no background, text-only — tertiary action (back links)
      | "line"      // bordered, forest text — pagination controls
      | "icon"      // icon-only button, hovers clay (delete/dismiss actions)
      | "icon-ghost"; // icon-only button, hovers neutral ink (nav-adjacent toggles)
    size?: "sm" | "md" | "lg";
    shape?: "pill" | "rounded";
    block?: boolean;
    to?: string;
    type?: "button" | "submit";
    disabled?: boolean;
  }>(),
  {
    variant: "forest",
    size: "md",
    shape: "pill",
    block: false,
    to: undefined,
    type: "button",
    disabled: false,
  }
);
</script>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-family: var(--font);
  font-weight: 700;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
  transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease),
    opacity var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease),
    transform var(--dur-fast) var(--ease);
}

.app-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.app-btn:focus-visible {
  outline: 2px solid var(--forest);
  outline-offset: 2px;
}

.app-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.app-btn--block {
  width: 100%;
}

/* ── Shape ── */
.app-btn--pill {
  border-radius: 999px;
}
.app-btn--rounded {
  border-radius: 12px;
}

/* ── Size ── */
.app-btn--sm {
  padding: 10px 20px;
  font-size: 0.875rem;
}
.app-btn--md {
  padding: 12px 24px;
  font-size: 0.875rem;
}
.app-btn--lg {
  padding: 14px 28px;
  font-size: 0.9375rem;
}
.app-btn :deep(svg) {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

/* ── Variants ── */
.app-btn--forest {
  background: var(--forest);
  color: #fff;
}
.app-btn--forest:hover:not(:disabled) {
  background: var(--forest-deep);
}

.app-btn--clay {
  background: var(--clay);
  color: #fff;
}
.app-btn--clay:hover:not(:disabled) {
  background: #7e4429;
}

.app-btn--white {
  background: #fff;
  color: var(--forest-deep);
}
.app-btn--white:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.app-btn--ghost {
  background: rgba(243, 244, 239, 0.12);
  color: var(--paper);
  border: 1px solid rgba(243, 244, 239, 0.3);
}
.app-btn--ghost:hover:not(:disabled) {
  background: rgba(243, 244, 239, 0.2);
}

.app-btn--outline {
  background: rgba(36, 72, 61, 0.07);
  color: var(--ink-soft);
  border: 1px solid var(--line);
}
.app-btn--outline:hover:not(:disabled) {
  background: var(--line);
}

.app-btn--neutral {
  background: var(--line);
  color: var(--ink-faint);
}

.app-btn--subtle {
  background: rgba(36, 72, 61, 0.07);
  color: var(--forest);
  border: 1px solid var(--line);
}
.app-btn--subtle:hover:not(:disabled) {
  background: var(--clay-soft);
}

.app-btn--danger {
  background: var(--clay-soft);
  color: #7a3f22;
  border: 1px solid var(--clay);
}
.app-btn--danger:hover:not(:disabled) {
  background: #e7d2c0;
}

.app-btn--text {
  background: none;
  padding: 0;
  color: var(--clay);
  font-weight: 600;
}
.app-btn--text:hover:not(:disabled) {
  opacity: 0.75;
}

.app-btn--line {
  background: var(--surface);
  color: var(--forest);
  border: 1px solid var(--line);
}
.app-btn--line:hover:not(:disabled) {
  background: var(--surface-sunken);
}

.app-btn--icon,
.app-btn--icon-ghost {
  padding: 0;
  background: none;
}
.app-btn--icon.app-btn--sm,
.app-btn--icon-ghost.app-btn--sm {
  width: 24px;
  height: 24px;
}
.app-btn--icon.app-btn--md,
.app-btn--icon-ghost.app-btn--md {
  width: 32px;
  height: 32px;
}
.app-btn--icon.app-btn--lg,
.app-btn--icon-ghost.app-btn--lg {
  width: 36px;
  height: 36px;
}
.app-btn--icon.app-btn--rounded,
.app-btn--icon-ghost.app-btn--rounded {
  border-radius: 8px;
}
.app-btn--icon.app-btn--sm :deep(svg),
.app-btn--icon-ghost.app-btn--sm :deep(svg) {
  width: 13px;
  height: 13px;
}
.app-btn--icon.app-btn--lg :deep(svg),
.app-btn--icon-ghost.app-btn--lg :deep(svg) {
  width: 19px;
  height: 19px;
}

.app-btn--icon {
  color: var(--ink-faint);
}
.app-btn--icon:hover:not(:disabled) {
  color: var(--clay);
  background: var(--clay-soft);
}

.app-btn--icon-ghost {
  color: var(--ink-soft);
}
.app-btn--icon-ghost:hover:not(:disabled) {
  color: var(--ink);
  background: var(--surface-sunken);
}
</style>
