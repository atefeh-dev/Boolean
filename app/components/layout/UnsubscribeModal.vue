<template>
  <Teleport to="body">
    <Transition name="unsub-fade">
      <div v-if="open" class="unsub" role="dialog" aria-modal="true" aria-labelledby="unsub-title">
        <div class="unsub__backdrop" @click="close" />

        <div class="unsub__card">
          <button type="button" class="unsub__close" aria-label="بستن" @click="close">
            <IconsX />
          </button>

          <div
            ref="artEl"
            class="unsub__art"
            :class="[`unsub__art--${face}`, { 'unsub__art--shake': face === 'worried', 'unsub__art--jump': face === 'laughing' }]"
          >
            <svg viewBox="0 0 590 484.7" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <g class="unsub__blobs">
                <path
                  class="unsub__blob"
                  d="M545.5,299c0,80.3-28.6,150.4-126.4,139.4-63.2-7.1-109.3-37.3-142.6-37.3-45.7,0-105.4,29.3-146.8,22.2-69-11.7-85.3-66.8-85.3-135.8,0-56.3,25.5-99.9,46.2-140.8,18.3-36.1,55.9-97.8,125.1-100.5,53.3-2.1,97.4,50.5,138.4,74.2,49.9,28.8,98.4-1.8,126,1.3C537.9,127.9,545.5,265.5,545.5,299Z"
                />
                <path
                  class="unsub__blob unsub__blob--b"
                  d="M55.1,300.7c0,80.3,27.4,150.4,121,139.4,60.5-7.1,104.7-37.3,136.5-37.3,43.8,0,100.9,29.3,140.5,22.2,66-11.7,81.7-66.8,81.7-135.8,0-56.3-16.2-103.6-36.1-144.5-17.6-36.1-54.9-97.4-121.2-100.1-51-2.1-100.1,53.8-139.4,77.5-47.8,28.8-94.3-1.8-120.7,1.3C62.4,129.6,55.1,267.1,55.1,300.7Z"
                />
              </g>

              <g class="unsub__confetti" transform="translate(294 243)" :class="{ 'is-active': confettiActive }">
                <g
                  v-for="piece in confettiPieces"
                  :key="piece.id"
                  class="unsub__confetti-piece"
                  :class="`unsub__confetti-piece--${piece.shape}`"
                  :style="confettiActive ? {
                    transform: `translate(${piece.x}px, ${piece.y}px) rotate(${piece.rotate}deg)`,
                    transitionDelay: `${piece.delay}ms`,
                  } : undefined"
                >
                  <rect v-if="piece.shape === 'square'" x="-8" y="-8" width="16" height="16" rx="3" />
                  <circle v-else-if="piece.shape === 'dot'" r="7" />
                  <path v-else d="M-7,-7 L7,7 M7,-7 L-7,7" stroke-width="3.5" stroke-linecap="round" fill="none" />
                </g>
              </g>

              <g class="unsub__envelope">
                <path
                  class="unsub__env-bg"
                  d="M452.9,376.3a26.1,26.1,0,0,1-25.5,20.8H162.6a26.1,26.1,0,0,1-26-26V193.2a26.1,26.1,0,0,1,26-26H427.4a26.1,26.1,0,0,1,26,26V371.1a25.9,25.9,0,0,1-.5,5.2"
                />

                <g class="unsub__paper-group">
                  <rect class="unsub__paper" x="157.3" y="87.6" width="275.3" height="266.33" rx="26" ry="26" />

                  <g class="unsub__face">
                    <g class="unsub__mouth" ref="mouthGroupEl">
                      <path
                        class="unsub__mouth-shape"
                        :class="{ 'is-visible': face === 'worried' }"
                        d="M275,220a18.7,18.7,0,0,1,35.9.1"
                      />
                      <path
                        class="unsub__mouth-shape"
                        :class="{ 'is-visible': face === 'sad' }"
                        d="M258.8,231.9c3.9-14.5,17.7-25.2,34-25.2s30.3,10.8,34.1,25.4"
                      />
                      <path
                        class="unsub__mouth-shape"
                        :class="{ 'is-visible': face === 'idle' }"
                        d="M271.1,218.7c10-11.1,28.2-15,43.6-9.4"
                      />
                      <path
                        class="unsub__mouth-shape"
                        :class="{ 'is-visible': face === 'happy' }"
                        d="M259.3,207c3.9,14.5,17.7,25.2,34,25.2s30.3-10.8,34.1-25.4"
                      />
                      <g class="unsub__mouth-laughing" :class="{ 'is-visible': face === 'laughing' }">
                        <path class="unsub__mouth-open" d="M323.8,208.3c3.9,0,6.7,3.9,5.9,7.9a37.5,37.5,0,0,1-73.5,0c-0.9-4.1,2-7.9,5.9-7.9h61.7Z" />
                        <path class="unsub__tongue" d="M293.2,241.1c6.9,0,13.1-2.3,17.3-5.9a2.1,2.1,0,0,0,.5-2.6c-3.1-5.8-9.9-9.8-17.8-9.8s-14.7,4-17.8,9.8a2.1,2.1,0,0,0,.5,2.5C280,238.8,286.2,241.1,293.2,241.1Z" />
                      </g>
                    </g>

                    <g class="unsub__eyes" ref="eyesGroupEl" :class="{ 'is-visible': face !== 'laughing' }">
                      <ellipse cx="349" cy="172.8" rx="11.2" ry="13.8" />
                      <ellipse cx="235.5" cy="172.8" rx="11.2" ry="13.8" />
                      <path
                        class="unsub__eyebrow"
                        :class="{ 'is-happy': face === 'happy' }"
                        :d="face === 'happy' ? 'M366.2,146.3c-2.6-5.3-14.8-14.1-24.3-14.7' : 'M341.9,133.7c2.6,5.3,14.8,14.1,24.3,14.7'"
                      />
                      <path
                        class="unsub__eyebrow"
                        :class="{ 'is-happy': face === 'happy' }"
                        :d="face === 'happy' ? 'M216.4,146.3c2.6-5.3,14.8-14.1,24.3-14.7' : 'M240.7,133.7c-2.6,5.3-14.8,14.1-24.3,14.7'"
                      />
                    </g>
                    <g class="unsub__eyes-laughing" ref="eyesLaughingGroupEl" :class="{ 'is-visible': face === 'laughing' }">
                      <path d="M332.2,174c0-8.3,7.5-15,16.8-15s16.8,6.7,16.8,15" />
                      <path d="M218.7,174c0-8.3,7.5-15,16.8-15s16.8,6.7,16.8,15" />
                    </g>
                  </g>
                </g>

                <path
                  class="unsub__env-back"
                  d="M451.9,186.7S322.4,288.2,313.4,294.1s-27,5.8-36.9,0S137.9,186.5,137.9,186.5a23.6,23.6,0,0,0-1.3,6.7V371.1a26.1,26.1,0,0,0,26,26H427.4a26,26,0,0,0,26-26V193.2C453.4,190.7,452.5,188.9,451.9,186.7Z"
                />
                <path
                  class="unsub__env-front"
                  d="M139.8,381.9s127.5-99.5,136.5-105.4,27-5.8,36.9,0S449.8,382.1,449.8,382.1"
                />
                <path
                  class="unsub__env-front-flap"
                  d="M225.4,315.3s41.9-33,51-38.9,27-5.8,36.9,0S355,307.9,355,307.9"
                />
              </g>
            </svg>
          </div>

          <div class="unsub__body">
            <h2 id="unsub-title" class="unsub__title">{{ title }}</h2>
            <p class="unsub__subtitle" :class="{ 'unsub__subtitle--error': !!errorMsg }">{{ subtitle }}</p>

            <div v-if="stage === 'confirm' || stage === 'loading'" class="unsub__actions">
              <UiAppButton
                variant="danger"
                :disabled="stage === 'loading'"
                @mouseenter="face = 'worried'"
                @mouseleave="face = 'idle'"
                @click="handleUnsubscribe"
              >
                {{ stage === 'loading' ? 'در حال لغو…' : 'لغو عضویت' }}
              </UiAppButton>
              <UiAppButton
                variant="outline"
                :disabled="stage === 'loading'"
                @mouseenter="face = 'happy'"
                @mouseleave="face = 'idle'"
                @click="handleCancel"
              >
                انصراف
              </UiAppButton>
            </div>

            <div v-else-if="stage === 'unsubscribed' || stage === 'cancelled'" class="unsub__actions">
              <UiAppButton variant="outline" @click="close">بستن</UiAppButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const open = defineModel<boolean>({ default: false })

