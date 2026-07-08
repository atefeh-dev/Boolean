import type { ArchiveMonth, CategorySection } from '~/types/links'

export const archiveMonths: ArchiveMonth[] = [
  {
    label: 'خرداد ۱۴۰۳',
    issues: [
      {
        weekday: 'یکشنبه',
        dateShort: '۲۶ خرداد',
        categories: ['ux', 'ai', 'design-systems', 'ui', 'accessibility', 'typography', 'resources'],
        previewLinks: [
          {
            rank: 1,
            title: 'چگونه طراحی محصول با هوش مصنوعی تغییر می‌کند',
            url: 'https://uxdesign.cc/how-product-design-is-changing-with-ai',
            domain: 'uxdesign.cc',
          },
          {
            rank: 2,
            title: 'راهنمای کامل سیستم رنگ در طراحی',
            url: 'https://www.smashingmagazine.com/color-systems',
            domain: 'smashingmagazine.com',
          },
          {
            rank: 3,
            title: 'فیگما ۲۰۲۴: ویژگی‌های جدیدی که باید بدانید',
            url: 'https://www.figma.com/blog/new-features-2024',
            domain: 'figma.com',
          },
        ],
        remainingCount: 2,
      },
      {
        weekday: 'شنبه',
        dateShort: '۲۵ خرداد',
        categories: ['design-systems', 'ux', 'inspiration', 'typography', 'rtl', 'accessibility', 'tools', 'ui'],
        previewLinks: [
          {
            rank: 1,
            title: 'چرا سیستم‌های طراحی شکست می‌خورند',
            url: 'https://uxdesign.cc/why-design-systems-fail',
            domain: 'uxdesign.cc',
          },
          {
            rank: 2,
            title: 'ترکیب رنگ‌های پرطرفدار تابستان ۲۰۲۴',
            url: 'https://dribbble.com/summer-color-palettes-2024',
            domain: 'dribbble.com',
          },
          {
            rank: 3,
            title: 'فونت‌های متغیر برای رابط‌های فارسی',
            url: 'https://type-network.com/variable-fonts-rtl',
            domain: 'type-network.com',
          },
        ],
        remainingCount: 2,
      },
      {
        weekday: 'جمعه',
        dateShort: '۲۴ خرداد',
        categories: ['ui', 'ux', 'forms', 'programming', 'animation', 'tools'],
        previewLinks: [
          {
            rank: 1,
            title: 'طراحی برای حالت تاریک: فراتر از معکوس کردن رنگ‌ها',
            url: 'https://www.smashingmagazine.com/dark-mode-beyond-invert',
            domain: 'smashingmagazine.com',
          },
          {
            rank: 2,
            title: 'اصل کمترین شگفتی در طراحی فرم‌ها',
            url: 'https://www.nngroup.com/articles/least-surprise-forms',
            domain: 'nngroup.com',
          },
          {
            rank: 3,
            title: 'انیمیشن‌های scroll-driven بدون جاوااسکریپت',
            url: 'https://css-tricks.com/scroll-driven-animations-no-js',
            domain: 'css-tricks.com',
          },
        ],
        remainingCount: 2,
      },
      {
        weekday: 'پنجشنبه',
        dateShort: '۲۳ خرداد',
        categories: ['case-study', 'ux', 'ui', 'tools', 'inspiration', 'ai', 'reflections', 'programming', 'design-systems'],
        previewLinks: [
          {
            rank: 1,
            title: 'مطالعه موردی: طراحی مجدد اپلیکیشن بانکی',
            url: 'https://uxdesign.cc/banking-app-redesign',
            domain: 'uxdesign.cc',
          },
          {
            rank: 2,
            title: 'هنر میکرو-کپی در UI',
            url: 'https://www.smashingmagazine.com/microcopy',
            domain: 'smashingmagazine.com',
          },
          {
            rank: 3,
            title: 'ابزارهای برتر طراحی موشن',
            url: 'https://www.producthunt.com/motion-design-tools',
            domain: 'producthunt.com',
          },
        ],
        remainingCount: 2,
      },
      {
        weekday: 'چهارشنبه',
        dateShort: '۲۲ خرداد',
        categories: ['ux', 'reflections', 'inspiration', 'ui', 'tools', 'resources', 'design-systems'],
        previewLinks: [
          {
            rank: 1,
            title: 'چرا سادگی بهترین استراتژی طراحی است',
            url: 'https://www.nngroup.com/articles/simplicity',
            domain: 'nngroup.com',
          },
          {
            rank: 2,
            title: 'الهام‌بخش‌ترین پروتایپ‌های ۲۰۲۴',
            url: 'https://dribbble.com/best-prototypes-2024',
            domain: 'dribbble.com',
          },
          {
            rank: 3,
            title: 'طراحی برای ایمیل: چالش‌ها و راه‌حل‌ها',
            url: 'https://www.emailonacid.com/design-challenges',
            domain: 'emailonacid.com',
          },
        ],
        remainingCount: 2,
      },
    ],
  },
]

