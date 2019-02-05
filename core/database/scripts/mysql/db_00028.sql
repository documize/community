/* Community Edition */

-- BUGFIX: Increase column size
ALTER TABLE dmz_space MODIFY `c_icon` VARCHAR(50) NOT NULL DEFAULT '';

-- Deprecations
