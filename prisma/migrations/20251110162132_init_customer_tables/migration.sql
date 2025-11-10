/*
  Warnings:

  - You are about to drop the `customerdeclarationsetting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customerdocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customermessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `institutionalpassword` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `taxreturn` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `customerdeclarationsetting` DROP FOREIGN KEY `CustomerDeclarationSetting_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `customerdocument` DROP FOREIGN KEY `CustomerDocument_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `customermessage` DROP FOREIGN KEY `CustomerMessage_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `institutionalpassword` DROP FOREIGN KEY `InstitutionalPassword_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `taxreturn` DROP FOREIGN KEY `TaxReturn_customerId_fkey`;

-- AlterTable
ALTER TABLE `customer` ADD COLUMN `documents` LONGTEXT NULL,
    ADD COLUMN `passwords` TEXT NULL;

-- AlterTable
ALTER TABLE `defineddeclaration` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE `customerdeclarationsetting`;

-- DropTable
DROP TABLE `customerdocument`;

-- DropTable
DROP TABLE `customermessage`;

-- DropTable
DROP TABLE `institutionalpassword`;

-- DropTable
DROP TABLE `taxreturn`;
