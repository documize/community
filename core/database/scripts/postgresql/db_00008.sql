/* Community Edition */

-- Increase column sizes to support rich text data entry
ALTER TABLE dmz_org ALTER COLUMN c_message TYPE VARCHAR(2000);
ALTER TABLE dmz_space ALTER COLUMN c_desc TYPE VARCHAR(2000);
ALTER TABLE dmz_category ALTER COLUMN c_name TYPE VARCHAR(200);
ALTER TABLE dmz_category ADD COLUMN c_default bool NOT NULL DEFAULT '0';
