-- Disable foreign key checks to prevent issues during import
SET FOREIGN_KEY_CHECKS = 0;

-- Start transaction
START TRANSACTION;

-- Create prisma_migrations table
CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `checksum` VARCHAR(255) NOT NULL,
    `finished_at` DATETIME,
    `migration_name` VARCHAR(255) NOT NULL,
    `logs` TEXT,
    `rolled_back_at` DATETIME,
    `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `applied_steps_count` INT UNSIGNED NOT NULL DEFAULT 0
);
INSERT INTO `_prisma_migrations` VALUES
('75b08cee-e9de-484e-afe1-121704a58d90','9ad32322a8833453cd94fadae7a08a78360dada236ba20fd187d60179b9bb810','2024-12-31 08:47:35','20241231084735_init',NULL,NULL,'2024-12-31 08:47:33',1);

-- Create Category table
CREATE TABLE IF NOT EXISTS `Category` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `imagePath` TEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL
);
INSERT INTO `Category` VALUES
('93bd8058-6bbe-4f02-9822-0cdab1e830a1','electronics','electronics','new gadgets','/categories/electronics-1735635912937.jpg','2024-12-31 10:31:52','2024-12-31 10:31:52');

-- Create Product table
CREATE TABLE IF NOT EXISTS `Product` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `price` INT NOT NULL,
    `imagePath` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `categoryId` VARCHAR(255) NOT NULL,
    `isAvailableForPurchase` BOOLEAN NOT NULL DEFAULT TRUE,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,
    CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO `Product` VALUES
('fedabfd9-a7df-49e6-babc-381681d16da7','Airfryer',12000,'/products/86f89f02-d395-4366-aff2-7ae65f33db56-electronics-1735500385343.jpg','fry oil free','93bd8058-6bbe-4f02-9822-0cdab1e830a1',1,'2024-12-31 10:32:15','2024-12-31 10:32:15');

-- Create User table
CREATE TABLE IF NOT EXISTS `User` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL
);
INSERT INTO `User` VALUES
('d156859b-107d-46d6-a517-d29817bc604e','9860768434@example.com','2024-12-31 10:32:41','2024-12-31 10:32:41');

-- Create Order table
CREATE TABLE IF NOT EXISTS `Order` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `price` INT NOT NULL,
    `shippingDetails` TEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,
    `status` VARCHAR(255) NOT NULL DEFAULT 'pending',
    `userId` VARCHAR(255) NOT NULL,
    `productId` VARCHAR(255) NOT NULL,
    CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `Order_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO `Order` VALUES
('7855261c-1fbf-4f6d-afcc-88aa93600dd6',12000,'{"fullName":"swornim","phoneNumber":"9860768434","province":"Madhesh","city":"Kathmandu","streetAddress":"samakhushi","quantity":1}','2024-12-31 10:33:41','2024-12-31 10:33:41','pending','d156859b-107d-46d6-a517-d29817bc604e','fedabfd9-a7df-49e6-babc-381681d16da7');

-- Create DownloadVerification table
CREATE TABLE IF NOT EXISTS `DownloadVerification` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `expiresAt` DATETIME NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `productId` VARCHAR(255) NOT NULL,
    CONSTRAINT `DownloadVerification_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Cart table
CREATE TABLE IF NOT EXISTS `Cart` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL
);
INSERT INTO `Cart` VALUES
('5ee3ebb4-b8a3-4e60-b7f9-879a032ab3a0','2024-12-31 10:33:50','2024-12-31 10:33:50');

-- Create CartItem table
CREATE TABLE IF NOT EXISTS `CartItem` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `quantity` INT NOT NULL,
    `cartId` VARCHAR(255) NOT NULL,
    `productId` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,
    CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO `CartItem` VALUES
('8378744b-d11a-48af-b897-69437473821c',1,'5ee3ebb4-b8a3-4e60-b7f9-879a032ab3a0','fedabfd9-a7df-49e6-babc-381681d16da7','2024-12-31 10:34:07','2024-12-31 10:34:07');

-- Add unique constraints
CREATE UNIQUE INDEX `Category_name_key` ON `Category`(`name`);
CREATE UNIQUE INDEX `Category_slug_key` ON `Category`(`slug`);
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);

-- Commit transaction
COMMIT;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
