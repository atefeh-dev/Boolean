import type { ArchiveMonth } from "../types/links";
import { archiveMonths as staticArchiveMonths } from "../../data/content";
import {
  formatPersianWeekdayDate,
  persianDayKey,
  persianMonthYearKey,
  persianMonthYearLabel,
} from "../utils/persianDate";

interface ApiLink {
  id: string;
  url: string;
  title: string;
  publishedAt: string | null;
  categories: { id: string; label: string }[];
}

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const PREVIEW_COUNT = 3;

export async function useArchiveData() {
  const { data } = await useAsyncData(
    "archive-data",
    async () => {
      try {
        const res = await $fetch<{ links: ApiLink[] }>("/api/links", {
          query: { take: 500 },
        });
        return res.links;
      } catch {
        return null;
      }
    },
    { getCachedData: () => undefined }
  );

  const archiveMonths = computed<ArchiveMonth[]>(() => {
    const links = data.value;

    // null (fetch error) or empty → static fallback.
    if (!links || links.length === 0) return staticArchiveMonths;

    // Group into day-issues.
    const dayGroups = new Map<string, { date: Date; links: ApiLink[] }>();
    for (const link of links) {
      const date = link.publishedAt ? new Date(link.publishedAt) : new Date();
      const key = persianDayKey(date);
      if (!dayGroups.has(key)) dayGroups.set(key, { date, links: [] });
      dayGroups.get(key)!.links.push(link);
    }

    const issues = Array.from(dayGroups.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map(({ date, links: dayLinks }) => {
        const { weekday, date: dateShort } = formatPersianWeekdayDate(date);
        const categories = Array.from(
          new Set(dayLinks.flatMap((l) => l.categories.map((c) => c.id)))
        );
        return {
          date,
          weekday,
          dateShort,
          categories,
          previewLinks: dayLinks.slice(0, PREVIEW_COUNT).map((l, i) => ({
            rank: i + 1,
            title: l.title,
            url: l.url,
            domain: domainOf(l.url),
          })),
          remainingCount: Math.max(0, dayLinks.length - PREVIEW_COUNT),
        };
      });

    // Group issues into Persian calendar months.
    const monthGroups = new Map<
      string,
      { label: string; sortKey: string; issues: typeof issues }
    >();
    for (const issue of issues) {
      const sortKey = persianMonthYearKey(issue.date);
      if (!monthGroups.has(sortKey)) {
        monthGroups.set(sortKey, {
          label: persianMonthYearLabel(issue.date),
          sortKey,
          issues: [],
        });
      }
      monthGroups.get(sortKey)!.issues.push(issue);
    }

    return Array.from(monthGroups.values())
      .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
      .map(({ label, issues: monthIssues }) => ({
        label,
        issues: monthIssues.map(({ date: _date, ...rest }) => rest),
      }));
  });

  return { archiveMonths };
}
