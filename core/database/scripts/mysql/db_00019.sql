/* enterprise edition */

-- document lifecycle and versioning
ALTER TABLE document ADD COLUMN `lifecycle` INT NOT NULL DEFAULT 1 AFTER `approval`;
ALTER TABLE document ADD COLUMN `versioned` INT NOT NULL DEFAULT 0 AFTER `lifecycle`;
ALTER TABLE document ADD COLUMN `versionid` VARCHAR(100) DEFAULT '' NOT NULL AFTER `versioned`;
ALTER TABLE document ADD COLUMN `versionorder` INT NOT NULL DEFAULT 0 AFTER `versionid`;
ALTER TABLE document ADD COLUMN `groupid` CHAR(16) NOT NULL COLLATE utf8_bin AFTER `versionorder`;

-- grant doc-lifecycle permission
INSERT INTO permission(orgid, who, whoid, action, scope, location, refid, created)
	SELECT orgid, who, whoid, 'doc-lifecycle' AS action, scope, location, refid, created
    FROM permission
    WHERE action = 'doc-edit' OR action = 'doc-approve';

-- grant doc-versions permission
INSERT INTO permission(orgid, who, whoid, action, scope, location, refid, created)
	SELECT orgid, who, whoid, 'doc-version' AS action, scope, location, refid, created
    FROM permission
    WHERE action = 'doc-edit' OR action = 'doc-approve';

-- implement document section name search indexing
INSERT INTO search (orgid, documentid, itemid, itemtype, content)
	SELECT orgid, documentid, refid as itemid, "page" as itemtype, title as content
    FROM page WHERE status=0;

-- whats new support
ALTER TABLE user ADD COLUMN `lastversion` CHAR(16) NOT NULL DEFAULT '' AFTER `active`;

-- deprecations
