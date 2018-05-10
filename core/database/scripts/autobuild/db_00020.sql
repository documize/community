/* enterprise edition */

-- consistency of table engines
ALTER TABLE config ENGINE = InnoDB;
ALTER TABLE permission ENGINE = InnoDB;
ALTER TABLE category ENGINE = InnoDB;
ALTER TABLE categorymember ENGINE = InnoDB;
ALTER TABLE role ENGINE = InnoDB;
ALTER TABLE rolemember ENGINE = InnoDB;

-- content analytics
ALTER TABLE useractivity ADD COLUMN `metadata` VARCHAR(1000) NOT NULL DEFAULT '' AFTER `activitytype`;

-- new role for viewing content analytics
ALTER TABLE account ADD COLUMN `analytics` BOOL NOT NULL DEFAULT 0 AFTER `users`;
UPDATE account SET analytics=1 WHERE `admin`=1;

-- deprecations
