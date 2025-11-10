/*
  Warnings:

  - You are about to drop the `declaration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `defineddeclaration` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `declaration` DROP FOREIGN KEY `Declaration_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `defineddeclaration` DROP FOREIGN KEY `DefinedDeclaration_customerId_fkey`;

-- DropTable
DROP TABLE `declaration`;

-- DropTable
DROP TABLE `defineddeclaration`;
