<template>
  <div class="action-required" :class="hasUrgent ? 'action-required--alert' : ''">

    <!-- Header -->
    <div class="action-required__head">
      <span class="action-required__heading-icon" aria-hidden="true">
        <svg v-if="hasUrgent" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 3L2 17h16L10 3z"/><path d="M10 9v4"/><circle cx="10" cy="15" r=".5" fill="currentColor" stroke="none"/>
        </svg>
        <svg v-else viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/>
        </svg>
      </span>
      <h2 class="action-required__title">
        {{ hasUrgent ? 'موارد نیازمند توجه' : 'وضعیت پلتفرم' }}
      </h2>
      <span class="action-required__count" v-if="items.length">
        {{ toPersian(items.length) }} مورد
      </span>
    </div>

    <!-- All clear state -->
    <div v-if="!items.length" class="action-required__clear">
      <span class="action-required__clear-icon" aria-hidden="true">✓</span>
      همه‌چیز در وضعیت مناسب است — نیازی به اقدام فوری وجود ندارد.
    </div>

    <!-- Action items -->
    <ul v-else class="action-required__list">
      <li
        v-for="(item, i) in items"
        :key="i"
        class="action-item"
        :class="`action-item--${item.level}`"
      >
        <!-- Level indicator dot -->
        <span class="action-item__dot" aria-hidden="true" />

        <!-- Icon -->
        <span class="action-item__icon" aria-hidden="true">
          <svg v-if="item.icon === 'clock'" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2"/>
          </svg>
          <svg v-else-if="item.icon === 'mail'" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="5" width="16" height="12" rx="2"/><path d="M2 7l8 5 8-5"/>
          </svg>
          <svg v-else-if="item.icon === 'send'" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 2L9 11"/><path d="M18 2l-5 16-4-7-7-4 16-5z"/>
          </svg>
          <svg v-else-if="item.icon === 'users'" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="6" r="3"/><path d="M2 18v-1a5 5 0 0 1 10 0v1"/><path d="M14 8a3 3 0 0 1 0 6"/><path d="M18 18v-1a4 4 0 0 0-3-3.9"/>
          </svg>
          <svg v-else viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/>
          </svg>
        </span>

        <!-- Text (numbers bolded via :inner-html or template) -->
        <p class="action-item__text" v-html="boldNumbers(item.text)" />

        <!-- CTA -->
        <NuxtLink :to="item.href" class="action-item__cta">
          {{ item.cta }}
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M10 4L6 8l4 4"/>
          </svg>
        </NuxtLink>
      </li>
    </ul>

  </div>
</template>

<script setup lang="ts">
interface ActionItem {
  level: 'urgent' | 'warn' | 'info' | 'success'
  icon: string
  text: string
  href: string
  cta: string
}

const props = defineProps<{ items: ActionItem[] }>()

const hasUrgent = computed(() =>
  props.items.some(i => i.level === 'urgent' || i.level === 'warn')
)

// Bold any number found in the text so it stands out visually
function boldNumbers(text: string) {
  return text.replace(/([\d۰-۹]+)/g, '<strong>$1</strong>')
}
</script>
