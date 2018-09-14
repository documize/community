/* community edition */
DROP TABLE IF EXISTS `useractivity`;

CREATE TABLE IF NOT EXISTS `useractivity` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`userid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`labelid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`sourceid` CHAR(16) NOT NULL COLLATE utf8_bin,
   	`sourcetype` INT NOT NULL DEFAULT 0,
	`activitytype` INT NOT NULL DEFAULT 0,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_id PRIMARY KEY (id),
	INDEX `idx_activity_orgid` (`orgid` ASC),
	INDEX `idx_activity_userid` (`userid` ASC),
	INDEX `idx_activity_sourceid` (`sourceid` ASC),
	INDEX `idx_activity_activitytype` (`activitytype` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE =  InnoDB;
/* Note:
 *  - this table replaces the soon-to-be-deprecated audit log table
 *  - we migrate existing data where there is a migration path */

INSERT INTO useractivity (orgid, userid, labelid, sourceid, sourcetype, activitytype, created)
 	SELECT a.orgid, a.userid, labelid, a.documentid as sourceid, 2 as sourcetype, 1 as activitytype, a.created
 	FROM audit a, document d
 	WHERE action='add-document' AND d.refid=a.documentid;

INSERT INTO useractivity (orgid, userid, labelid, sourceid, sourcetype, activitytype, created)
	SELECT a.orgid, a.userid, labelid, a.documentid as sourceid, 2 as sourcetype, 1 as activitytype, a.created
	FROM audit a, document d
	WHERE action='add-page' AND d.refid=a.documentid;

INSERT INTO useractivity (orgid, userid, labelid, sourceid, sourcetype, activitytype, created)
	SELECT a.orgid, a.userid, labelid, a.documentid as sourceid, 2 as sourcetype, 2 as activitytype, a.created
	FROM audit a, document d
	WHERE action='get-document' AND d.refid=a.documentid;

INSERT INTO useractivity (orgid, userid, labelid, sourceid, sourcetype, activitytype, created)
	SELECT a.orgid, a.userid, labelid, a.documentid as sourceid, 2 as sourcetype, 3 as activitytype, a.created
	FROM audit a, document d
	WHERE action='update-page' AND d.refid=a.documentid;

INSERT INTO useractivity (orgid, userid, labelid, sourceid, sourcetype, activitytype, created)
	SELECT a.orgid, a.userid, labelid, a.documentid as sourceid, 2 as sourcetype, 3 as activitytype, a.created
	FROM audit a, document d
	WHERE action='re-sequence-page' AND d.refid=a.documentid;

INSERT INTO useractivity (orgid, userid, labelid, sourceid, sourcetype, activitytype, created)
	SELECT a.orgid, a.userid, labelid, a.documentid as sourceid, 2 as sourcetype, 3 as activitytype, a.created
	FROM audit a, document d
	WHERE action='re-level-page' AND d.refid=a.documentid;

INSERT INTO useractivity (orgid, userid, labelid, sourceid, sourcetype, activitytype, created)
	SELECT a.orgid, a.userid, labelid, a.documentid as sourceid, 2 as sourcetype, 4 as activitytype, a.created
	FROM audit a, document d
	WHERE action='delete-document' AND d.refid=a.documentid;

INSERT INTO useractivity (orgid, userid, labelid, sourceid, sourcetype, activitytype, created)
	SELECT a.orgid, a.userid, labelid, a.documentid as sourceid, 2 as sourcetype, 4 as activitytype, a.created
	FROM audit a, document d
	WHERE action='remove-page' AND d.refid=a.documentid;

/* enterprise edition */
DROP TABLE IF EXISTS `useraction`;

CREATE TABLE IF NOT EXISTS `useraction` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`userid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`documentid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`requestorid` CHAR(16) NOT NULL COLLATE utf8_bin,
   	`actiontype` INT NOT NULL DEFAULT 0,
	`note` NVARCHAR(2000) NOT NULL DEFAULT '',
	`requested` TIMESTAMP NULL,
	`due` TIMESTAMP NULL,
	`completed` TIMESTAMP NULL,
	`iscomplete` BOOL NOT NULL DEFAULT 0,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_id PRIMARY KEY (id),
	INDEX `idx_useraction_refid` (`refid` ASC),
	INDEX `idx_useraction_userid` (`userid` ASC),
	INDEX `idx_useraction_documentid` (`documentid` ASC),
	INDEX `idx_useraction_requestorid` (`requestorid` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE =  InnoDB;

/* community edition */
ALTER TABLE account ADD COLUMN `active` BOOL NOT NULL DEFAULT 1 AFTER `admin`;
