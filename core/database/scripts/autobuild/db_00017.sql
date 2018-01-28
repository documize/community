/* enterprise edition */

-- document needs proection and approval columns
ALTER TABLE document ADD COLUMN `protection` INT NOT NULL DEFAULT 0 AFTER `template`;
ALTER TABLE document ADD COLUMN `approval` INT NOT NULL DEFAULT 0 AFTER `protection`;

-- page workflow status
ALTER TABLE page ADD COLUMN `status` INT NOT NULL DEFAULT 0 AFTER `revisions`;

-- links pending changes to another page
ALTER TABLE page ADD COLUMN `relativeid` CHAR(16) DEFAULT '' NOT NULL COLLATE utf8_bin AFTER `status`;

-- useraction captures what is being actioned 
ALTER TABLE useraction ADD COLUMN `reftype` CHAR(1) DEFAULT 'D' NOT NULL COLLATE utf8_bin AFTER `iscomplete`;
ALTER TABLE useraction ADD COLUMN `reftypeid` CHAR(16) NOT NULL COLLATE utf8_bin AFTER `reftype`;

-- useractivity usage expansion
ALTER TABLE useractivity ADD COLUMN `documentid` CHAR(16) DEFAULT '' NOT NULL COLLATE utf8_bin AFTER `sourceid`;
ALTER TABLE useractivity ADD COLUMN `pageid` CHAR(16) DEFAULT '' NOT NULL COLLATE utf8_bin AFTER `documentid`;
UPDATE useractivity SET documentid=sourceid WHERE sourcetype=2;
ALTER TABLE useractivity DROP COLUMN `sourceid`;
CREATE INDEX idx_useractivity_1 ON useractivity(orgid,documentid,sourcetype);
CREATE INDEX idx_useractivity_2 ON useractivity(orgid,documentid,userid,sourcetype);

-- clean-up
DELETE FROM categorymember WHERE documentid NOT IN (SELECT refid FROM document);
UPDATE page SET level=1 WHERE level=0;

-- deprecations
DROP TABLE IF EXISTS `audit`;
DROP TABLE IF EXISTS `search_old`;
ALTER TABLE document DROP COLUMN `layout`;
