/* community edition */
DROP TABLE IF EXISTS `userevent`;

CREATE TABLE IF NOT EXISTS `userevent` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`userid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`eventtype` VARCHAR(100) NOT NULL DEFAULT '',
	`ip` VARCHAR(39) NOT NULL COLLATE utf8_bin DEFAULT '',
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_id PRIMARY KEY (id),
	INDEX `idx_userevent_orgid` (`orgid` ASC),
	INDEX `idx_userevent_userid` (`userid` ASC),
	INDEX `idx_userevent_eventtype` (`eventtype` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE =  InnoDB;
