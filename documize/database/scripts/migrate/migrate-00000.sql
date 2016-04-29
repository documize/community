ALTER TABLE page ADD `userid` CHAR(16) DEFAULT '' COLLATE utf8_bin AFTER documentid;
ALTER TABLE revision ADD `rawbody` LONGBLOB AFTER body;
ALTER TABLE revision ADD `config` JSON AFTER rawbody;
ALTER TABLE revision ADD `ownerid` CHAR(16) DEFAULT '' COLLATE utf8_bin AFTER documentid;

DROP TABLE IF EXISTS `pagemeta`;

CREATE TABLE IF NOT EXISTS `pagemeta` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`pageid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`documentid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`rawbody` LONGBLOB,
	`config` JSON,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_pageid PRIMARY KEY (pageid),
	UNIQUE INDEX `idx_pagemeta_id` (`id` ASC),
	INDEX `idx_pagemeta_pageid` (`pageid` ASC),
	INDEX `idx_pagemeta_orgid` (`orgid` ASC),
	INDEX `idx_pagemeta_documentid` (`documentid` ASC))
DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci
ENGINE =  InnoDB;

INSERT INTO pagemeta (pageid,orgid,documentid,rawbody)
	SELECT refid as pageid,orgid,documentid,body FROM page;

