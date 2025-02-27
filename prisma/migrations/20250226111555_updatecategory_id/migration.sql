/*
  Warnings:

  - Added the required column `count` to the `ProductOncart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `ProductOncart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `count` to the `ProductOnOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `ProductOnOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` ADD COLUMN `categoryId` INTEGER NULL;

-- AlterTable
ALTER TABLE `productoncart` ADD COLUMN `count` INTEGER NOT NULL,
    ADD COLUMN `price` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `productonorder` ADD COLUMN `count` INTEGER NOT NULL,
    ADD COLUMN `price` DOUBLE NOT NULL;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
