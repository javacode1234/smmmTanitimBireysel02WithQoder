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

    INDEX `institutions_section_items_sectionId_fkey`(`sectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aboutfeature` (
    `id` VARCHAR(191) NOT NULL,
    `sectionId` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `AboutFeature_sectionId_fkey`(`sectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aboutsection` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` TEXT NULL,
    `description` TEXT NOT NULL,
    `image` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    INDEX `Account_userId_fkey`(`userId`),
    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accountingperiod` (
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
CREATE TABLE `additionalservice` (
    `id` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `announcement` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('INFO', 'WARNING', 'REMINDER', 'URGENT') NOT NULL DEFAULT 'INFO',
    `targetAll` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `announcementclient` (
    `id` VARCHAR(191) NOT NULL,
    `announcementId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,

    INDEX `AnnouncementClient_clientId_fkey`(`clientId`),
    UNIQUE INDEX `AnnouncementClient_announcementId_clientId_key`(`announcementId`, `clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `client` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `taxNumber` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Client_userId_key`(`userId`),
    UNIQUE INDEX `Client_taxNumber_key`(`taxNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `collection` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `type` ENUM('INCOME', 'EXPENSE') NOT NULL DEFAULT 'INCOME',
    `date` DATETIME(3) NOT NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Collection_clientId_fkey`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contactmessage` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('NEW', 'PENDING', 'REPLIED', 'RESOLVED') NOT NULL DEFAULT 'NEW',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer` (
    `id` VARCHAR(191) NOT NULL,
    `logo` LONGTEXT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `taxNumber` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
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
    `authorizedAddress` VARCHAR(191) NULL,
    `authorizedFacebookUrl` VARCHAR(191) NULL,
    `authorizedXUrl` VARCHAR(191) NULL,
    `authorizedLinkedinUrl` VARCHAR(191) NULL,
    `authorizedInstagramUrl` VARCHAR(191) NULL,
    `authorizedThreadsUrl` VARCHAR(191) NULL,
    `authorizationDate` DATETIME(3) NULL,
    `authorizationPeriod` VARCHAR(191) NULL,
    `notes` LONGTEXT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `onboardingStage` ENUM('LEAD', 'PROSPECT', 'CUSTOMER') NOT NULL DEFAULT 'LEAD',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `documents` LONGTEXT NULL,
    `passwords` LONGTEXT NULL,
    `taxPeriodType` ENUM('NORMAL', 'SPECIAL') NULL,
    `declarations` LONGTEXT NULL,
    `hasEmployees` BOOLEAN NULL DEFAULT false,
    `employeeCount` INTEGER NULL,
    `taxOfficeId` VARCHAR(191) NULL,

    INDEX `Customer_companyName_idx`(`companyName`),
    INDEX `Customer_createdAt_idx`(`createdAt`),
    INDEX `Customer_onboardingStage_idx`(`onboardingStage`),
    INDEX `Customer_status_idx`(`status`),
    INDEX `Customer_taxNumber_idx`(`taxNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customerdeclarationsetting` (
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
CREATE TABLE `declarationconfig` (
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
    `optional` BOOLEAN NOT NULL DEFAULT false,
    `quarters` TEXT NULL,
    `taxPeriodType` ENUM('NORMAL', 'SPECIAL') NULL,

    UNIQUE INDEX `DeclarationConfig_type_key`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faq` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer` TEXT NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    INDEX `FAQ_categoryId_fkey`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faqcategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FAQCategory_name_key`(`name`),
    UNIQUE INDEX `FAQCategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faqsection` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'Sıkça Sorulan Sorular',
    `paragraph` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `herosection` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` TEXT NOT NULL,
    `description` TEXT NULL,
    `buttonText` VARCHAR(191) NULL,
    `buttonUrl` VARCHAR(191) NULL,
    `image` LONGTEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobapplication` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `experience` VARCHAR(191) NOT NULL,
    `education` VARCHAR(191) NOT NULL,
    `coverLetter` TEXT NULL,
    `cvFileName` VARCHAR(191) NULL,
    `cvFileData` LONGTEXT NULL,
    `cvMimeType` VARCHAR(191) NULL,
    `status` ENUM('NEW', 'REVIEWING', 'INTERVIEWED', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'NEW',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `legaldocument` (
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
CREATE TABLE `message` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Message_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pricingfeature` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `isIncluded` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `PricingFeature_planId_fkey`(`planId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pricingplan` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` VARCHAR(191) NOT NULL,
    `period` VARCHAR(191) NOT NULL DEFAULT 'ay',
    `description` TEXT NULL,
    `isPopular` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT 'from-blue-500 to-blue-600',
    `icon` VARCHAR(191) NOT NULL DEFAULT 'Star',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pricingsection` (
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
CREATE TABLE `quoterequest` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NOT NULL,
    `serviceType` VARCHAR(191) NOT NULL,
    `message` TEXT NULL,
    `status` ENUM('NEW', 'PENDING', 'REVIEWED', 'CONTACTED', 'COMPLETED') NOT NULL DEFAULT 'NEW',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reminder` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service` (
    `id` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL DEFAULT 'FileText',
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `features` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT 'from-blue-500 to-blue-600',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicessection` (
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
CREATE TABLE `servicevalue` (
    `id` VARCHAR(191) NOT NULL,
    `sectionId` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `ServiceValue_sectionId_fkey`(`sectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    INDEX `Session_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(191) NULL,
    `taxNumber` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `smtpHost` VARCHAR(191) NULL,
    `smtpPort` INTEGER NULL,
    `smtpUser` VARCHAR(191) NULL,
    `smtpPass` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sitesettings` (
    `id` VARCHAR(191) NOT NULL,
    `siteName` VARCHAR(191) NOT NULL DEFAULT 'SMMM Ofisi',
    `siteDescription` TEXT NULL,
    `favicon` LONGTEXT NULL,
    `brandIcon` LONGTEXT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `mapLatitude` VARCHAR(191) NULL,
    `mapLongitude` VARCHAR(191) NULL,
    `mapEmbedUrl` TEXT NULL,
    `facebookUrl` VARCHAR(191) NULL,
    `linkedinUrl` VARCHAR(191) NULL,
    `instagramUrl` VARCHAR(191) NULL,
    `youtubeUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `threadsUrl` VARCHAR(191) NULL,
    `xUrl` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptionaccrual` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `accountingPeriodId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'TRY',
    `description` VARCHAR(191) NOT NULL DEFAULT 'Aidat Tahakkuku',
    `dueDate` DATETIME(3) NOT NULL,
    `isPaid` BOOLEAN NOT NULL DEFAULT false,
    `paymentDate` DATETIME(3) NULL,
    `carryForwardAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `carryForwardToPeriodId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SubscriptionAccrual_accountingPeriodId_idx`(`accountingPeriodId`),
    INDEX `SubscriptionAccrual_carryForwardToPeriodId_idx`(`carryForwardToPeriodId`),
    INDEX `SubscriptionAccrual_customerId_idx`(`customerId`),
    INDEX `SubscriptionAccrual_dueDate_idx`(`dueDate`),
    INDEX `SubscriptionAccrual_isPaid_idx`(`isPaid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taxreturn` (
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
    INDEX `TaxReturn_dueDate_idx`(`dueDate`),
    INDEX `TaxReturn_period_idx`(`period`),
    INDEX `TaxReturn_year_month_idx`(`year`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teammember` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `bio` TEXT NULL,
    `avatar` LONGTEXT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `linkedinUrl` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT 'from-blue-500 to-blue-600',
    `facebookUrl` VARCHAR(191) NULL,
    `initials` VARCHAR(191) NOT NULL DEFAULT '??',
    `instagramUrl` VARCHAR(191) NULL,
    `threadsUrl` VARCHAR(191) NULL,
    `xUrl` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teamsection` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'Uzman Ekibimiz',
    `paragraph` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `testimonial` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `avatar` LONGTEXT NULL,
    `rating` INTEGER NOT NULL DEFAULT 5,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT 'from-blue-500 to-blue-600',
    `initials` VARCHAR(191) NOT NULL DEFAULT '??',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `testimonialssection` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'İstemcilerimiz Ne Diyor?',
    `paragraph` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` DATETIME(3) NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'CLIENT') NOT NULL DEFAULT 'CLIENT',
    `image` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verificationtoken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflowsection` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'Çalışma Sürecimiz',
    `paragraph` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflowstep` (
    `id` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL DEFAULT 'Phone',
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT 'from-blue-500 to-blue-600',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `number` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxOffice` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NULL,
    `district` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TaxOffice_name_key`(`name`),
    INDEX `TaxOffice_name_idx`(`name`),
    INDEX `TaxOffice_city_idx`(`city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `institutions_section_items` ADD CONSTRAINT `institutions_section_items_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `institutions_section`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aboutfeature` ADD CONSTRAINT `AboutFeature_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `aboutsection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accountingperiod` ADD CONSTRAINT `AccountingPeriod_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `announcementclient` ADD CONSTRAINT `AnnouncementClient_announcementId_fkey` FOREIGN KEY (`announcementId`) REFERENCES `announcement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `announcementclient` ADD CONSTRAINT `AnnouncementClient_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `client` ADD CONSTRAINT `Client_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collection` ADD CONSTRAINT `Collection_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer` ADD CONSTRAINT `customer_taxOfficeId_fkey` FOREIGN KEY (`taxOfficeId`) REFERENCES `TaxOffice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customerdeclarationsetting` ADD CONSTRAINT `CustomerDeclarationSetting_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faq` ADD CONSTRAINT `FAQ_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `faqcategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `Message_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pricingfeature` ADD CONSTRAINT `PricingFeature_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `pricingplan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicevalue` ADD CONSTRAINT `ServiceValue_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `servicessection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptionaccrual` ADD CONSTRAINT `subscriptionaccrual_accountingPeriodId_fkey` FOREIGN KEY (`accountingPeriodId`) REFERENCES `accountingperiod`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptionaccrual` ADD CONSTRAINT `subscriptionaccrual_carryForwardToPeriodId_fkey` FOREIGN KEY (`carryForwardToPeriodId`) REFERENCES `accountingperiod`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptionaccrual` ADD CONSTRAINT `SubscriptionAccrual_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `taxreturn` ADD CONSTRAINT `TaxReturn_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
