<template>
  <div ref="root" class="notif">
    <UiAppButton
      variant="icon-ghost"
      size="lg"
      class="notif__trigger"
      :aria-expanded="open"
      aria-haspopup="true"
      :title="unreadCount > 0 ? `اعلان‌ها (${badgeLabel} مورد جدید)` : 'اعلان‌ها'"
      @click="toggle"
    >
      <IconsBell class="notif__bell-icon" :class="{ 'notif__bell-icon--ring': ringing }" />
      <span v-if="unreadCount > 0" class="notif__badge" aria-hidden="true">{{ badgeLabel }}</span>
    </UiAppButton>

    <Transition name="user-menu-fade">
      <div
        v-if="open"
        class="notif__panel"
        role="menu"
        :class="{ 'notif__panel--dragging': panelSwipeOffset !== 0 }"
        :style="panelDragStyle"
        @touchstart="onPanelTouchStart"
        @touchmove="onPanelTouchMove"
        @touchend="onPanelTouchEnd"
      >
        <div class="notif__panel-head">
          <span>اعلان‌ها</span>
          <span class="notif__panel-head-actions">
            <span v-if="unreadCount > 0" class="notif__unread-badge">{{ unreadCount }} جدید</span>
            <UiAppButton variant="icon-ghost" size="sm" aria-label="بستن" @click="open = false">
              <IconsX />
            </UiAppButton>
          </span>
        </div>

        <div v-if="loading" class="notif__state">در حال بارگذاری...</div>
        <div v-else-if="error" class="notif__state notif__state--error">
          دریافت اعلان‌ها با خطا مواجه شد.
        </div>
        <div v-else-if="!notifications.length" class="notif__state">اعلانی وجود ندارد</div>

        <TransitionGroup v-else tag="ul" name="notif-row" class="notif__list">
          <li v-for="item in notifications" :key="item.id" class="notif__row">
            <div
              class="notif__item-wrap"
              :style="itemDragStyle(item.id)"
              @touchstart="onItemTouchStart($event, item.id)"
              @touchmove="onItemTouchMove($event, item.id)"
              @touchend="onItemTouchEnd($event, item.id)"
            >
              <NuxtLink :to="item.href" class="notif__item" role="menuitem" @click="open = false">
                <span class="notif__icon" :class="iconClass(item.type)" aria-hidden="true">
                  <IconsCheckCircle v-if="item.type === 'link_published'" />
                  <IconsXCircle v-else-if="item.type === 'link_rejected'" />
                  <IconsClock v-else />
                </span>
                <span class="notif__item-body">
                  <span class="notif__item-title" :class="{ 'is-unread': !item.read }">
                    {{ item.title }}
                  </span>
                  <span class="notif__item-meta">
                    <span v-if="item.meta">{{ item.meta }} · </span>{{ relativeTime(item.createdAt) }}
                  </span>
                </span>
                <span v-if="!item.read" class="notif__item-dot" aria-hidden="true" />
              </NuxtLink>
              <UiAppButton
                variant="icon"
                size="sm"
                class="notif__item-dismiss"
                aria-label="حذف این اعلان"
                @click.stop.prevent="dismissNotification(item.id)"
              >
                <IconsX />
              </UiAppButton>
            </div>
          </li>
        </TransitionGroup>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { formatRelativeTime } from '../../utils/persianDate'
import { toPersian } from '../../utils/persian'
import type { NotificationItem } from '../../composables/useNotifications'

const { notifications, loading, error, unreadCount, ringing, fetchNotifications, markAllRead, dismissNotification } =
  useNotifications()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
let pollTimer: ReturnType<typeof setInterval> | undefined

const SWIPE_DISMISS_THRESHOLD = 60 // px of horizontal drag before it commits

// ── Whole-panel swipe (closes the dropdown) ────────────────────────────
const panelSwipeOffset = ref(0)
let panelTouchStartX = 0
let panelTouchStartY = 0
let panelIsHorizontal = false

