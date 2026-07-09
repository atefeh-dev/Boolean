/**
 * The notifications feature has shipped two schema changes on top of the
 * base Prisma schema (the `lastNotificationsReadAt` column, then the
 * `NotificationDismissal` table). Each one needs BOTH:
 *   1. the migration applied to the actual database, and
 *   2. the Prisma Client regenerated so the JS API knows the new
 *      field/model exists.
 * These fail differently and get confused for each other easily:
 *   - Client not regenerated → `prisma.notificationDismissal` is
 *     `undefined`, so calling `.upsert()` on it throws a plain JS
 *     TypeError: "Cannot read properties of undefined (reading '...')".
 *   - Migration not applied → the client *does* know about the field/table
 *     and sends real SQL, which Postgres then rejects because the
 *     column/table doesn't exist ("column ... does not exist" / "relation
 *     ... does not exist").
 * This inspects the error and points at the actual fix instead of
 * guessing, so the log is directly actionable.
 */
export function logNotificationsSchemaDrift(context: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  const isStaleClient = /Cannot read propert(y|ies) of undefined/.test(message);
  const isMissingDbObject = /does not exist/i.test(message);

  let hint: string;
  if (isStaleClient) {
    hint =
      "the Prisma Client hasn't been regenerated since this model/field was added to schema.prisma. " +
      "Run `npx prisma generate` (or `npx prisma migrate dev`, which does this for you), then restart the dev server.";
  } else if (isMissingDbObject) {
    hint =
      "the migration for this hasn't been applied to this database yet. " +
      "Run `npx prisma migrate dev` (or `npx prisma migrate deploy` in production).";
  } else {
    hint = "unexpected error — see details below.";
  }

  console.error(`[notifications] ${context} — ${hint}`, err);
}
