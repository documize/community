/* Community Edition */

-- Space labels provide name/color grouping
DROP TABLE IF EXISTS dmz_space_label;
CREATE TABLE dmz_space_label (
    id bigserial NOT NULL,
    c_refid VARCHAR(20) NOT NULL COLLATE ucs_basic,
    c_orgid VARCHAR(20) NOT NULL COLLATE ucs_basic,
    c_name VARCHAR(50) NOT NULL DEFAULT '',
    c_color VARCHAR(10) NOT NULL DEFAULT '',
    c_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    c_revised TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (c_refid)
);
CREATE INDEX idx_space_label_1 ON dmz_space_label (id);
CREATE INDEX idx_space_label_2 ON dmz_space_label (c_orgid);

-- Space table upgrade to support label, icon and summary stats
ALTER TABLE dmz_space ADD COLUMN c_desc VARCHAR(200) NOT NULL DEFAULT '';
ALTER TABLE dmz_space ADD COLUMN c_labelid VARCHAR(20) NOT NULL DEFAULT '' COLLATE ucs_basic;
ALTER TABLE dmz_space ADD COLUMN c_icon VARCHAR(20) NOT NULL DEFAULT '';
ALTER TABLE dmz_space ADD COLUMN c_count_category INT NOT NULL DEFAULT 0;
ALTER TABLE dmz_space ADD COLUMN c_count_content INT NOT NULL DEFAULT 0;

-- Org/tenant upgrade to support theming and custom logo
ALTER TABLE dmz_org ADD COLUMN c_theme VARCHAR(20) NOT NULL DEFAULT '';
ALTER TABLE dmz_org ADD COLUMN c_logo BYTEA;

-- Populate default values for new fields
UPDATE dmz_space s SET c_count_category=(SELECT COUNT(*) FROM dmz_category WHERE c_spaceid=s.c_refid);
UPDATE dmz_space s SET c_count_content=(SELECT COUNT(*) FROM dmz_doc WHERE c_spaceid=s.c_refid);

-- BUGFIX: Remove zombie group membership records
DELETE FROM dmz_group_member WHERE c_userid NOT IN (SELECT c_userid FROM dmz_user_account);

-- Deprecations
