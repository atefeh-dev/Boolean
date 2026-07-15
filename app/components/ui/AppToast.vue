<template>
  <div class="toast" :class="{ show: toastVisible }" role="alert" aria-live="polite">
    {{ toastMessage }}
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

function useToast() {
  const toastMessage = ref('')
  const toastVisible = ref(false)
  return { toastMessage, toastVisible }
}

const { toastMessage, toastVisible } = useToast()
</script>
