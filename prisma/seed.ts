import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const __dir = dirname(fileURLToPath(import.meta.url));

const categories = [
  { id: "ux", label: "تجربه کاربری" },
  { id: "ui", label: "رابط کاربری" },
  { id: "tools", label: "ابزارها" },
  { id: "typography", label: "تایپوگرافی" },
  { id: "ai", label: "هوش مصنوعی" },
  { id: "design-systems", label: "سیستم طراحی" },
  { id: "inspiration", label: "الهام‌بخش" },
  { id: "resources", label: "منابع" },
  { id: "accessibility", label: "دسترس‌پذیری" },
  { id: "programming", label: "برنامه‌نویسی" },
  { id: "reflections", label: "تأملات" },
  { id: "case-study", label: "مطالعه موردی" },
];

async function main() {
  for (const cat of categories) {
    await prisma.category.upsert({ where: { id: cat.id }, update: { label: cat.label }, create: cat });
  }
  console.log("Seeded " + categories.length + " categories.");

  const linksJson = JSON.parse(readFileSync(resolve(__dir, "../data/links.json"), "utf-8"));
  const now = new Date();
  let seededLinks = 0;

  for (let di = 0; di < linksJson.issues.length; di++) {
    const issue = linksJson.issues[di];
    const issueDate = new Date(now);
    issueDate.setDate(now.getDate() - (linksJson.issues.length - di) * 7);

    for (let li = 0; li < issue.links.length; li++) {
      const link = issue.links[li];
      const existing = await prisma.link.findFirst({ where: { url: link.url } });
      if (existing) continue;

      const publishedAt = new Date(issueDate);
      publishedAt.setMinutes(li * 5);

      await prisma.link.create({
        data: {
          url: link.url,
          title: link.title,
          body: link.description || null,
          status: "PUBLISHED",
          publishedAt,
          categories: {
            connect: link.categories
              .filter((id) => categories.some((c) => c.id === id))
              .map((id) => ({ id })),
          },
        },
      });
      seededLinks++;
    }
  }
  console.log("Seeded " + seededLinks + " demo links as published records.");

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: { role: "ADMIN" },
      create: { name: "Admin", email: adminEmail.toLowerCase(), passwordHash, role: "ADMIN" },
    });
    console.log("Admin user ready: " + adminEmail);
  }
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
