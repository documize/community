/* Community edition */

-- Increase column sizes to support rich text data entry
ALTER TABLE dmz_org ALTER COLUMN c_message NVARCHAR(2000);
ALTER TABLE dmz_space ALTER COLUMN c_desc NVARCHAR(2000);
ALTER TABLE dmz_category ALTER COLUMN c_name NVARCHAR(200);
ALTER TABLE dmz_category ADD c_default BIT NOT NULL DEFAULT '0';
