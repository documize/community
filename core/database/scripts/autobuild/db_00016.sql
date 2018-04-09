/* community edition */

-- permission records space and document level privelges, making existing labelrole table obsolete
-- who column can be user or role
-- whoid column contains eitehr user or role ID
-- action column records permission type (view, edit, delete...)
-- scope column details if action applies to object or table
-- location column details name of table
-- refid column details ID of item that the action applies to (only if scope=object)
DROP TABLE IF EXISTS `permission`;

CREATE TABLE IF NOT EXISTS `permission` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`who` VARCHAR(30) NOT NULL,
	`whoid` CHAR(16) DEFAULT '' NOT NULL COLLATE utf8_bin,
	`action` VARCHAR(30) NOT NULL,
	`scope` VARCHAR(30) NOT NULL,
	`location` VARCHAR(100) NOT NULL,
	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE INDEX `idx_permission_id` (`id` ASC),
	INDEX `idx_permission_orgid` (`orgid` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
ENGINE = InnoDB;

CREATE INDEX idx_permission_1 ON permission(orgid,who,whoid,location);
CREATE INDEX idx_permission_2 ON permission(orgid,who,whoid,location,action);
CREATE INDEX idx_permission_3 ON permission(orgid,location,refid);
CREATE INDEX idx_permission_4 ON permission(orgid,who,location,action);

-- category represents "folder/label/category" assignment to document (1:M)
DROP TABLE IF EXISTS `category`;

CREATE TABLE IF NOT EXISTS `category` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`labelid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`category` VARCHAR(30) NOT NULL,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE INDEX `idx_category_id` (`id` ASC),
	INDEX `idx_category_refid` (`refid` ASC),
	INDEX `idx_category_orgid` (`orgid` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
ENGINE = InnoDB;

CREATE INDEX idx_category_1 ON category(orgid,labelid);

-- category member records who can see a category and the documents within
DROP TABLE IF EXISTS `categorymember`;

CREATE TABLE IF NOT EXISTS `categorymember` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`labelid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`categoryid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`documentid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE INDEX `idx_categorymember_id` (`id` ASC),
	INDEX `idx_category_documentid` (`documentid`))
    DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
ENGINE = InnoDB;

CREATE INDEX idx_categorymember_1 ON categorymember(orgid,documentid);
CREATE INDEX idx_categorymember_2 ON categorymember(orgid,labelid);

-- rolee represent user groups
DROP TABLE IF EXISTS `role`;

CREATE TABLE IF NOT EXISTS `role` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`role` VARCHAR(30) NOT NULL,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE INDEX `idx_category_id` (`id` ASC),
	INDEX `idx_category_refid` (`refid` ASC),
	INDEX `idx_category_orgid` (`orgid` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
ENGINE = InnoDB;

-- role member records user role membership
DROP TABLE IF EXISTS `rolemember`;

CREATE TABLE IF NOT EXISTS `rolemember` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`roleid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`userid` CHAR(16) NOT NULL COLLATE utf8_bin,
	UNIQUE INDEX `idx_category_id` (`id` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
ENGINE = InnoDB;

CREATE INDEX idx_rolemember_1 ON rolemember(roleid,userid);
CREATE INDEX idx_rolemember_2 ON rolemember(orgid,roleid,userid);

-- user account can have global permssion to state if user can see all other users
-- provides granular control for external users
ALTER TABLE account ADD COLUMN `users` BOOL NOT NULL DEFAULT 1 AFTER `admin`;

-- migrate space/document permissions

-- space own
INSERT INTO permission (orgid, who, whoid, `action`, scope, location, refid)
	SELECT orgid, 'user' as who, userid as whois, 'own' as `action`, 'object' as scope, 'space' as location, refid
	FROM label;

-- space manage (same as owner)
INSERT INTO permission (orgid, who, whoid, `action`, scope, location, refid)
	SELECT orgid, 'user' as who, userid as whois, 'manage' as `action`, 'object' as scope, 'space' as location, refid
	FROM label;

-- view space
INSERT INTO permission (orgid, who, whoid, `action`, scope, location, refid)
	SELECT orgid, 'user' as who, userid as whois, 'view' as `action`, 'object' as scope, 'space' as location, labelid as refid
	FROM labelrole WHERE canview=1;

-- edit space => add/edit/delete/move/copy/template documents
INSERT INTO permission (orgid, who, whoid, `action`, scope, location, refid)
	SELECT orgid, 'user' as who, userid as whois, 'doc-add' as `action`, 'object' as scope, 'space' as location, labelid as refid
	FROM labelrole WHERE canedit=1;
INSERT INTO permission (orgid, who, whoid, `action`, scope, location, refid)
	SELECT orgid, 'user' as who, userid as whois, 'doc-edit' as `action`, 'object' as scope, 'space' as location, labelid as refid
	FROM labelrole WHERE canedit=1;
INSERT INTO permission (orgid, who, whoid, `action`, scope, location, refid)
	SELECT orgid, 'user' as who, userid as whois, 'doc-delete' as `action`, 'object' as scope, 'space' as location, labelid as refid
	FROM labelrole WHERE canedit=1;
INSERT INTO permission (orgid, who, whoid, `action`, scope, location, refid)
	SELECT orgid, 'user' as who, userid as whois, 'doc-move' as `action`, 'object' as scope, 'space' as location, labelid as refid
	FROM labelrole WHERE canedit=1;
INSERT INTO permission (orgid, who, whoid, `action`, scope, location, refid)
	SELECT orgid, 'user' as who, userid as whois, 'doc-copy' as `action`, 'object' as scope, 'space' as location, labelid as refid
	FROM labelrole WHERE canedit=1;
INSERT INTO permission (orgid, who, whoid, `action`, scope, location, refid)
	SELECT orgid, 'user' as who, userid as whois, 'doc-template' as `action`, 'object' as scope, 'space' as location, labelid as refid
	FROM labelrole WHERE canedit=1;

-- everyone users ID changed to 0
UPDATE permission SET whoid='0' WHERE whoid='';
