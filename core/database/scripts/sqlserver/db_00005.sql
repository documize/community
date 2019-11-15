/* Community edition */

-- Increase column sizes to support rich text data entry
ALTER TABLE dmz_org ALTER COLUMN c_message TYPE NVARCHAR(2000) NOT NULL DEFAULT '';
ALTER TABLE dmz_space ALTER COLUMN c_desc TYPE NVARCHAR(2000) NOT NULL DEFAULT '';
ALTER TABLE dmz_category ALTER COLUMN c_name TYPE NVARCHAR(200) NOT NULL DEFAULT '';
ALTER TABLE dmz_category ADD COLUMN c_default BIT NOT NULL DEFAULT '0';
