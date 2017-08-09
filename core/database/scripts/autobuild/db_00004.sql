/* community edition */
DROP TABLE IF EXISTS `link`;

CREATE TABLE IF NOT EXISTS `link` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`folderid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`userid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`sourcedocumentid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`sourcepageid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`linktype` CHAR(16) NOT NULL COLLATE utf8_bin,
	`targetdocumentid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`targetid` CHAR(16) NOT NULL DEFAULT '' COLLATE utf8_bin,
	`orphan` BOOL NOT NULL DEFAULT 0,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_id PRIMARY KEY (id))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE =  InnoDB;
