-- DropIndex
DROP INDEX `ActivityCode_name_idx` ON `activitycode`;

-- AlterTable
ALTER TABLE `activitycode` MODIFY `name` TEXT NOT NULL;

-- CreateIndex
CREATE INDEX `ActivityCode_name_idx` ON `activitycode`(`name`(191));