export const categoryCards = [
  { id: 'ux', label: 'تجربه کاربری', count: 12 },
  { id: 'ui', label: 'رابط کاربری', count: 9 },
  { id: 'tools', label: 'ابزارها', count: 8 },
  { id: 'design-systems', label: 'سیستم طراحی', count: 7 },
  { id: 'ai', label: 'هوش مصنوعی', count: 6 },
  { id: 'typography', label: 'تایپوگرافی', count: 5 },
  { id: 'inspiration', label: 'الهام‌بخش', count: 5 },
  { id: 'resources', label: 'منابع', count: 4 },
  { id: 'accessibility', label: 'دسترس‌پذیری', count: 4 },
  { id: 'programming', label: 'برنامه‌نویسی', count: 3 },
  { id: 'case-study', label: 'مطالعه موردی', count: 3 },
  { id: 'reflections', label: 'تأملات', count: 3 },
] as const

export const categorySections: CategorySection[] = [
  {
    id: 'ux',
    label: 'تجربه کاربری',
    count: 12,
    links: [
      { domain: 'uxdesign.cc', title: 'چگونه طراحی محصول با هوش مصنوعی تغییر می‌کند', url: 'https://uxdesign.cc/how-product-design-is-changing-with-ai', date: '۲۶ خرداد' },
      { domain: 'nngroup.com', title: 'اصول دسترس‌پذیری در طراحی موبایل', url: 'https://www.nngroup.com/articles/mobile-accessibility', date: '۲۶ خرداد' },
      { domain: 'uxdesign.cc', title: 'چرا سیستم‌های طراحی شکست می‌خورند', url: 'https://uxdesign.cc/why-design-systems-fail', date: '۲۵ خرداد' },
      { domain: 'uxdesign.cc', title: 'مطالعه موردی: طراحی مجدد اپلیکیشن بانکی', url: 'https://uxdesign.cc/banking-app-redesign', date: '۲۳ خرداد' },
      { domain: 'nngroup.com', title: 'چرا سادگی بهترین استراتژی طراحی است', url: 'https://www.nngroup.com/articles/simplicity', date: '۲۲ خرداد' },
    ],
  },
  {
    id: 'ai',
    label: 'هوش مصنوعی',
    count: 6,
    links: [
      { domain: 'uxdesign.cc', title: 'چگونه طراحی محصول با هوش مصنوعی تغییر می‌کند', url: 'https://uxdesign.cc/how-product-design-is-changing-with-ai', date: '۲۶ خرداد' },
      { domain: 'invisionapp.com', title: 'طراحی در دوران AI: تأملی بر آینده', url: 'https://www.invisionapp.com/design-in-ai-era', date: '۲۳ خرداد' },
    ],
  },
  {
    id: 'tools',
    label: 'ابزارها',
    count: 8,
    links: [
      { domain: 'figma.com', title: 'فیگما ۲۰۲۴: ویژگی‌های جدیدی که باید بدانید', url: 'https://www.figma.com/blog/new-features-2024', date: '۲۶ خرداد' },
      { domain: 'producthunt.com', title: 'ابزارهای برتر طراحی موشن', url: 'https://www.producthunt.com/motion-design-tools', date: '۲۳ خرداد' },
      { domain: 'figma.com', title: 'آشنایی با Tokens در سیستم طراحی', url: 'https://www.figma.com/blog/design-tokens', date: '۲۲ خرداد' },
    ],
  },
  {
    id: 'design-systems',
    label: 'سیستم طراحی',
    count: 7,
    links: [
      { domain: 'smashingmagazine.com', title: 'راهنمای کامل سیستم رنگ در طراحی', url: 'https://www.smashingmagazine.com/color-systems', date: '۲۶ خرداد' },
      { domain: 'uxdesign.cc', title: 'چرا سیستم‌های طراحی شکست می‌خورند', url: 'https://uxdesign.cc/why-design-systems-fail', date: '۲۵ خرداد' },
      { domain: 'figma.com', title: 'آشنایی با Tokens در سیستم طراحی', url: 'https://www.figma.com/blog/design-tokens', date: '۲۲ خرداد' },
    ],
  },
  {
    id: 'typography',
    label: 'تایپوگرافی',
    count: 5,
    links: [
      { domain: 'css-tricks.com', title: 'تایپوگرافی متغیر: آینده فونت‌ها', url: 'https://css-tricks.com/variable-fonts', date: '۲۶ خرداد' },
      { domain: 'type-network.com', title: 'فونت‌های متغیر برای رابط‌های فارسی', url: 'https://type-network.com/variable-fonts-rtl', date: '۲۵ خرداد' },
    ],
  },
  {
    id: 'ui',
    label: 'رابط کاربری',
    count: 9,
    links: [
      { domain: 'smashingmagazine.com', title: 'طراحی برای حالت تاریک: فراتر از معکوس کردن رنگ‌ها', url: 'https://www.smashingmagazine.com/dark-mode-beyond-invert', date: '۲۴ خرداد' },
      { domain: 'smashingmagazine.com', title: 'هنر میکرو-کپی در UI', url: 'https://www.smashingmagazine.com/microcopy', date: '۲۳ خرداد' },
    ],
  },
  {
    id: 'inspiration',
    label: 'الهام‌بخش',
    count: 5,
    links: [
      { domain: 'dribbble.com', title: 'ترکیب رنگ‌های پرطرفدار تابستان ۲۰۲۴', url: 'https://dribbble.com/summer-color-palettes-2024', date: '۲۵ خرداد' },
      { domain: 'dribbble.com', title: 'الهام‌بخش‌ترین پروتایپ‌های ۲۰۲۴', url: 'https://dribbble.com/best-prototypes-2024', date: '۲۲ خرداد' },
    ],
  },
  {
    id: 'resources',
    label: 'منابع',
    count: 4,
    links: [
      { domain: 'css-tricks.com', title: 'تایپوگرافی متغیر: آینده فونت‌ها', url: 'https://css-tricks.com/variable-fonts', date: '۲۶ خرداد' },
      { domain: 'uxdesign.cc', title: 'تحقیق کاربری با بودجه محدود', url: 'https://uxdesign.cc/user-research-budget', date: '۲۲ خرداد' },
    ],
  },
  {
    id: 'accessibility',
    label: 'دسترس‌پذیری',
    count: 4,
    links: [
      { domain: 'nngroup.com', title: 'اصول دسترس‌پذیری در طراحی موبایل', url: 'https://www.nngroup.com/articles/mobile-accessibility', date: '۲۶ خرداد' },
    ],
  },
  {
    id: 'programming',
    label: 'برنامه‌نویسی',
    count: 3,
    links: [
      { domain: 'css-tricks.com', title: 'انیمیشن‌های scroll-driven بدون جاوااسکریپت', url: 'https://css-tricks.com/scroll-driven-animations-no-js', date: '۲۴ خرداد' },
      { domain: 'css-tricks.com', title: 'سیستم گرید در طراحی مدرن', url: 'https://css-tricks.com/grid-systems', date: '۲۳ خرداد' },
    ],
  },
  {
    id: 'case-study',
    label: 'مطالعه موردی',
    count: 3,
    links: [
      { domain: 'uxdesign.cc', title: 'مطالعه موردی: طراحی مجدد اپلیکیشن بانکی', url: 'https://uxdesign.cc/banking-app-redesign', date: '۲۳ خرداد' },
    ],
  },
  {
    id: 'reflections',
    label: 'تأملات',
    count: 3,
    links: [
      { domain: 'invisionapp.com', title: 'طراحی در دوران AI: تأملی بر آینده', url: 'https://www.invisionapp.com/design-in-ai-era', date: '۲۳ خرداد' },
      { domain: 'nngroup.com', title: 'چرا سادگی بهترین استراتژی طراحی است', url: 'https://www.nngroup.com/articles/simplicity', date: '۲۲ خرداد' },
    ],
  },
]

export const submitCategories = [
  { id: 'ux', label: 'تجربه کاربری' },
  { id: 'ui', label: 'رابط کاربری' },
  { id: 'tools', label: 'ابزارها' },
  { id: 'typography', label: 'تایپوگرافی' },
  { id: 'ai', label: 'هوش مصنوعی' },
  { id: 'design-systems', label: 'سیستم طراحی' },
  { id: 'inspiration', label: 'الهام‌بخش' },
  { id: 'resources', label: 'منابع' },
  { id: 'accessibility', label: 'دسترس‌پذیری' },
  { id: 'programming', label: 'برنامه‌نویسی' },
  { id: 'reflections', label: 'تأملات' },
  { id: 'case-study', label: 'مطالعه موردی' },
] as const
