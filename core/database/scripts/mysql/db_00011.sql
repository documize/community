/* community edition */
ALTER TABLE organization ADD COLUMN `authprovider` CHAR(20) NOT NULL DEFAULT 'documize' AFTER `allowanonymousaccess`;
ALTER TABLE organization ADD COLUMN `authconfig` JSON AFTER `authprovider`;
