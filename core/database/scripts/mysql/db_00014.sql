/* community edition */
ALTER TABLE organization ADD COLUMN `service` VARCHAR(100) NOT NULL DEFAULT '' AFTER `domain`;

