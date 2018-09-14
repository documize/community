-- SQL to set up the Documize database

DROP TABLE IF EXISTS `user`;

CREATE TABLE IF NOT EXISTS `user` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`firstname` VARCHAR(500) NOT NULL,
	`lastname` VARCHAR(500) NOT NULL,
	`email` VARCHAR(250) NOT NULL UNIQUE,
	`initials` VARCHAR(10) NOT NULL DEFAULT "",
	`password` VARCHAR(500) NOT NULL DEFAULT "",
	`salt` VARCHAR(100) NOT NULL DEFAULT "",
	`reset` VARCHAR(100) NOT NULL DEFAULT "",
	`active` BOOL NOT NULL DEFAULT 1,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_refid PRIMARY KEY (refid),
	UNIQUE INDEX `idx_user_id` (`id` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE = InnoDB;

DROP TABLE IF EXISTS `audit`;

CREATE TABLE IF NOT EXISTS `audit` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`userid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`documentid` CHAR(16) NOT NULL DEFAULT "" COLLATE utf8_bin,
	`pageid` CHAR(16) NOT NULL DEFAULT "" COLLATE utf8_bin,
	`action` VARCHAR(200) NOT NULL DEFAULT "",
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE INDEX `idx_audit_id` (`id` ASC),
	INDEX `idx_orgid_url` (`orgid`))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE = InnoDB;

DROP TABLE IF EXISTS `organization`;

CREATE TABLE IF NOT EXISTS `organization` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`company` VARCHAR(500) NOT NULL,
	`title` VARCHAR(500) NOT NULL,
	`message` VARCHAR(500) NOT NULL,
	`url` VARCHAR(200) NOT NULL DEFAULT "",
	`domain` VARCHAR(200) NOT NULL DEFAULT "",
	`email` VARCHAR(500) NOT NULL DEFAULT "",
	`allowanonymousaccess` BOOL NOT NULL DEFAULT 0,
	`verified` BOOL NOT NULL DEFAULT 0,
	`serial` VARCHAR(50) NOT NULL DEFAULT "",
	`active` BOOL NOT NULL DEFAULT 1,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_refid PRIMARY KEY (refid),
	UNIQUE INDEX `idx_organization_id` (`id` ASC),
	INDEX `idx_organization_url` (`url`),
	INDEX `idx_organization_domain` (`domain`))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE = InnoDB;

DROP TABLE IF EXISTS `account`;

CREATE TABLE IF NOT EXISTS `account` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`userid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`editor` BOOL NOT NULL DEFAULT 0,
	`admin` BOOL NOT NULL DEFAULT 0,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_refid PRIMARY KEY (refid),
	UNIQUE INDEX `idx_account_id` (`id` ASC),
	INDEX `idx_account_userid` (`userid` ASC),
	INDEX `idx_account_orgid` (`orgid` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE = InnoDB;

DROP TABLE IF EXISTS `label`;

CREATE TABLE IF NOT EXISTS `label` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`label` VARCHAR(255) NOT NULL,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`userid` CHAR(16) NOT NULL DEFAULT "" COLLATE utf8_bin,
   	`type` INT NOT NULL DEFAULT 1,
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_refid PRIMARY KEY (refid),
	UNIQUE INDEX `idx_label_id` (`id` ASC),
	INDEX `idx_label_userid` (`userid` ASC),
	INDEX `idx_label_orgid` (`orgid` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE = InnoDB;

DROP TABLE IF EXISTS `labelrole`;

CREATE TABLE IF NOT EXISTS `labelrole` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`labelid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`userid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`canview` BOOL NOT NULL DEFAULT 0,
	`canedit` BOOL NOT NULL DEFAULT 0,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_refid PRIMARY KEY (refid),
	UNIQUE INDEX `idx_labelrole_id` (`id` ASC),
	INDEX `idx_labelrole_userid` (`userid` ASC),
    INDEX `idx_labelrole_labelid` (`labelid` ASC),
	INDEX `idx_labelrole_orgid` (`orgid` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE = InnoDB;

DROP TABLE IF EXISTS `document`;

CREATE TABLE IF NOT EXISTS `document` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`labelid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`userid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`job` CHAR(36) NOT NULL,
	`location` VARCHAR(2000) NOT NULL,
	`title` VARCHAR(2000) NOT NULL,
	`excerpt` VARCHAR(2000) NOT NULL,
	`slug` VARCHAR(2000) NOT NULL,
	`tags` VARCHAR(1000) NOT NULL DEFAULT '',
	`template` BOOL NOT NULL DEFAULT 0,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_refid PRIMARY KEY (refid),
	UNIQUE INDEX `idx_document_id` (`id` ASC),
	INDEX `idx_document_orgid` (`orgid` ASC),
	INDEX `idx_document_labelid` (`labelid` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE = InnoDB;

DROP TABLE IF EXISTS `page`;

CREATE TABLE IF NOT EXISTS `page` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`documentid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`userid` CHAR(16) DEFAULT '' COLLATE utf8_bin,
	`contenttype` CHAR(20) NOT NULL DEFAULT 'wysiwyg',
	`level` INT UNSIGNED NOT NULL,
	`sequence` DOUBLE NOT NULL,
	`title` VARCHAR(2000) NOT NULL,
	`body` LONGTEXT,
	`revisions` INT UNSIGNED NOT NULL,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_refid PRIMARY KEY (refid),
	UNIQUE INDEX `idx_page_id` (`id` ASC),
	INDEX `idx_page_orgid` (`orgid` ASC),
	INDEX `idx_page_documentid` (`documentid` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE =  InnoDB;

DROP TABLE IF EXISTS `pagemeta`;

CREATE TABLE IF NOT EXISTS `pagemeta` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`pageid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`userid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`documentid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`rawbody` LONGBLOB,
	`config` JSON,
    `externalsource` BOOL DEFAULT 0,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_pageid PRIMARY KEY (pageid),
	UNIQUE INDEX `idx_pagemeta_id` (`id` ASC),
	INDEX `idx_pagemeta_pageid` (`pageid` ASC),
	INDEX `idx_pagemeta_orgid` (`orgid` ASC),
	INDEX `idx_pagemeta_documentid` (`documentid` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE =  InnoDB;

DROP TABLE IF EXISTS `attachment`;

CREATE TABLE IF NOT EXISTS `attachment` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`documentid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`job` CHAR(36) NOT NULL,
	`fileid` CHAR(10) NOT NULL,
	`filename` VARCHAR(255) NOT NULL,
	`data` LONGBLOB,
	`extension` CHAR(6) NOT NULL,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_refid PRIMARY KEY (refid),
	UNIQUE INDEX `idx_attachment_id` (`id` ASC),
	INDEX `idx_attachment_orgid` (`orgid` ASC),
	INDEX `idx_attachment_documentid` (`documentid` ASC),
	INDEX `idx_attachment_job_and_fileid` (`job`,`fileid` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE =  InnoDB;

DROP TABLE IF EXISTS `search`;

CREATE TABLE IF NOT EXISTS `search` (
	`id` CHAR(16) NOT NULL COLLATE utf8_bin,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`documentid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`level` INT UNSIGNED NOT NULL,
	`sequence` DOUBLE NOT NULL,
	`documenttitle` VARCHAR(2000) NOT NULL,
	`pagetitle` VARCHAR(2000) NOT NULL,
	`slug` VARCHAR(2000) NOT NULL,
	`body` LONGTEXT,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE INDEX `idx_search_id` (`id` ASC),
	INDEX `idx_search_orgid` (`orgid` ASC),
	INDEX `idx_search_documentid` (`documentid` ASC),
	INDEX `idx_search_sequence` (`sequence` ASC),
	FULLTEXT(`pagetitle`,`body`))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE = MyISAM;

-- FULLTEXT search requires MyISAM and NOT InnoDB

DROP TABLE IF EXISTS `revision`;

CREATE TABLE IF NOT EXISTS `revision` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`documentid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`ownerid` CHAR(16) DEFAULT '' COLLATE utf8_bin,
	`pageid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`userid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`contenttype` CHAR(20) NOT NULL DEFAULT 'wysiwyg',
	`title` VARCHAR(2000) NOT NULL,
	`body` LONGTEXT,
	`rawbody` LONGBLOB,
	`config` JSON,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_refid PRIMARY KEY (refid),
	UNIQUE INDEX `idx_revision_id` (`id` ASC),
	INDEX `idx_revision_orgid` (`orgid` ASC),
	INDEX `idx_revision_documentid` (`documentid` ASC),
	INDEX `idx_revision_pageid` (`pageid` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE = InnoDB;

DROP TABLE IF EXISTS `config`;

CREATE TABLE IF NOT EXISTS `config` (
	`key` CHAR(255) NOT NULL,
	`config` JSON,
	UNIQUE INDEX `idx_config_area` (`key` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE = InnoDB;

INSERT INTO `config` VALUES ('SMTP','{\"userid\": \"\",\"password\": \"\",\"host\": \"\",\"port\": \"\",\"sender\": \"\"}');
INSERT INTO `config` VALUES ('FILEPLUGINS',
'[{\"Comment\": \"Disable (or not) built-in html import (NOTE: no Plugin name)\",\"Disabled\": false,\"API\": \"Convert\",\"Actions\": [\"htm\",\"html\"]},{\"Comment\": \"Disable (or not) built-in Documize API import used from SDK (NOTE: no Plugin name)\",\"Disabled\": false,\"API\": \"Convert\",\"Actions\": [\"documizeapi\"]}]');
INSERT INTO `config` VALUES ('META','{\"database\": \"db_00000.sql\"}');
INSERT INTO `config` VALUES ('SECTION-GITHUB', '{\"clientID\": \"\", \"clientSecret\": \"\", \"authorizationCallbackURL\": \"https://localhost:5001/api/public/validate?section=github\"}');
INSERT INTO `config` VALUES ('SECTION-TRELLO','{\"appKey\": \"\"}');

DROP TABLE IF EXISTS `userconfig`;

CREATE TABLE IF NOT EXISTS `userconfig` (
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`userid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`key` CHAR(255) NOT NULL,
	`config` JSON,
	UNIQUE INDEX `idx_userconfig_orguserkey` (`orgid`, `userid`, `key` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE = InnoDB;
