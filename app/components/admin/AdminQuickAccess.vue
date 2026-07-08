<template>
  <div class="admin-quick">
    <p class="admin-quick__title">دسترسی سریع</p>
    <div class="admin-quick__grid">
      <NuxtLink
        v-for="tile in tiles"
        :key="tile.key"
        :to="tile.href"
        class="admin-quick__tile"
      >
        <span class="admin-quick__icon">
          <component :is="tile.icon" />
        </span>
        <span>{{ tile.label }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsPlus from "../icons/Plus.vue";
import IconsClock from "../icons/Clock.vue";
import IconsGrid from "../icons/Grid.vue";
import IconsMail from "../icons/Mail.vue";
import IconsUsers from "../icons/Users.vue";

const tiles = [
  { key: "submit",      label: "ارسال لینک جدید",  icon: IconsPlus,        href: "/submit" },
  { key: "links",       label: "بررسی لینک‌ها",    icon: IconsClock,       href: "/admin/links" },
  { key: "subscribers", label: "مشترکان",           icon: IconsUsers,       href: "/admin/subscribers" },
  { key: "newsletter",  label: "ارسال خبرنامه",     icon: IconsMail,        href: "/admin/newsletter" },
  { key: "categories",  label: "دسته‌بندی‌ها",     icon: IconsGrid,        href: "/categories" },
];
</script>