function onPanelTouchStart(event: TouchEvent) {
  const touch = event.touches[0]
  if (!touch) return
  panelTouchStartX = touch.clientX
  panelTouchStartY = touch.clientY
  panelIsHorizontal = false
}
function onPanelTouchMove(event: TouchEvent) {
  const touch = event.touches[0]
  if (!touch) return
  const dx = touch.clientX - panelTouchStartX
  const dy = touch.clientY - panelTouchStartY
  if (!panelIsHorizontal && Math.abs(dx) < 10 && Math.abs(dy) < 10) return
  if (!panelIsHorizontal) panelIsHorizontal = Math.abs(dx) > Math.abs(dy)
  if (!panelIsHorizontal) return
  panelSwipeOffset.value = dx
}
function onPanelTouchEnd() {
  if (panelIsHorizontal && Math.abs(panelSwipeOffset.value) > SWIPE_DISMISS_THRESHOLD) {
    open.value = false
  }
  panelSwipeOffset.value = 0
  panelIsHorizontal = false
}
const panelDragStyle = computed(() => {
  if (panelSwipeOffset.value === 0) return undefined
  const opacity = Math.max(1 - Math.abs(panelSwipeOffset.value) / 200, 0.4)
  return {
    transform: `translateX(calc(-50% + ${panelSwipeOffset.value}px))`,
    opacity: String(opacity),
    transition: 'none',
  }
})

// ── Per-item swipe (dismisses just that notification) ──────────────────
// Item swipes stop propagation so they don't also drag the whole panel.
const itemDrag = ref<{ id: string; offset: number; isHorizontal: boolean } | null>(null)
let itemTouchStartX = 0
let itemTouchStartY = 0

function onItemTouchStart(event: TouchEvent, id: string) {
  const touch = event.touches[0]
  if (!touch) return
  event.stopPropagation()
  itemTouchStartX = touch.clientX
  itemTouchStartY = touch.clientY
  itemDrag.value = { id, offset: 0, isHorizontal: false }
}
function onItemTouchMove(event: TouchEvent, id: string) {
  const touch = event.touches[0]
  if (!touch || itemDrag.value?.id !== id) return
  event.stopPropagation()
  const dx = touch.clientX - itemTouchStartX
  const dy = touch.clientY - itemTouchStartY
  if (!itemDrag.value.isHorizontal && Math.abs(dx) < 10 && Math.abs(dy) < 10) return
  if (!itemDrag.value.isHorizontal) itemDrag.value.isHorizontal = Math.abs(dx) > Math.abs(dy)
  if (!itemDrag.value.isHorizontal) return
  itemDrag.value.offset = dx
}
function onItemTouchEnd(event: TouchEvent, id: string) {
  if (itemDrag.value?.id !== id) return
  event.stopPropagation()
  const { offset, isHorizontal } = itemDrag.value
  itemDrag.value = null
  if (isHorizontal && Math.abs(offset) > SWIPE_DISMISS_THRESHOLD) {
    dismissNotification(id)
  }
}
function itemDragStyle(id: string) {
  if (itemDrag.value?.id !== id || itemDrag.value.offset === 0) return undefined
  const offset = itemDrag.value.offset
  const opacity = Math.max(1 - Math.abs(offset) / 150, 0.3)
  return {
    transform: `translateX(${offset}px)`,
    opacity: String(opacity),
    transition: 'none',
  }
}

const badgeLabel = computed(() => (unreadCount.value > 9 ? '۹+' : toPersian(unreadCount.value)))

function iconClass(type: NotificationItem['type']) {
  return {
    'notif__icon--published': type === 'link_published',
    'notif__icon--rejected': type === 'link_rejected',
    'notif__icon--pending': type === 'link_pending',
  }
}

function relativeTime(iso: string) {
  return formatRelativeTime(new Date(iso))
}

async function toggle() {
  const opening = !open.value
  open.value = opening
  if (opening) {
    // Fetch first so items render with the `read` flag as of *before* this
    // open (still shows what's new). markAllRead() then persists "seen up
    // to now" on the server — the next fetch will reflect everything read.
    await fetchNotifications({ force: true })
    markAllRead()
  }
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
  fetchNotifications()
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)

  // The badge is otherwise only refreshed when this component remounts
  // (i.e. on full navigation), so a pending link submitted while an admin
  // is sitting on the dashboard wouldn't bump the count until they moved
  // pages. Poll quietly in the background so the number stays live. Only
  // refreshes the count/list — never force-opens the panel or re-marks
  // anything as read.
  pollTimer = setInterval(() => {
    if (!open.value) fetchNotifications({ force: true })
  }, 45_000)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  if (pollTimer) clearInterval(pollTimer)
})
</script>