const { markUnsubscribed } = useAuth()
const { showToast } = useToast()
const guestSubscribedCookie = useNewsletterGuestCookie()

type Stage = "confirm" | "loading" | "unsubscribed" | "cancelled"
type Face = "idle" | "worried" | "happy" | "sad" | "laughing"

const stage = ref<Stage>("confirm")
const face = ref<Face>("idle")
const errorMsg = ref("")
const confettiActive = ref(false)

const CONFETTI_SHAPES = ["square", "dot", "bowtie"] as const
const confettiPieces = reactive(
  Array.from({ length: 10 }, (_, i) => ({
    id: i,
    shape: CONFETTI_SHAPES[i % CONFETTI_SHAPES.length],
    // Pre-computed once (not on every cancel) so re-triggering is just a
    // class toggle — the scatter is randomized per modal open, not per frame.
    x: 0,
    y: 0,
    rotate: 0,
    delay: Math.round(i * 15 + Math.random() * 40),
  }))
)

function rollConfetti() {
  const count = confettiPieces.length
  confettiPieces.forEach((piece, i) => {
    const angle = (360 / count) * i + Math.random() * 20
    const dist = 90 + Math.random() * 70
    piece.x = Math.cos((angle * Math.PI) / 180) * dist
    piece.y = Math.sin((angle * Math.PI) / 180) * dist
    piece.rotate = Math.round(Math.random() * 360)
  })
}

