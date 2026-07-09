-- AlterTable
-- Watermark timestamp for the notifications bell: notifications newer than
-- this are considered unread. NULL means "never opened the panel", so
-- everything currently unread by default until first open.
ALTER TABLE "users" ADD COLUMN "lastNotificationsReadAt" TIMESTAMP(3);
