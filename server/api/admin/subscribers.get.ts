import { Prisma } from "@prisma/client";

// This intentionally queries across two tables in one page: Subscriber
// rows (which may or may not have an account attached — a guest can
// subscribe without ever registering) UNION'd with User rows that have
// no Subscriber at all (joined the site, never subscribed to the
// newsletter). That's what "filter/search across everyone relevant to
// the newsletter" actually requires, and it isn't expressible as a
// single Prisma model query — hence the raw SQL. All inputs are passed
// as bound parameters via Prisma.sql, never string-concatenated.
const CONTACTS_CTE = Prisma.sql`
  WITH contacts AS (
    SELECT
      s.id           AS id,
      s.email        AS email,
      u.name         AS name,
      u.id           AS "userId",
      TRUE           AS subscribed,
      s."createdAt"  AS "createdAt"
    FROM subscribers s
    LEFT JOIN users u ON u.id = s."userId"

    UNION ALL

    SELECT
      u.id           AS id,
      u.email        AS email,
      u.name         AS name,
      u.id           AS "userId",
      FALSE          AS subscribed,
      u."createdAt"  AS "createdAt"
    FROM users u
    WHERE NOT EXISTS (SELECT 1 FROM subscribers s2 WHERE s2."userId" = u.id)
  )
`;

interface ContactRow {
  id: string;
  email: string;
  name: string | null;
  userId: string | null;
  subscribed: boolean;
  createdAt: Date;
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const query = getQuery(event);
  const take = Math.min(Math.max(Number(query.take) || 30, 1), 100);
  const skip = Math.max(Number(query.skip) || 0, 0);
  const filter = query.filter === "subscribed" || query.filter === "not-subscribed" ? query.filter : "all";
  const search = typeof query.search === "string" ? query.search.trim().slice(0, 100) : "";

  const conditions: Prisma.Sql[] = [];
  if (filter === "subscribed") conditions.push(Prisma.sql`subscribed = TRUE`);
  if (filter === "not-subscribed") conditions.push(Prisma.sql`subscribed = FALSE`);
  if (search) {
    const like = `%${search}%`;
    conditions.push(Prisma.sql`(email ILIKE ${like} OR name ILIKE ${like})`);
  }
  const whereSql = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}` : Prisma.empty;

  const [rows, countRows] = await Promise.all([
    prisma.$queryRaw<ContactRow[]>(Prisma.sql`
      ${CONTACTS_CTE}
      SELECT id, email, name, "userId", subscribed, "createdAt" FROM contacts
      ${whereSql}
      ORDER BY "createdAt" DESC
      LIMIT ${take} OFFSET ${skip}
    `),
    prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
      ${CONTACTS_CTE}
      SELECT COUNT(*)::bigint AS count FROM contacts
      ${whereSql}
    `),
  ]);

  return {
    subscribers: rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      hasAccount: !!r.userId,
      subscribed: r.subscribed,
      createdAt: r.createdAt,
    })),
    total: Number(countRows[0]?.count ?? 0),
    take,
    skip,
  };
});
