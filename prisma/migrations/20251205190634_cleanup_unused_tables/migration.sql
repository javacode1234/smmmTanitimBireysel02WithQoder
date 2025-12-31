/*
  Warnings:

  - You are about to drop the `announcement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `announcementclient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `collection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reminder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `announcementclient` DROP FOREIGN KEY `AnnouncementClient_announcementId_fkey`;

-- DropForeignKey
ALTER TABLE `announcementclient` DROP FOREIGN KEY `AnnouncementClient_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `client` DROP FOREIGN KEY `Client_userId_fkey`;

-- DropForeignKey
ALTER TABLE `collection` DROP FOREIGN KEY `Collection_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_userId_fkey`;

-- DropTable
DROP TABLE `announcement`;

-- DropTable
DROP TABLE `announcementclient`;

-- DropTable
DROP TABLE `client`;

-- DropTable
DROP TABLE `collection`;

-- DropTable
DROP TABLE `message`;

-- DropTable
DROP TABLE `reminder`;

-- DropTable
DROP TABLE `settings`;
