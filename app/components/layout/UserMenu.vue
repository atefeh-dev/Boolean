<template>
  <div ref="root" class="user-menu">
    <button
      type="button"
      class="user-menu__trigger"
      :aria-expanded="open"
      aria-haspopup="true"
      @click="open = !open"
    >
      <span class="user-menu__avatar" aria-hidden="true">{{ initial }}</span>
      <span class="user-menu__meta">
        <span class="user-menu__name">{{ name }}</span>
        <span class="user-menu__role">{{ roleLabel }}</span>
      </span>
      <IconsChevronDown class="user-menu__chevron" :class="{ 'is-open': open }" />
    </button>

    <Transition name="user-menu-fade">
      <div v-if="open" class="user-menu__panel" role="menu">
        <NuxtLink
          v-if="adminLinkTo"
          :to="adminLinkTo"
          class="user-menu__item"
          role="menuitem"
          @click="open = false"
        >
          <IconsDashboard />
          پنل مدیریت
        </NuxtLink>
        <button type="button" class="user-menu__item user-menu__item--danger" role="menuitem" @click="handleLogout">
          <IconsPower />
          خروج از حساب
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string
  roleLabel: string
  adminLinkTo?: string
}>()

const emit = defineEmits<{ logout: [] }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const initial = computed(() => props.name?.trim()?.charAt(0) ?? '؟')

function handleLogout() {
  open.value = false
  emit('logout')
}

function handleClickOutside(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) {
    open.value = false
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>
