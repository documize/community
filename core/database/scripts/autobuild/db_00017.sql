/* enterprise edition */

-- document needs proection and approval columns
ALTER TABLE document ADD COLUMN `protection` INT NOT NULL DEFAULT 0 AFTER `template`;
ALTER TABLE document ADD COLUMN `approval` INT NOT NULL DEFAULT 0 AFTER `protection`;

-- page workflow status
ALTER TABLE page ADD COLUMN `status` INT NOT NULL DEFAULT 0 AFTER `revisions`;
-- links pending changes to another page
ALTER TABLE page ADD COLUMN `relativeid` CHAR(16) DEFAULT '' NOT NULL COLLATE utf8_bin AFTER `approval`;

-- useraction captures what is being actioned 
ALTER TABLE useraction ADD COLUMN `reftype` CHAR(1) DEFAULT 'D' NOT NULL COLLATE utf8_bin AFTER `iscomplete`;
ALTER TABLE useraction ADD COLUMN `reftypeid` CHAR(16) NOT NULL COLLATE utf8_bin AFTER `reftype`;

-- data migration clean up from previous releases
DROP TABLE IF EXISTS `audit`;
DROP TABLE IF EXISTS `search_old`;
ALTER TABLE document DROP COLUMN `layout`;
DELETE FROM categorymember WHERE documentid NOT IN (SELECT refid FROM document);
UPDATE page SET level=1 WHERE level=0;
