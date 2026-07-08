<template>
  <div class="toast" :class="{ show: toastVisible }" role="alert" aria-live="polite">
    {{ toastMessage }}
  </div>
</template>

<script setup lang="ts">
const { toastMessage, toastVisible } = useToast()
</script>
