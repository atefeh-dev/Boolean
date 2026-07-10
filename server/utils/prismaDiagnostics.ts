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
/**
 * Generic version of the diagnostic below — any endpoint that hits Prisma
 * can use this to tell "client not regenerated" apart from "migration not
 * applied" instead of surfacing a bare, unhelpful 500.
 *
 *   - Client not regenerated → calling a method/field Prisma doesn't know
 *     about yet throws PrismaClientValidationError ("Unknown argument ...")
 *     or, if the whole model is missing, a plain TypeError ("Cannot read
 *     properties of undefined").
 *   - Migration not applied → the client *does* know about the field/table
 *     and sends real SQL, which Postgres then rejects because the
 *     column/table doesn't exist ("column ... does not exist" / "relation
 *     ... does not exist").
 *
 * Returns the hint string (so callers can log it with their own context)
 * rather than logging directly, so this stays reusable outside server routes.
 */
export function diagnosePrismaSchemaDrift(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  const isStaleClient =
    /Cannot read propert(y|ies) of undefined/.test(message) ||
    /Unknown argument/.test(message) ||
    /Unknown field/.test(message);
  const isMissingDbObject = /does not exist/i.test(message);

  if (isStaleClient) {
    return (
      "the Prisma Client hasn't been regenerated since this model/field was added to schema.prisma. " +
      "Run `npx prisma generate` (or `npx prisma migrate dev`, which does this for you), then restart the dev server."
    );
  }
  if (isMissingDbObject) {
    return (
      "the migration for this hasn't been applied to this database yet. " +
      "Run `npx prisma migrate dev` (or `npx prisma migrate deploy` in production)."
    );
  }
  return "unexpected error — see details below.";
}

export function logNotificationsSchemaDrift(context: string, err: unknown) {
  console.error(`[notifications] ${context} — ${diagnosePrismaSchemaDrift(err)}`, err);
}
