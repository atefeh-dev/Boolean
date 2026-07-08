<template>
  <section class="page-hero">
    <div>
      <p class="page-hero__eyebrow">{{ eyebrow }}</p>
      <h1 class="page-hero__title">{{ title }}</h1>
      <p class="page-hero__desc">{{ description }}</p>
    </div>
    <component :is="artComponent" />
  </section>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  eyebrow: string
  title: string
  description: string
  artComponent: Component
}>()
</script>
