-- Performance review: the admin subscribers-page search does
-- `email ILIKE '%term%' OR name ILIKE '%term%'` across users + subscribers.
-- A leading-wildcard ILIKE can't use a plain B-tree index no matter what,
-- so this adds trigram (pg_trgm) GIN indexes instead, which *can* serve
-- substring search. Not urgent at today's data volume (a sequential scan
-- over a few hundred rows is invisible), but cheap to add now rather than
-- as a fire well after the member list has grown into the tens of
-- thousands.
--
-- NOTE: this is an "unmanaged" migration — pg_trgm/GIN indexes aren't
-- reflected in schema.prisma, since that requires enabling the
-- `postgresqlExtensions` preview feature project-wide. Applied via
-- `prisma migrate deploy` like any other migration; just won't show up
-- if you ever re-introspect the DB into the schema file.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "users_email_trgm_idx" ON "users" USING gin ("email" gin_trgm_ops);
CREATE INDEX "users_name_trgm_idx"  ON "users" USING gin ("name" gin_trgm_ops);
CREATE INDEX "subscribers_email_trgm_idx" ON "subscribers" USING gin ("email" gin_trgm_ops);
