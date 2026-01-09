/*
  Warnings:

  - You are about to drop the column `dueHour` on the `customerdeclarationsetting` table. All the data in the column will be lost.
  - You are about to drop the column `dueMinute` on the `customerdeclarationsetting` table. All the data in the column will be lost.
  - You are about to drop the column `skipQuarter` on the `customerdeclarationsetting` table. All the data in the column will be lost.
  - You are about to drop the column `yearlyCount` on the `customerdeclarationsetting` table. All the data in the column will be lost.
  - You are about to drop the column `dueHour` on the `declarationconfig` table. All the data in the column will be lost.
  - You are about to drop the column `dueMinute` on the `declarationconfig` table. All the data in the column will be lost.
  - You are about to drop the column `skipQuarter` on the `declarationconfig` table. All the data in the column will be lost.
  - You are about to drop the column `yearlyCount` on the `declarationconfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `accountingperiod` ADD COLUMN `feeAccrualDay` INTEGER NULL DEFAULT 1,
    ADD COLUMN `monthlyFee` VARCHAR(191) NULL,
    ADD COLUMN `monthlyFees` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `customer` ADD COLUMN `addressCode` VARCHAR(191) NULL,
    ADD COLUMN `companyClass` VARCHAR(191) NULL,
    ADD COLUMN `companyType` VARCHAR(191) NULL,
    ADD COLUMN `district` VARCHAR(191) NULL,
    ADD COLUMN `feeAccrualDay` INTEGER NULL DEFAULT 1,
    ADD COLUMN `openingBalance` VARCHAR(191) NULL,
    ADD COLUMN `serviceStartDate` DATETIME(3) NULL,
    ADD COLUMN `tckn` VARCHAR(191) NULL,
    ADD COLUMN `telegramUrl` VARCHAR(191) NULL,
    ADD COLUMN `transactions` LONGTEXT NULL,
    ADD COLUMN `website` VARCHAR(191) NULL,
    MODIFY `address` TEXT NULL;

-- AlterTable
ALTER TABLE `customerdeclarationsetting` DROP COLUMN `dueHour`,
    DROP COLUMN `dueMinute`,
    DROP COLUMN `skipQuarter`,
    DROP COLUMN `yearlyCount`;

-- AlterTable
ALTER TABLE `declarationconfig` DROP COLUMN `dueHour`,
    DROP COLUMN `dueMinute`,
    DROP COLUMN `skipQuarter`,
    DROP COLUMN `yearlyCount`;
