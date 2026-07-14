<template>
  <SharedPageHero
    eyebrow="the archive"
    title="آرشیو بولتن"
    description="تمام شماره‌های گذشته، یکجا. جستجو کنید یا بر اساس دسته‌بندی مرور کنید و هر لینک خوبی را که از دست داده‌اید پیدا کنید."
    :art-component="ArtArchiveHeroArt"
  />

  <ArchiveControls
    :query="searchQuery"
    :active-category="activeCategory"
    :chips="filterChips"
    @update:query="searchQuery = $event"
    @update:active-category="activeCategory = $event"
  />

  <div id="archive-list">
    <div v-for="month in visibleMonths" :key="month.label" class="month-group">
      <h2 class="month-heading">{{ month.label }}</h2>
      <ArchiveIssue
        v-for="(issue, index) in month.issues"
        :key="`${month.label}-${index}`"
        :issue="issue"
      />
    </div>
  </div>

  <div class="no-results" :class="{ visible: !hasResults }">
    <p style="font-size: 1.125rem; margin-bottom: 8px">نتیجه‌ای یافت نشد</p>
    <small>عبارت جستجو یا فیلتر دیگری امتحان کنید</small>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useArchiveData } from "../composables/useArchiveData";
import ArtArchiveHeroArt from "../components/art/ArchiveHeroArt.vue";

const { archiveMonths, categories } = await useArchiveData();

const searchQuery = ref("");
const activeCategory = ref("");

const filterChips = computed(() => [
  { id: "", label: "همه" },
  ...categories.value.map((category) => ({ id: category.id, label: category.label })),
]);

function issueMatches(issueText: string, categoriesList: string[]) {
  const query = searchQuery.value.trim().toLowerCase();
  const category = activeCategory.value;

  const matchesQuery = !query || issueText.toLowerCase().includes(query);
  const matchesCategory = !category || categoriesList.includes(category);

  return matchesQuery && matchesCategory;
}

const visibleMonths = computed(() =>
  archiveMonths.value
    .map((month) => ({
      ...month,
      issues: month.issues.filter((issue) =>
        issueMatches(
          `${issue.weekday} ${issue.dateShort} ${issue.previewLinks.map((link) => link.title).join(" ")}`,
          issue.categories,
        ),
      ),
    }))
    .filter((month) => month.issues.length > 0),
);

const hasResults = computed(() => visibleMonths.value.length > 0);
</script>
