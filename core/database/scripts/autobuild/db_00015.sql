/* community edition */

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

