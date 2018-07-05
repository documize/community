/* community edition */

-- max tags per document setting
ALTER TABLE organization ADD COLUMN `maxtags` INT NOT NULL DEFAULT 3 AFTER `authconfig`;

-- deprecations
