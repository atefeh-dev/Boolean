import type { LinksData } from "../types/links";
import { computed } from "vue";
import linksJson from "../../data/links.json";

export function useLinksData() {
  const data = linksJson as LinksData;

  const categoryMap = computed(() =>
    Object.fromEntries(
      data.categories.map((category) => [category.id, category.label]),
    ),
  );

  return {
    categories: data.categories,
    issues: data.issues,
    categoryMap,
  };
}