const title = computed(() => {
  if (stage.value === "unsubscribed") return "خیلی دلمون براتون تنگ می‌شه!"
  if (stage.value === "cancelled") return "خوشحالیم که موندید!"
  return "مطمئنید می‌خواهید عضویت را لغو کنید؟"
})

const subtitle = computed(() => {
  if (errorMsg.value) return errorMsg.value
  if (stage.value === "unsubscribed") return "دیگر خبرنامه روزانه برای شما ارسال نمی‌شود."
  if (stage.value === "cancelled") return "خبرنامه روزانه همچنان برایتان ارسال خواهد شد."
  return "با لغو عضویت، خبرنامه روزانه دیگر برای شما ارسال نمی‌شود."
})

function resetState() {
  stage.value = "confirm"
  face.value = "idle"
  errorMsg.value = ""
  confettiActive.value = false
}

function close() {
  open.value = false
}

watch(open, (val) => {
  if (val) resetState()
})

async function handleUnsubscribe() {
  stage.value = "loading"
  errorMsg.value = ""
  try {
    await $fetch("/api/newsletter/unsubscribe", { method: "POST" })
    markUnsubscribed()
    // This browser's guest cookie (if any) is a separate, anonymous claim
    // from before this account existed/linked — clear it too, otherwise
    // it could make "subscribed" reappear after logging out.
    guestSubscribedCookie.value = undefined
    stage.value = "unsubscribed"
    face.value = "sad"
    showToast("عضویت شما لغو شد.")
    // No auto-close on either final state — both "unsubscribed" and
    // "stayed subscribed" wait for an explicit close (✕ or the button
    // below) rather than being swept away on a timer.
  } catch {
    stage.value = "confirm"
    face.value = "idle"
    errorMsg.value = "مشکلی پیش آمد. دوباره تلاش کنید."
  }
}

