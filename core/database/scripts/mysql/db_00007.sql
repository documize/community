/* community edition */
ALTER TABLE document ADD COLUMN `layout` CHAR(10) NOT NULL DEFAULT 'doc' AFTER `template`;
