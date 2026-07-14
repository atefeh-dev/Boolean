-- Performance review: composite indexes matching the app's actual
-- WHERE+ORDER BY query patterns (archive page, admin queue, admin
-- notifications, per-user notifications), plus indexing the two foreign
-- key columns that had no index backing their lookups at all.

-- CreateIndex
CREATE INDEX "links_status_publishedAt_idx" ON "links"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "links_status_createdAt_idx" ON "links"("status", "createdAt");

-- CreateIndex
CREATE INDEX "links_submittedById_status_updatedAt_idx" ON "links"("submittedById", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");
