/* community edition */
ALTER TABLE page ADD COLUMN `pagetype` CHAR(10) NOT NULL DEFAULT 'section' AFTER `contenttype`;
-- UPDATE page SET pagetype='tab', sequence=0 WHERE refid IN (SELECT pageid FROM pagemeta WHERE externalsource=1);

ALTER TABLE revision ADD COLUMN `pagetype` CHAR(10) NOT NULL DEFAULT 'section' AFTER `contenttype`;
UPDATE revision SET pagetype='tab' WHERE pageid IN (SELECT pageid FROM pagemeta WHERE externalsource=1);
