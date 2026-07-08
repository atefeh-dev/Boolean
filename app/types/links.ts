export interface Category {
  id: string
  label: string
}

export interface LinkItem {
  url: string
  domain: string
  title: string
  description: string
  categories: string[]
}

export interface Issue {
  weekday: string
  date: string
  links: LinkItem[]
}

export interface LinksData {
  categories: Category[]
  issues: Issue[]
}

export interface CategoryLinkItem {
  domain: string
  title: string
  url: string
  date: string
}

export interface CategorySection {
  id: string
  label: string
  count: number
  links: CategoryLinkItem[]
}

export interface ArchivePreviewLink {
  rank: number
  title: string
  url: string
  domain: string
}

export interface ArchiveIssue {
  weekday: string
  dateShort: string
  categories: string[]
  previewLinks: ArchivePreviewLink[]
  remainingCount: number
}

export interface ArchiveMonth {
  label: string
  issues: ArchiveIssue[]
}
