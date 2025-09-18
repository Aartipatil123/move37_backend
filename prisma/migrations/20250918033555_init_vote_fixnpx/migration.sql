/*
  Warnings:

  - You are about to drop the column `creatorId` on the `Poll` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `Poll` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Poll` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `optionId` on the `Vote` table. All the data in the column will be lost.
  - You are about to drop the `PollOption` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `option` to the `Vote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pollId` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Poll" DROP CONSTRAINT "Poll_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PollOption" DROP CONSTRAINT "PollOption_pollId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vote" DROP CONSTRAINT "Vote_optionId_fkey";

-- DropIndex
DROP INDEX "public"."Vote_userId_optionId_key";

-- AlterTable
ALTER TABLE "public"."Poll" DROP COLUMN "creatorId",
DROP COLUMN "isPublished",
DROP COLUMN "updatedAt",
ADD COLUMN     "options" TEXT[];

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "passwordHash",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Vote" DROP COLUMN "optionId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "option" TEXT NOT NULL,
ADD COLUMN     "pollId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."PollOption";

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "public"."Poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
