/* community edition */

-- max tags per document setting
ALTER TABLE organization ADD COLUMN `maxtags` INT NOT NULL DEFAULT 3 AFTER `authconfig`;

-- support for network location link types
ALTER TABLE link ADD COLUMN `externalid` NVARCHAR(1000) NOT NULL DEFAULT '' AFTER `targetid`;

-- deprecations
ALTER TABLE organization DROP COLUMN `url`;
