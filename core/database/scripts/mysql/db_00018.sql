/* community edition */

-- role and role membership
ALTER TABLE role ADD COLUMN `purpose` VARCHAR(100) DEFAULT '' NOT NULL AFTER `role`;
ALTER TABLE role ADD COLUMN `revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `created`;
CREATE INDEX idx_role_1 ON role(orgid);

-- deprecations
DROP TABLE IF EXISTS `labelrole`;
