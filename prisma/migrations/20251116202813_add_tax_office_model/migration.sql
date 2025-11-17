/*
  Warnings:

  - You are about to drop the column `taxOffice` on the `customer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `customer` DROP COLUMN `taxOffice`,
    ADD COLUMN `taxOfficeId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `customer` ADD CONSTRAINT `customer_taxOfficeId_fkey` FOREIGN KEY (`taxOfficeId`) REFERENCES `TaxOffice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
