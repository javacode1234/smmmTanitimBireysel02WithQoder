/*
  Warnings:

  - You are about to drop the column `twitterUrl` on the `sitesettings` table. All the data in the column will be lost.
  - You are about to drop the `clientlogo` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `icon` on table `service` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `number` to the `WorkflowStep` table without a default value. This is not possible if the table is not empty.
  - Made the column `icon` on table `workflowstep` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `faq` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `pricingplan` ADD COLUMN `color` VARCHAR(191) NOT NULL DEFAULT 'from-blue-500 to-blue-600',
    ADD COLUMN `icon` VARCHAR(191) NOT NULL DEFAULT 'Star';

-- AlterTable
ALTER TABLE `service` ADD COLUMN `color` VARCHAR(191) NOT NULL DEFAULT 'from-blue-500 to-blue-600',
    MODIFY `icon` VARCHAR(191) NOT NULL DEFAULT 'FileText';

-- AlterTable
ALTER TABLE `sitesettings` DROP COLUMN `twitterUrl`,
    ADD COLUMN `threadsUrl` VARCHAR(191) NULL,
    ADD COLUMN `xUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `teammember` ADD COLUMN `color` VARCHAR(191) NOT NULL DEFAULT 'from-blue-500 to-blue-600',
    ADD COLUMN `facebookUrl` VARCHAR(191) NULL,
    ADD COLUMN `initials` VARCHAR(191) NOT NULL DEFAULT '??',
    ADD COLUMN `instagramUrl` VARCHAR(191) NULL,
    ADD COLUMN `threadsUrl` VARCHAR(191) NULL,
    ADD COLUMN `xUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `testimonial` ADD COLUMN `color` VARCHAR(191) NOT NULL DEFAULT 'from-blue-500 to-blue-600',
    ADD COLUMN `initials` VARCHAR(191) NOT NULL DEFAULT '??';

-- AlterTable
ALTER TABLE `workflowstep` ADD COLUMN `color` VARCHAR(191) NOT NULL DEFAULT 'from-blue-500 to-blue-600',
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `number` VARCHAR(191) NOT NULL,
    MODIFY `icon` VARCHAR(191) NOT NULL DEFAULT 'Phone';

-- DropTable
DROP TABLE `clientlogo`;

-- CreateTable
CREATE TABLE `institutions_section` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'İş Birliği Yaptığımız Kurumlar',
    `paragraph` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `institutions_section_items` (
    `id` VARCHAR(191) NOT NULL,
    `sectionId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `url` VARCHAR(191) NULL,
    `logo` LONGTEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServicesSection` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'Hizmetlerimiz',
    `paragraph` TEXT NULL,
    `valuesTitle` VARCHAR(191) NULL DEFAULT 'Hizmet Değerlerimiz',
    `footerText` TEXT NULL,
    `footerSignature` VARCHAR(191) NULL DEFAULT 'SMMM Ekibi',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceValue` (
    `id` VARCHAR(191) NOT NULL,
    `sectionId` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkflowSection` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'Çalışma Sürecimiz',
    `paragraph` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PricingSection` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'Fiyatlandırma',
    `paragraph` TEXT NULL,
    `additionalTitle` VARCHAR(191) NOT NULL DEFAULT 'Ek Hizmetler',
    `additionalParagraph` TEXT NULL,
    `footerText` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdditionalService` (
    `id` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestimonialsSection` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'İstemcilerimiz Ne Diyor?',
    `paragraph` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamSection` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'Uzman Ekibimiz',
    `paragraph` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FAQSection` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'Sıkça Sorulan Sorular',
    `paragraph` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LegalDocument` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('PRIVACY_POLICY', 'TERMS_OF_USE', 'KVKK') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `lastUpdated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LegalDocument_type_key`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `logo` LONGTEXT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `taxNumber` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `city` VARCHAR(191) NULL,
    `facebookUrl` VARCHAR(191) NULL,
    `xUrl` VARCHAR(191) NULL,
    `linkedinUrl` VARCHAR(191) NULL,
    `instagramUrl` VARCHAR(191) NULL,
    `threadsUrl` VARCHAR(191) NULL,
    `ledgerType` VARCHAR(191) NULL,
    `subscriptionFee` VARCHAR(191) NULL,
    `establishmentDate` DATETIME(3) NULL,
    `authorizedName` VARCHAR(191) NULL,
    `authorizedTCKN` VARCHAR(191) NULL,
    `authorizedEmail` VARCHAR(191) NULL,
    `authorizedPhone` VARCHAR(191) NULL,
    `authorizedAddress` TEXT NULL,
    `authorizedFacebookUrl` VARCHAR(191) NULL,
    `authorizedXUrl` VARCHAR(191) NULL,
    `authorizedLinkedinUrl` VARCHAR(191) NULL,
    `authorizedInstagramUrl` VARCHAR(191) NULL,
    `authorizedThreadsUrl` VARCHAR(191) NULL,
    `authorizationDate` DATETIME(3) NULL,
    `authorizationPeriod` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `onboardingStage` ENUM('LEAD', 'PROSPECT', 'CUSTOMER') NOT NULL DEFAULT 'LEAD',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeclarationConfig` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `frequency` ENUM('MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `dueDay` INTEGER NULL,
    `dueHour` INTEGER NULL,
    `dueMinute` INTEGER NULL,
    `dueMonth` INTEGER NULL,
    `quarterOffset` INTEGER NULL,
    `yearlyCount` INTEGER NULL,
    `skipQuarter` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DeclarationConfig_type_key`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxReturn` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `period` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `month` INTEGER NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `submittedDate` DATETIME(3) NULL,
    `isSubmitted` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TaxReturn_customerId_idx`(`customerId`),
    INDEX `TaxReturn_period_idx`(`period`),
    INDEX `TaxReturn_year_month_idx`(`year`, `month`),
    INDEX `TaxReturn_dueDate_idx`(`dueDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerDocument` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileData` LONGTEXT NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NULL,
    `category` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `uploadedBy` VARCHAR(191) NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CustomerDocument_customerId_idx`(`customerId`),
    INDEX `CustomerDocument_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerMessage` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NULL,
    `senderName` VARCHAR(191) NOT NULL,
    `senderType` ENUM('ADMIN', 'CUSTOMER') NOT NULL DEFAULT 'ADMIN',
    `subject` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CustomerMessage_customerId_idx`(`customerId`),
    INDEX `CustomerMessage_isRead_idx`(`isRead`),
    INDEX `CustomerMessage_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstitutionalPassword` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `institution` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `InstitutionalPassword_customerId_idx`(`customerId`),
    INDEX `InstitutionalPassword_institution_idx`(`institution`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DefinedDeclaration` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DefinedDeclaration_customerId_idx`(`customerId`),
    UNIQUE INDEX `DefinedDeclaration_customerId_type_key`(`customerId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerDeclarationSetting` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `frequency` ENUM('MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `dueDay` INTEGER NOT NULL,
    `dueHour` INTEGER NOT NULL,
    `dueMinute` INTEGER NOT NULL,
    `dueMonth` INTEGER NULL,
    `quarterOffset` INTEGER NULL,
    `yearlyCount` INTEGER NULL,
    `skipQuarter` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CustomerDeclarationSetting_customerId_idx`(`customerId`),
    UNIQUE INDEX `CustomerDeclarationSetting_customerId_type_key`(`customerId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `institutions_section_items` ADD CONSTRAINT `institutions_section_items_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `institutions_section`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceValue` ADD CONSTRAINT `ServiceValue_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `ServicesSection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxReturn` ADD CONSTRAINT `TaxReturn_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerDocument` ADD CONSTRAINT `CustomerDocument_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerMessage` ADD CONSTRAINT `CustomerMessage_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstitutionalPassword` ADD CONSTRAINT `InstitutionalPassword_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DefinedDeclaration` ADD CONSTRAINT `DefinedDeclaration_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerDeclarationSetting` ADD CONSTRAINT `CustomerDeclarationSetting_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
