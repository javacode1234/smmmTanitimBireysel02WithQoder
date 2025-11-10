-- AlterTable
ALTER TABLE `declarationconfig` ADD COLUMN `taxPeriodType` ENUM('NORMAL', 'SPECIAL') NULL;

-- CreateTable
CREATE TABLE `CustomerDeclarationSetting` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `frequency` ENUM('MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `taxPeriodType` ENUM('NORMAL', 'SPECIAL') NULL,
    `dueDay` INTEGER NULL,
    `dueHour` INTEGER NULL,
    `dueMinute` INTEGER NULL,
    `dueMonth` INTEGER NULL,
    `quarterOffset` INTEGER NULL,
    `yearlyCount` INTEGER NULL,
    `skipQuarter` BOOLEAN NULL DEFAULT false,
    `quarters` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CustomerDeclarationSetting_customerId_idx`(`customerId`),
    UNIQUE INDEX `CustomerDeclarationSetting_customerId_type_key`(`customerId`, `type`),
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
    `taxPeriodType` ENUM('NORMAL', 'SPECIAL') NULL,
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

-- AddForeignKey
ALTER TABLE `CustomerDeclarationSetting` ADD CONSTRAINT `CustomerDeclarationSetting_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxReturn` ADD CONSTRAINT `TaxReturn_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
