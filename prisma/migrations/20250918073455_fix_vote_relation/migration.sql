/*
  Warnings:

  - You are about to drop the column `optionId` on the `Vote` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,pollOptionId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pollOptionId` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Vote" DROP CONSTRAINT "Vote_optionId_fkey";

-- AlterTable
ALTER TABLE "public"."Poll" ALTER COLUMN "creatorId" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "passwordHash" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Vote" DROP COLUMN "optionId",
ADD COLUMN     "pollOptionId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_pollOptionId_key" ON "public"."Vote"("userId", "pollOptionId");

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_pollOptionId_fkey" FOREIGN KEY ("pollOptionId") REFERENCES "public"."PollOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
