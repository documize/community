/* community edition */
DROP TABLE IF EXISTS `block`;

CREATE TABLE IF NOT EXISTS `block` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`labelid` CHAR(16) DEFAULT '' COLLATE utf8_bin,
	`userid` CHAR(16) DEFAULT '' COLLATE utf8_bin,
	`contenttype` CHAR(20) NOT NULL DEFAULT 'wysiwyg',
	`pagetype` CHAR(10) NOT NULL DEFAULT 'section',
	`title` VARCHAR(2000) NOT NULL,
	`body` LONGTEXT,
	`excerpt` VARCHAR(2000) NOT NULL,
	`used` INT UNSIGNED NOT NULL,
	`rawbody` LONGBLOB,
	`config` JSON,
    `externalsource` BOOL DEFAULT 0,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_id PRIMARY KEY (id),
	INDEX `idx_block_refid` (`refid` ASC),
	INDEX `idx_block_labelid` (`labelid` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE =  InnoDB;

ALTER TABLE page ADD COLUMN `blockid` CHAR(16) NOT NULL DEFAULT '' COLLATE utf8_bin AFTER `pagetype`;
/* Note: version history table does not need blockid field as they are populated once during page creation:
  - you cannot mark an existing section as a preset
  - a page is only marked as preset during it's creation (e.g. created from an existing preset)
 */
