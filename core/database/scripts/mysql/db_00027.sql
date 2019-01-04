/* Community Edition */

-- Space labels provide name/color grouping
DROP TABLE IF EXISTS `dmz_space_label`;
CREATE TABLE IF NOT EXISTS `dmz_space_label` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `c_refid` VARCHAR(20) NOT NULL COLLATE utf8_bin,
    `c_orgid` VARCHAR(20) NOT NULL COLLATE utf8_bin,
    `c_name` VARCHAR(50) NOT NULL DEFAULT '',
    `c_color` VARCHAR(10) NOT NULL DEFAULT '',
    `c_created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `c_revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX `idx_space_label_1` (`id` ASC),
    INDEX `idx_space_label_2` (`c_refid` ASC),
    INDEX `idx_space_label_3` (`c_orgid` ASC))
 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
 ENGINE = InnoDB;

-- Space table upgrade to support labelling, icon and summary stats
ALTER TABLE dmz_space ADD COLUMN `c_desc` VARCHAR(200) NOT NULL DEFAULT '' AFTER `c_name`;
ALTER TABLE dmz_space ADD COLUMN `c_labelid` VARCHAR(20) NOT NULL DEFAULT '' COLLATE utf8_bin AFTER `c_likes`;
ALTER TABLE dmz_space ADD COLUMN `c_icon` VARCHAR(20) NOT NULL DEFAULT '' AFTER `c_labelid`;
ALTER TABLE dmz_space ADD COLUMN `c_count_category` INT NOT NULL DEFAULT 0 AFTER `c_icon`;
ALTER TABLE dmz_space ADD COLUMN `c_count_content` INT NOT NULL DEFAULT 0 AFTER `c_count_category`;

-- Org/tenant upgrade to support theming and custom logo
ALTER TABLE dmz_org ADD COLUMN `c_theme` VARCHAR(20) NOT NULL DEFAULT '' AFTER `c_maxtags`;
ALTER TABLE dmz_org ADD COLUMN `c_logo` LONGBLOB AFTER `c_theme`;

-- Populate default values for new fields
UPDATE dmz_space s SET c_count_category=(SELECT COUNT(*) FROM dmz_category WHERE c_spaceid=s.c_refid);
UPDATE dmz_space s SET c_count_content=(SELECT COUNT(*) FROM dmz_doc WHERE c_spaceid=s.c_refid);

-- BUGFIX: Remove zombie group membership records
DELETE FROM dmz_group_member WHERE c_userid NOT IN (SELECT c_userid FROM dmz_user_account);

-- Deprecations
