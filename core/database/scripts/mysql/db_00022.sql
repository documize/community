/* enterprise edition */

-- document lifecycle default option
ALTER TABLE label ADD COLUMN `lifecycle` INT NOT NULL DEFAULT 1 AFTER `type`;

-- deprecations
