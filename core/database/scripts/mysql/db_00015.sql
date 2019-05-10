/* community edition */

ALTER TABLE account CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE attachment CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE block CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE config CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE document CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE feedback CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE label CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE labelrole CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE link CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE organization CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE page CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE pagemeta CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE participant CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE pin CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE revision CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE search CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE share CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE user CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE useraction CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE useractivity CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE userconfig CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE userevent CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

DROP TABLE IF EXISTS `search_old`;

RENAME TABLE search TO search_old;

DROP TABLE IF EXISTS `search`;

CREATE TABLE IF NOT EXISTS `search` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`documentid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`itemid` CHAR(16) NOT NULL DEFAULT '' COLLATE utf8_bin,
	`itemtype` VARCHAR(10) NOT NULL,
	`content` LONGTEXT,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE INDEX `idx_search_id` (`id` ASC),
	INDEX `idx_search_orgid` (`orgid` ASC),
	INDEX `idx_search_documentid` (`documentid` ASC),
	FULLTEXT INDEX `idx_search_content` (`content`))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
ENGINE = MyISAM;

-- migrate page content
INSERT INTO search (orgid, documentid, itemid, itemtype, content) SELECT orgid, documentid, id AS itemid, 'page' AS itemtype, TRIM(body) AS content FROM search_old;

-- index document title
INSERT INTO search (orgid, documentid, itemid, itemtype, content) SELECT orgid, refid AS documentid, '' AS itemid, 'doc' AS itemtype, TRIM(title) AS content FROM document;

-- index attachment name
INSERT INTO search (orgid, documentid, itemid, itemtype, content) SELECT orgid, documentid, refid AS itemid, 'file' AS itemtype, TRIM(filename) AS content FROM attachment;

-- insert tag 1
insert into search (orgid, documentid, itemid, itemtype, content) SELECT orgid, refid as documentid, '' as itemid, 'tag' as itemtype, TRIM(REPLACE(SUBSTRING_INDEX(tags, '#', 2), '#', '')) AS content FROM document WHERE tags != '';

-- insert tag 2
insert into search (orgid, documentid, itemid, itemtype, content) SELECT orgid, refid as documentid, '' as itemid, 'tag' as itemtype, IF((LENGTH(tags) - LENGTH(REPLACE(tags, '#', '')) - 1) > 1, SUBSTRING_INDEX(SUBSTRING_INDEX(tags, '#', 3), '#', -1), '') AS content FROM document WHERE LENGTH(tags) - LENGTH(REPLACE(tags, "#", "")) > 2;

-- insert tag 3
insert into search (orgid, documentid, itemid, itemtype, content) SELECT orgid, refid as documentid, '' as itemid, 'tag' as itemtype, IF((LENGTH(tags) - LENGTH(REPLACE(tags, '#', '')) - 1) > 2, SUBSTRING_INDEX(SUBSTRING_INDEX(tags, '#', 4), '#', -1), '') AS content FROM document WHERE LENGTH(tags) - LENGTH(REPLACE(tags, "#", "")) > 3;

