-- CreateTable
CREATE TABLE `AccountingPeriod` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `status` ENUM('ACTIVE', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AccountingPeriod_customerId_idx`(`customerId`),
    INDEX `AccountingPeriod_year_idx`(`year`),
    UNIQUE INDEX `AccountingPeriod_customerId_year_key`(`customerId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubscriptionAccrual` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `accountingPeriodId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'TRY',
    `description` VARCHAR(191) NOT NULL DEFAULT 'Aidat Tahakkuku',
    `dueDate` DATETIME(3) NOT NULL,
    `isPaid` BOOLEAN NOT NULL DEFAULT false,
    `paymentDate` DATETIME(3) NULL,
    `carryForwardAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `carryForwardToPeriodId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SubscriptionAccrual_customerId_idx`(`customerId`),
    INDEX `SubscriptionAccrual_accountingPeriodId_idx`(`accountingPeriodId`),
    INDEX `SubscriptionAccrual_dueDate_idx`(`dueDate`),
    INDEX `SubscriptionAccrual_isPaid_idx`(`isPaid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccountingPeriod` ADD CONSTRAINT `AccountingPeriod_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubscriptionAccrual` ADD CONSTRAINT `SubscriptionAccrual_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubscriptionAccrual` ADD CONSTRAINT `SubscriptionAccrual_accountingPeriodId_fkey` FOREIGN KEY (`accountingPeriodId`) REFERENCES `AccountingPeriod`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubscriptionAccrual` ADD CONSTRAINT `SubscriptionAccrual_carryForwardToPeriodId_fkey` FOREIGN KEY (`carryForwardToPeriodId`) REFERENCES `AccountingPeriod`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
