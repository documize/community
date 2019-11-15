/* Community Edition */

-- Increase column sizes to support rich text data entry
ALTER TABLE dmz_org MODIFY `c_message` VARCHAR(800) NOT NULL DEFAULT '';
ALTER TABLE dmz_space MODIFY `c_desc` VARCHAR(800) NOT NULL DEFAULT '';
ALTER TABLE dmz_category MODIFY `c_name` VARCHAR(200) NOT NULL DEFAULT '';
ALTER TABLE dmz_category ADD COLUMN `c_default` BOOL NOT NULL DEFAULT 0 AFTER `c_name`;
