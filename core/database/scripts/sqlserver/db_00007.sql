/* Community edition */

-- Local aware.
ALTER TABLE dmz_org ADD c_locale NVARCHAR(20) NOT NULL DEFAULT 'en-US';
ALTER TABLE dmz_user ADD c_locale NVARCHAR(20) NOT NULL DEFAULT 'en-US';