function handleCancel() {
  stage.value = "cancelled"
  face.value = "laughing"
  rollConfetti()
  // Next tick so the elements paint at their (0,0) resting position first,
  // then the class toggle's transition animates them out from there.
  requestAnimationFrame(() => {
    confettiActive.value = true
  })
}

onBeforeUnmount(() => {
  stopTracking()
})

// ── Cursor-tracking eyes + mouth ──────────────────────────────────────
// The original used a direct 1:1 mapping (set transform straight from the
// mousemove event), which snaps instantly to the cursor on every event.
// For genuinely smooth motion, this instead lerps a running offset toward
// the cursor's target position a little each animation frame — the classic
// "smooth follow" technique — rather than jumping straight to it.
const artEl = ref<HTMLElement | null>(null)
const eyesGroupEl = ref<SVGGElement | null>(null)
const eyesLaughingGroupEl = ref<SVGGElement | null>(null)
const mouthGroupEl = ref<SVGGElement | null>(null)

const EYE_AMPLITUDE = 6 // px of max eye travel
const MOUTH_AMPLITUDE = 2.5 // px — subtler than the eyes, just a hint of life
const SMOOTHING = 0.14 // lower = smoother/slower catch-up, higher = snappier

const cursorTarget = { x: 0, y: 0 } // -1..1, relative to the art's center
const eyesOffset = { x: 0, y: 0 }
const mouthOffset = { x: 0, y: 0 }
let rafId: number | null = null
let trackingEnabled = false

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function handlePointerMove(e: MouseEvent | TouchEvent) {
  const rect = artEl.value?.getBoundingClientRect()
  if (!rect) return
  const point = "touches" in e ? e.touches[0] : e
  if (!point) return
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  cursorTarget.x = clamp((point.clientX - cx) / (rect.width / 2), -1, 1)
  cursorTarget.y = clamp((point.clientY - cy) / (rect.height / 2), -1, 1)
}

function tick() {
  eyesOffset.x += (cursorTarget.x * EYE_AMPLITUDE - eyesOffset.x) * SMOOTHING
  eyesOffset.y += (cursorTarget.y * EYE_AMPLITUDE - eyesOffset.y) * SMOOTHING
  mouthOffset.x += (cursorTarget.x * MOUTH_AMPLITUDE - mouthOffset.x) * SMOOTHING
  mouthOffset.y += (cursorTarget.y * MOUTH_AMPLITUDE - mouthOffset.y) * SMOOTHING

  const eyesTransform = `translate(${eyesOffset.x.toFixed(2)}px, ${eyesOffset.y.toFixed(2)}px)`
  if (eyesGroupEl.value) eyesGroupEl.value.style.transform = eyesTransform
  if (eyesLaughingGroupEl.value) eyesLaughingGroupEl.value.style.transform = eyesTransform
  if (mouthGroupEl.value) {
    mouthGroupEl.value.style.transform = `translate(${mouthOffset.x.toFixed(2)}px, ${mouthOffset.y.toFixed(2)}px)`
  }

  rafId = requestAnimationFrame(tick)
}

function startTracking() {
  if (trackingEnabled) return
  if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) return
  trackingEnabled = true
  window.addEventListener("mousemove", handlePointerMove)
  window.addEventListener("touchmove", handlePointerMove, { passive: true })
  rafId = requestAnimationFrame(tick)
}

function stopTracking() {
  trackingEnabled = false
  window.removeEventListener("mousemove", handlePointerMove)
  window.removeEventListener("touchmove", handlePointerMove)
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = null
  cursorTarget.x = 0
  cursorTarget.y = 0
  eyesOffset.x = 0
  eyesOffset.y = 0
  mouthOffset.x = 0
  mouthOffset.y = 0
  if (eyesGroupEl.value) eyesGroupEl.value.style.transform = ""
  if (eyesLaughingGroupEl.value) eyesLaughingGroupEl.value.style.transform = ""
  if (mouthGroupEl.value) mouthGroupEl.value.style.transform = ""
}

watch(open, (val) => {
  if (val) nextTick(startTracking)
  else stopTracking()
})
</script>
