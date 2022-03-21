/* Community Edition */

-- Local aware.
ALTER TABLE dmz_org ADD COLUMN  `c_locale` VARCHAR(20) NOT NULL DEFAULT 'en-US';
ALTER TABLE dmz_user ADD COLUMN  `c_locale` VARCHAR(20) NOT NULL DEFAULT 'en-US';
