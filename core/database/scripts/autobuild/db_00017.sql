/* enterprise edition */

-- document needs proection and approval columns
ALTER TABLE document ADD COLUMN `protection` INT NOT NULL DEFAULT 0 AFTER `template`;
ALTER TABLE document ADD COLUMN `approval` INT NOT NULL DEFAULT 0 AFTER `protection`;

-- data migration clean up from previous releases
DROP TABLE IF EXISTS `audit`;
DROP TABLE IF EXISTS `search_old`;
ALTER TABLE document DROP COLUMN `layout`;
