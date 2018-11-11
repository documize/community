/* community edition */

-- add subscription
ALTER TABLE dmz_org ADD COLUMN `c_sub` JSON NULL AFTER `c_authconfig`;

-- deprecations
