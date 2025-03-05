/*
  Warnings:

  - Added the required column `secure_url` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `image` ADD COLUMN `secure_url` VARCHAR(191) NOT NULL;
