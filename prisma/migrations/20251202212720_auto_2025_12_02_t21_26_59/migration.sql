-- AlterTable
ALTER TABLE `customer` ADD COLUMN `activities` LONGTEXT NULL,
    ADD COLUMN `authorizedPersons` LONGTEXT NULL,
    ADD COLUMN `branches` LONGTEXT NULL,
    ADD COLUMN `chambers` LONGTEXT NULL,
    ADD COLUMN `mainActivityCode` VARCHAR(191) NULL,
    ADD COLUMN `messages` LONGTEXT NULL,
    ADD COLUMN `partners` LONGTEXT NULL;
