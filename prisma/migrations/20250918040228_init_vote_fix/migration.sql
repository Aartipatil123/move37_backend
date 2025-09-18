/*
  Warnings:

  - You are about to drop the column `options` on the `Poll` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Vote` table. All the data in the column will be lost.
  - You are about to drop the column `option` on the `Vote` table. All the data in the column will be lost.
  - You are about to drop the column `pollId` on the `Vote` table. All the data in the column will be lost.
  - Added the required column `optionId` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Vote" DROP CONSTRAINT "Vote_pollId_fkey";

-- AlterTable
ALTER TABLE "public"."Poll" DROP COLUMN "options",
ADD COLUMN     "creatorId" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "createdAt",
ADD COLUMN     "passwordHash" TEXT NOT NULL DEFAULT 'default_password';

-- AlterTable
ALTER TABLE "public"."Vote" DROP COLUMN "createdAt",
DROP COLUMN "option",
DROP COLUMN "pollId",
ADD COLUMN     "optionId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."PollOption" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "pollId" INTEGER NOT NULL,

    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Poll" ADD CONSTRAINT "Poll_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PollOption" ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "public"."Poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "public"."PollOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
