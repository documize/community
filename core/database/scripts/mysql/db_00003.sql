/* community edition */
ALTER TABLE user ADD COLUMN `global` BOOL NOT NULL DEFAULT 0 AFTER `initials`;
