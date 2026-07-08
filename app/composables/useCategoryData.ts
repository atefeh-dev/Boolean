import type { CategorySection } from "../types/links";
import {
  categoryCards as staticCategoryCards,
  categorySections as staticCategorySections,
} from "../../data/content";

interface ApiCategory {
  id: string;
  label: string;
}

interface ApiLink {
  id: string;
  url: string;
  title: string;
  publishedAt: string | null;
  categories: ApiCategory[];
}

interface CategoryCard {
  id: string;
  label: string;
  count: number;
}

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function shortPersianDate(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

export async function useCategoryData() {
  const { data } = await useAsyncData(
    "category-data",
    async () => {
      try {
        const [linksRes, categoriesRes] = await Promise.all([
          $fetch<{ links: ApiLink[] }>("/api/links", { query: { take: 500 } }),
          $fetch<{ categories: ApiCategory[] }>("/api/categories"),
        ]);
        return { links: linksRes.links, categories: categoriesRes.categories };
      } catch {
        return null;
      }
    },
    { getCachedData: () => undefined }
  );

  // null = fetch failed or Prisma not ready → show static fallback.
  // Non-null but empty links → DB has no published links → show static fallback.
  // Non-null with links → show real data.
  const hasRealData = computed(
    () =>
      data.value !== null &&
      (data.value?.links.length ?? 0) > 0 &&
      (data.value?.categories.length ?? 0) > 0
  );

  const categoryCards = computed<CategoryCard[]>(() => {
    if (!hasRealData.value || !data.value) return [...staticCategoryCards];

    const counts = new Map<string, number>();
    for (const link of data.value.links) {
      for (const cat of link.categories) {
        counts.set(cat.id, (counts.get(cat.id) ?? 0) + 1);
      }
    }

    return data.value.categories
      .map((cat) => ({
        id: cat.id,
        label: cat.label,
        count: counts.get(cat.id) ?? 0,
      }))
      .filter((card) => card.count > 0)
      .sort((a, b) => b.count - a.count);
  });

  const categorySections = computed<CategorySection[]>(() => {
    if (!hasRealData.value || !data.value) return staticCategorySections;

    return categoryCards.value.map((card) => {
      const links = data
        .value!.links.filter((link) =>
          link.categories.some((c) => c.id === card.id)
        )
        .sort((a, b) =>
          (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")
        )
        .map((link) => ({
          domain: domainOf(link.url),
          title: link.title,
          url: link.url,
          date: shortPersianDate(link.publishedAt),
        }));

      return { id: card.id, label: card.label, count: links.length, links };
    });
  });

  return { categoryCards, categorySections };
}
