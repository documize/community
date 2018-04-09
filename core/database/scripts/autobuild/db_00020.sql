/* enterprise edition */

-- consistency of table engines
ALTER TABLE config ENGINE = InnoDB;
ALTER TABLE permission ENGINE = InnoDB;
ALTER TABLE category ENGINE = InnoDB;
ALTER TABLE categorymember ENGINE = InnoDB;
ALTER TABLE role ENGINE = InnoDB;
ALTER TABLE rolemember ENGINE = InnoDB;

-- content analytics
ALTER TABLE useractivity ADD COLUMN `metadata` VARCHAR(1000) NOT NULL DEFAULT '' AFTER `activitytype`;

-- new role for viewing content analytics
ALTER TABLE account ADD COLUMN `analytics` BOOL NOT NULL DEFAULT 0 AFTER `users`;
UPDATE account SET analytics=1 WHERE admin=1;

-- content likes/feedback
-- DROP TABLE IF EXISTS `vote`;

-- CREATE TABLE IF NOT EXISTS `vote` (
-- 	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
-- 	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
-- 	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
-- 	`documentid` CHAR(16) NOT NULL COLLATE utf8_bin,
-- 	`userid` CHAR(16) NOT NULL DEFAULT '' COLLATE utf8_bin,
-- 	`vote` INT NOT NULL DEFAULT 0,
-- 	`comment` VARCHAR(300) NOT NULL DEFAULT '',
-- 	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
-- 	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
-- 	UNIQUE INDEX `idx_vote_id` (`id` ASC),
-- 	INDEX `idx_vote_refid` (`refid` ASC),
-- 	INDEX `idx_vote_documentid` (`documentid` ASC),
-- 	INDEX `idx_vote_orgid` (`orgid` ASC))
-- DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
-- ENGINE = InnoDB;

-- CREATE INDEX idx_vote_1 ON vote(orgid,documentid);

-- deprecations
