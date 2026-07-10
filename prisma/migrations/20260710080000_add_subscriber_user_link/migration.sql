-- AlterTable
ALTER TABLE "subscribers" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_userId_key" ON "subscribers"("userId");

-- AddForeignKey
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
