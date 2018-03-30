/* enterprise edition */

-- content analytics
ALTER TABLE useractivity ADD COLUMN `metadata` VARCHAR(1000) NOT NULL DEFAULT '' AFTER `activitytype`;

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
-- ENGINE = MyISAM;

-- CREATE INDEX idx_vote_1 ON vaote(orgid,documentid);

-- deprecations
