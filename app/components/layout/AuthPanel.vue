<template>
  <div class="auth-panel">
    <!-- Brand -->
    <NuxtLink to="/" class="auth-panel__brand">
      <LayoutBrandLogo />
      <span class="auth-panel__brand-word">Booltan</span>
    </NuxtLink>

    <!-- Signature numeral — "5 links daily" as typographic art -->
    <span class="auth-panel__numeral" aria-hidden="true">۵</span>

    <div class="auth-panel__content">
      <p class="auth-panel__eyebrow">curated daily</p>
      <h2 class="auth-panel__heading">{{ heading }}</h2>

      <!-- Editorial link previews — users see the product before logging in -->
      <div class="auth-picks">
        <div v-for="pick in picks" :key="pick.rank" class="auth-pick">
          <span class="auth-pick__rank" dir="ltr">{{ pick.rank }}</span>
          <div class="auth-pick__meta">
            <span class="auth-pick__cat">{{ pick.cat }}</span>
            <p class="auth-pick__title">{{ pick.title }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="auth-panel__footer">
      <span class="auth-panel__footer-dot" />
      {{ footer }}
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  heading?: string
  footer?: string
}>(), {
  heading: "هر روز، پنج لینک که ارزش وقتتان را دارد",
  footer: "بهترین محتوای طراحی، هر روز کاری در صندوق ورودی شما",
})

const picks = [
  { rank: "۱", cat: "تجربه کاربری", title: "Why design systems fail — and how to save them" },
  { rank: "۲", cat: "تایپوگرافی", title: "The quiet power of Persian type in digital interfaces" },
  { rank: "۳", cat: "ابزارها", title: "Figma variables, one year in: what changed in practice" },
]
</script>
