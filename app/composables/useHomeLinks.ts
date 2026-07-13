import type { Issue, LinkItem } from "../types/links";
import { useLinksData } from "./useLinksData";
import { formatPersianWeekdayDate, persianDayKey } from "../utils/persianDate";

interface ApiCategory {
  id: string;
  label: string;
}

interface ApiLink {
  id: string;
  url: string;
  title: string;
  body: string | null;
  publishedAt: string | null;
  categories: ApiCategory[];
}

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function groupIntoIssues(links: ApiLink[]): Issue[] {
  const groups = new Map<string, { date: Date; links: LinkItem[] }>();

  for (const link of links) {
    // Use publishedAt if available; fall back to current date so links with
    // a missing publishedAt are never silently dropped from the display.
    const date = link.publishedAt
      ? new Date(link.publishedAt)
      : new Date();
    const key = persianDayKey(date);

    if (!groups.has(key)) {
      groups.set(key, { date, links: [] });
    }

    groups.get(key)!.links.push({
      url: link.url,
      domain: domainOf(link.url),
      title: link.title,
      description: link.body ?? "",
      categories: link.categories.map((c) => c.id),
    });
  }

  return Array.from(groups.values())
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map(({ date, links: dayLinks }) => ({
      ...formatPersianWeekdayDate(date),
      links: dayLinks,
    }));
}

export async function useHomeLinks() {
  const { categories: staticCategories, issues: staticIssues } = useLinksData();

  // getCachedData: () => undefined — bypasses Nuxt's payload cache so every
  // navigation re-fetches fresh data instead of serving the stale SSR result.
  // Without this, Nuxt caches the first SSR result forever (until hard refresh),
  // so approving new links never appears until the user force-refreshes.
  const { data } = await useAsyncData(
    "home-links",
    async () => {
      try {
        const [linksRes, categoriesRes] = await Promise.all([
          $fetch<{ links: ApiLink[] }>("/api/links", { query: { take: 50 } }),
          $fetch<{ categories: ApiCategory[] }>("/api/categories"),
        ]);
        return { links: linksRes.links, categories: categoriesRes.categories };
      } catch {
        // Return null (not empty arrays) so we can distinguish "fetch failed"
        // from "DB genuinely has 0 published links." On failure we keep showing
        // whatever was there before (static fallback), rather than flashing empty.
        return null;
      }
    },
    {
      // Reuse the SSR payload for the initial hydration (so the client's
      // first render matches the server exactly, per Vue's hydration
      // contract), but bypass the cache for every subsequent navigation
      // so approving new links doesn't require a hard refresh to show up.
      // Returning undefined unconditionally (even during hydration) was
      // causing a hydration mismatch: the client would kick off its own
      // independent re-fetch before Vue finished reconciling against the
      // server-rendered HTML, and if that re-fetch resolved with even
      // slightly different data (a link published a moment later, a
      // transient failure falling back to the static demo data, etc.),
      // the client's first render no longer matched what the server sent.
      getCachedData: (key, nuxtApp) =>
        nuxtApp.isHydrating ? nuxtApp.payload.data[key] : undefined,
    }
  );

  const realIssues = computed(() =>
    data.value?.links ? groupIntoIssues(data.value.links) : []
  );

  // Only switch to real data when we HAVE real data.
  // null (fetch error) → show static fallback.
  // [] (DB has 0 published links) → show static fallback.
  // [...] (real links) → show real links only.
  const issues = computed(() =>
    realIssues.value.length > 0 ? realIssues.value : staticIssues
  );

  const categoryMap = computed(() => {
    const cats = data.value?.categories;
    const source = cats && cats.length > 0 ? cats : staticCategories;
    return Object.fromEntries(source.map((c) => [c.id, c.label]));
  });

  return {
    issues,
    categoryMap,
    hasRealLinks: computed(() => realIssues.value.length > 0),
  };
}
