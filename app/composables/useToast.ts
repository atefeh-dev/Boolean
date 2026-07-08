import { ref, readonly } from "vue";

const toastMessage = ref("");
const toastVisible = ref(false);
let toastTimer: ReturnType<typeof setTimeout> | undefined;

export function useToast() {
  function showToast(message: string, duration = 3000) {
    toastMessage.value = message;
    toastVisible.value = true;

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastVisible.value = false;
    }, duration);
  }

  return {
    toastMessage: readonly(toastMessage),
    toastVisible: readonly(toastVisible),
    showToast,
  };
}
