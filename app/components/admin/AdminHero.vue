<template>
  <section class="admin-hero">
    <ArtAdminHeroArt class="admin-hero__art" />

    <div class="admin-hero__content">
      <h1 class="admin-hero__title">
        به پنل مدیریت <span>Booltan</span> خوش آمدید!
      </h1>
      <p class="admin-hero__desc">
        <template v-if="pendingCount > 0">
          {{ toPersian(pendingCount) }} لینک تازه منتظر بررسی شماست — هر روز چند
          دقیقه برای مرور کافی است.
        </template>
        <template v-else>
          همه‌چیز به‌روز است. لینک جدیدی برای بررسی وجود ندارد.
        </template>
      </p>

      <div class="admin-hero__actions">
        <button type="button" class="admin-hero__btn admin-hero__btn--primary" @click="$emit('review')">
          بررسی لینک‌های در انتظار
        </button>
        <button type="button" class="admin-hero__btn admin-hero__btn--ghost" @click="$emit('newsletter')">
          مدیریت خبرنامه
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ pendingCount: number }>();
defineEmits<{ review: []; newsletter: [] }>();
</script>
