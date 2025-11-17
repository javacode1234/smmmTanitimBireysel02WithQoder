-- AlterTable
ALTER TABLE `customer` ADD COLUMN `declarations` TEXT NULL,
    ADD COLUMN `hasEmployees` BOOLEAN NULL DEFAULT false,
    MODIFY `logo` VARCHAR(191) NULL,
    MODIFY `address` VARCHAR(191) NULL,
    MODIFY `authorizedAddress` VARCHAR(191) NULL,
    MODIFY `documents` TEXT NULL;

-- CreateIndex
CREATE INDEX `Customer_companyName_idx` ON `Customer`(`companyName`);

-- CreateIndex
CREATE INDEX `Customer_taxNumber_idx` ON `Customer`(`taxNumber`);

-- CreateIndex
CREATE INDEX `Customer_status_idx` ON `Customer`(`status`);

-- CreateIndex
CREATE INDEX `Customer_onboardingStage_idx` ON `Customer`(`onboardingStage`);

-- CreateIndex
CREATE INDEX `Customer_createdAt_idx` ON `Customer`(`createdAt`);
