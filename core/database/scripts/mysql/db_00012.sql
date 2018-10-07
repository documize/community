/* community edition */
ALTER TABLE document ALTER COLUMN `layout` SET DEFAULT 'section';
UPDATE document SET layout='section';
