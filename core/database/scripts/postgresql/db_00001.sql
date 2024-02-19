-- SQL to set up the Documize database
-- select * from information_schema.tables WHERE table_catalog='documize';
-- http://www.postgresqltutorial.com/postgresql-json/
-- https://en.wikibooks.org/wiki/Converting_MySQL_to_PostgreSQL

DROP TABLE IF EXISTS dmz_action;
CREATE TABLE dmz_action (
    id bigserial NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_userid varchar(20) COLLATE ucs_basic NOT NULL,
    c_docid varchar(20) COLLATE ucs_basic NOT NULL,
    c_requestorid varchar(20) COLLATE ucs_basic NOT NULL,
    c_actiontype int NOT NULL DEFAULT '0',
    c_note varchar(2000) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_requested timestamp NULL DEFAULT NULL,
    c_due timestamp NULL DEFAULT NULL,
    c_completed timestamp NULL DEFAULT NULL,
    c_iscomplete bool NOT NULL DEFAULT '0',
    c_reftype varchar(1) COLLATE ucs_basic NOT NULL DEFAULT 'D',
    c_reftypeid varchar(20) COLLATE ucs_basic NOT NULL,
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE INDEX idx_action_1 ON dmz_action (c_refid);
CREATE INDEX idx_action_2 ON dmz_action (c_userid);
CREATE INDEX idx_action_3 ON dmz_action (c_docid);
CREATE INDEX idx_action_4 ON dmz_action (c_requestorid);

DROP TABLE IF EXISTS dmz_audit_log;
CREATE TABLE dmz_audit_log (
    id bigserial NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_userid varchar(20) COLLATE ucs_basic NOT NULL,
    c_eventtype varchar(100) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_ip varchar(39) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE INDEX idx_audit_log_1 ON dmz_audit_log (c_orgid);
CREATE INDEX idx_audit_log_2 ON dmz_audit_log (c_userid);
CREATE INDEX idx_audit_log_3 ON dmz_audit_log (c_eventtype);

DROP TABLE IF EXISTS dmz_category;
CREATE TABLE dmz_category (
    id bigserial NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_spaceid varchar(20) COLLATE ucs_basic NOT NULL,
    c_name varchar(50) COLLATE ucs_basic NOT NULL,
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id)
);
CREATE INDEX idx_category_1 ON dmz_category (c_refid);
CREATE INDEX idx_category_2 ON dmz_category (c_orgid);
CREATE INDEX idx_category_3 ON dmz_category (c_orgid,c_spaceid);

DROP TABLE IF EXISTS dmz_category_member;
CREATE TABLE dmz_category_member (
    id bigserial NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_spaceid varchar(20) COLLATE ucs_basic NOT NULL,
    c_categoryid varchar(20) COLLATE ucs_basic NOT NULL,
    c_docid varchar(20) COLLATE ucs_basic NOT NULL,
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id)
);
CREATE INDEX idx_category_member_1 ON dmz_category_member (c_docid);
CREATE INDEX idx_category_member_2 ON dmz_category_member (c_orgid,c_docid);
CREATE INDEX idx_category_member_3 ON dmz_category_member (c_orgid,c_spaceid);

DROP TABLE IF EXISTS dmz_config;
CREATE TABLE dmz_config (
    c_key varchar(200) COLLATE ucs_basic NOT NULL,
    c_config json DEFAULT NULL,
    UNIQUE (c_key)
);

DROP TABLE IF EXISTS dmz_doc;
CREATE TABLE dmz_doc (
    id bigserial NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_spaceid varchar(20) COLLATE ucs_basic NOT NULL,
    c_userid varchar(20) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_job varchar(36) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_location varchar(2000) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_name varchar(2000) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_desc varchar(2000) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_slug varchar(2000) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_tags varchar(1000) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_template bool NOT NULL DEFAULT '0',
    c_protection int NOT NULL DEFAULT '0',
    c_approval int NOT NULL DEFAULT '0',
    c_lifecycle int NOT NULL DEFAULT '1',
    c_versioned bool NOT NULL DEFAULT '0',
    c_versionid varchar(100) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_versionorder int NOT NULL DEFAULT '0',
    c_groupid varchar(20) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (c_refid)
);
CREATE INDEX idx_doc_1 ON dmz_doc (id);
CREATE INDEX idx_doc_2 ON dmz_doc (c_orgid);
CREATE INDEX idx_doc_3 ON dmz_doc (c_spaceid);

DROP TABLE IF EXISTS dmz_doc_attachment;
CREATE TABLE dmz_doc_attachment (
    id bigserial NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_docid varchar(20) COLLATE ucs_basic NOT NULL,
    c_job varchar(36) COLLATE ucs_basic NOT NULL,
    c_fileid varchar(10) COLLATE ucs_basic NOT NULL,
    c_filename varchar(255) COLLATE ucs_basic NOT NULL,
    c_data BYTEA,
    c_extension varchar(6) COLLATE ucs_basic NOT NULL,
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (c_refid)
);
CREATE INDEX idx_doc_attachment_1 ON dmz_doc_attachment (id);
CREATE INDEX idx_doc_attachment_2 ON dmz_doc_attachment (c_orgid);
CREATE INDEX idx_doc_attachment_3 ON dmz_doc_attachment (c_docid);
CREATE INDEX idx_doc_attachment_4 ON dmz_doc_attachment (c_job,c_fileid);

DROP TABLE IF EXISTS dmz_doc_comment;
CREATE TABLE dmz_doc_comment (
    id bigserial NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_docid varchar(20) COLLATE ucs_basic NOT NULL,
    c_userid varchar(20) COLLATE ucs_basic DEFAULT '',
    c_email varchar(250) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_feedback text COLLATE ucs_basic,
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE INDEX idx_doc_comment_1 ON dmz_doc_comment (c_refid);

DROP TABLE IF EXISTS dmz_doc_link;
CREATE TABLE dmz_doc_link (
    id bigserial NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_spaceid varchar(20) COLLATE ucs_basic NOT NULL,
    c_userid varchar(20) COLLATE ucs_basic NOT NULL,
    c_sourcedocid varchar(20) COLLATE ucs_basic NOT NULL,
    c_sourcesectionid varchar(20) COLLATE ucs_basic NOT NULL,
    c_type varchar(20) COLLATE ucs_basic NOT NULL,
    c_targetdocid varchar(20) COLLATE ucs_basic NOT NULL,
    c_targetid varchar(20) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_externalid varchar(1000) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_orphan bool NOT NULL DEFAULT '0',
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS dmz_doc_share;
CREATE TABLE dmz_doc_share (
    id bigserial NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_docid varchar(20) COLLATE ucs_basic NOT NULL,
    c_userid varchar(20) COLLATE ucs_basic DEFAULT '',
    c_email varchar(250) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_message varchar(500) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_viewed varchar(500) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_secret varchar(250) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_expires varchar(20) COLLATE ucs_basic DEFAULT '',
    c_active bool NOT NULL DEFAULT '1',
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS dmz_doc_vote;
CREATE TABLE dmz_doc_vote (
    id bigserial NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_docid varchar(20) COLLATE ucs_basic NOT NULL,
    c_voter varchar(20) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_vote int NOT NULL DEFAULT '0',
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id)
);
CREATE INDEX idx_doc_vote_1 ON dmz_doc_vote (c_refid);
CREATE INDEX idx_doc_vote_2 ON dmz_doc_vote (c_docid);
CREATE INDEX idx_doc_vote_3 ON dmz_doc_vote (c_orgid);
CREATE INDEX idx_doc_vote_4 ON dmz_doc_vote (c_orgid,c_docid);

DROP TABLE IF EXISTS dmz_group;
CREATE TABLE dmz_group (
    id bigserial NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_name varchar(50) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_desc varchar(100) COLLATE ucs_basic DEFAULT '',
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id)
);
CREATE INDEX idx_group_1 ON dmz_group (c_refid);
CREATE INDEX idx_group_2 ON dmz_group (c_orgid);

DROP TABLE IF EXISTS dmz_group_member;
CREATE TABLE dmz_group_member (
    id bigserial NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_groupid varchar(20) COLLATE ucs_basic NOT NULL,
    c_userid varchar(20) COLLATE ucs_basic NOT NULL,
    UNIQUE (id)
);
CREATE INDEX idx_group_member_1 ON dmz_group_member (c_groupid,c_userid);
CREATE INDEX idx_group_member_2 ON dmz_group_member (c_orgid,c_groupid,c_userid);

DROP TABLE IF EXISTS dmz_org;
CREATE TABLE dmz_org (
    id bigserial NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_company varchar(500) COLLATE ucs_basic NOT NULL,
    c_title varchar(500) COLLATE ucs_basic NOT NULL,
    c_message varchar(500) COLLATE ucs_basic NOT NULL,
    c_domain varchar(200) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_service varchar(200) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_email varchar(500) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_anonaccess bool NOT NULL DEFAULT '0',
    c_authprovider varchar(20) COLLATE ucs_basic NOT NULL DEFAULT 'documize',
    c_authconfig json DEFAULT NULL,
    c_maxtags int NOT NULL DEFAULT '3',
    c_verified bool NOT NULL DEFAULT '0',
    c_serial varchar(50) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_active bool NOT NULL DEFAULT '1',
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (c_refid)
);
CREATE INDEX idx_org_1 ON dmz_org (id);
CREATE INDEX idx_org_2 ON dmz_org (c_domain);

DROP TABLE IF EXISTS dmz_permission;
CREATE TABLE dmz_permission (
    id bigserial NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_who varchar(30) COLLATE ucs_basic NOT NULL,
    c_whoid varchar(20) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_action varchar(30) COLLATE ucs_basic NOT NULL,
    c_scope varchar(30) COLLATE ucs_basic NOT NULL,
    c_location varchar(100) COLLATE ucs_basic NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id)
);
CREATE INDEX idx_permission_1 ON dmz_permission (c_orgid);
CREATE INDEX idx_permission_2 ON dmz_permission (c_orgid,c_who,c_whoid,c_location);
CREATE INDEX idx_permission_3 ON dmz_permission (c_orgid,c_who,c_whoid,c_location,c_action);
CREATE INDEX idx_permission_4 ON dmz_permission (c_orgid,c_location,c_refid);
CREATE INDEX idx_permission_5 ON dmz_permission (c_orgid,c_who,c_location,c_action);

DROP TABLE IF EXISTS dmz_pin;
CREATE TABLE dmz_pin (
    id bigserial NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_userid varchar(20) COLLATE ucs_basic DEFAULT '',
    c_spaceid varchar(20) COLLATE ucs_basic DEFAULT '',
    c_docid varchar(20) COLLATE ucs_basic DEFAULT '',
    c_sequence BIGINT NOT NULL DEFAULT '99',
    c_name varchar(100) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE INDEX idx_pin_1 ON dmz_pin (c_userid);

DROP TABLE IF EXISTS dmz_search;
CREATE TABLE dmz_search (
    id bigserial NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_docid varchar(20) COLLATE ucs_basic NOT NULL,
    c_itemid varchar(20) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_itemtype varchar(10) COLLATE ucs_basic NOT NULL,
    c_content text COLLATE ucs_basic,
    c_token TSVECTOR,
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id)
);
CREATE INDEX idx_search_1 ON dmz_search (c_orgid);
CREATE INDEX idx_search_2 ON dmz_search (c_docid);
CREATE INDEX idx_search_3 ON dmz_search USING GIN(c_token);

DROP TABLE IF EXISTS dmz_section;
CREATE TABLE dmz_section (
    id bigserial NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_docid varchar(20) COLLATE ucs_basic NOT NULL,
    c_userid varchar(20) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_contenttype varchar(20) COLLATE ucs_basic NOT NULL DEFAULT 'wysiwyg',
    c_type varchar(10) COLLATE ucs_basic NOT NULL DEFAULT 'section',
    c_templateid varchar(20) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_level bigint NOT NULL,
    c_sequence double precision NOT NULL,
    c_name varchar(2000) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_body text COLLATE ucs_basic,
    c_revisions bigint NOT NULL,
    c_status int NOT NULL DEFAULT '0',
    c_relativeid varchar(20) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (c_refid)
);
CREATE INDEX idx_section_1 ON dmz_section (id);
CREATE INDEX idx_section_2 ON dmz_section (c_orgid);
CREATE INDEX idx_section_3 ON dmz_section (c_docid);

DROP TABLE IF EXISTS dmz_section_meta;
CREATE TABLE dmz_section_meta (
    id bigserial NOT NULL,
    c_sectionid varchar(20) COLLATE ucs_basic NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_userid varchar(20) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_docid varchar(20) COLLATE ucs_basic NOT NULL,
    c_rawbody BYTEA,
    c_config json DEFAULT NULL,
    c_external bool DEFAULT '0',
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (c_sectionid)
);
CREATE INDEX idx_section_meta_1 ON dmz_section_meta (id);
CREATE INDEX idx_section_meta_2 ON dmz_section_meta (c_sectionid);
CREATE INDEX idx_section_meta_3 ON dmz_section_meta (c_orgid);
CREATE INDEX idx_section_meta_4 ON dmz_section_meta (c_docid);

DROP TABLE IF EXISTS dmz_section_revision;
CREATE TABLE dmz_section_revision (
    id bigserial NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_docid varchar(20) COLLATE ucs_basic NOT NULL,
    c_ownerid varchar(20) COLLATE ucs_basic DEFAULT '',
    c_sectionid varchar(20) COLLATE ucs_basic NOT NULL,
    c_userid varchar(20) COLLATE ucs_basic NOT NULL,
    c_contenttype varchar(20) COLLATE ucs_basic NOT NULL DEFAULT 'wysiwyg',
    c_type varchar(10) COLLATE ucs_basic NOT NULL DEFAULT 'section',
    c_name varchar(2000) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_body text COLLATE ucs_basic,
    c_rawbody BYTEA,
    c_config json DEFAULT NULL,
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (c_refid)
);
CREATE INDEX idx_section_revision_1 ON dmz_section_revision (id);
CREATE INDEX idx_section_revision_2 ON dmz_section_revision (c_orgid);
CREATE INDEX idx_section_revision_3 ON dmz_section_revision (c_docid);
CREATE INDEX idx_section_revision_4 ON dmz_section_revision (c_sectionid);

DROP TABLE IF EXISTS dmz_section_template;
CREATE TABLE dmz_section_template (
    id bigserial NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_spaceid varchar(20) COLLATE ucs_basic DEFAULT '',
    c_userid varchar(20) COLLATE ucs_basic DEFAULT '',
    c_contenttype varchar(20) COLLATE ucs_basic NOT NULL DEFAULT 'wysiwyg',
    c_type varchar(10) COLLATE ucs_basic NOT NULL DEFAULT 'section',
    c_name varchar(2000) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_body text COLLATE ucs_basic,
    c_desc varchar(2000) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_used bigint NOT NULL,
    c_rawbody BYTEA,
    c_config json DEFAULT NULL,
    c_external bool DEFAULT '0',
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE INDEX idx_section_template_1 ON dmz_section_template (c_refid);
CREATE INDEX idx_section_template_2 ON dmz_section_template (c_spaceid);

DROP TABLE IF EXISTS dmz_space;
CREATE TABLE dmz_space (
    id bigserial NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_name varchar(300) COLLATE ucs_basic NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_userid varchar(20) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_type int NOT NULL DEFAULT '1',
    c_lifecycle int NOT NULL DEFAULT '1',
    c_likes varchar(1000) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (c_refid)
);
CREATE INDEX idx_space_1 ON dmz_space (id);
CREATE INDEX idx_space_2 ON dmz_space (c_userid);
CREATE INDEX idx_space_3 ON dmz_space (c_orgid);

DROP TABLE IF EXISTS dmz_user;
CREATE TABLE dmz_user (
    id bigserial NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_firstname varchar(500) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_lastname varchar(500) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_email varchar(500) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_initials varchar(20) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_globaladmin bool NOT NULL DEFAULT '0',
    c_password varchar(500) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_salt varchar(500) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_reset varchar(500) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_active bool NOT NULL DEFAULT '1',
    c_lastversion varchar(20) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (c_refid)
);
CREATE INDEX idx_user_1 ON dmz_user (id);
CREATE INDEX idx_user_2 ON dmz_user (c_email);

DROP TABLE IF EXISTS dmz_user_account;
CREATE TABLE dmz_user_account (
    id bigserial NOT NULL,
    c_refid varchar(20) COLLATE ucs_basic NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_userid varchar(20) COLLATE ucs_basic NOT NULL,
    c_editor bool NOT NULL DEFAULT '0',
    c_admin bool NOT NULL DEFAULT '0',
    c_users bool NOT NULL DEFAULT '1',
    c_analytics bool NOT NULL DEFAULT '0',
    c_active bool NOT NULL DEFAULT '1',
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (c_refid)
);
CREATE INDEX idx_user_account_1 ON dmz_user_account (id);
CREATE INDEX idx_user_account_2 ON dmz_user_account (c_userid);
CREATE INDEX idx_user_account_3 ON dmz_user_account (c_orgid);

DROP TABLE IF EXISTS dmz_user_activity;
CREATE TABLE dmz_user_activity (
    id bigserial NOT NULL,
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_userid varchar(20) COLLATE ucs_basic NOT NULL,
    c_spaceid varchar(20) COLLATE ucs_basic NOT NULL,
    c_docid varchar(20) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_sectionid varchar(20) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_sourcetype int NOT NULL DEFAULT '0',
    c_activitytype int NOT NULL DEFAULT '0',
    c_metadata varchar(1000) COLLATE ucs_basic NOT NULL DEFAULT '',
    c_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE INDEX idx_user_activity_1 ON dmz_user_activity (c_orgid);
CREATE INDEX idx_user_activity_2 ON dmz_user_activity (c_userid);
CREATE INDEX idx_user_activity_3 ON dmz_user_activity (c_activitytype);
CREATE INDEX idx_user_activity_4 ON dmz_user_activity (c_orgid,c_docid,c_sourcetype);
CREATE INDEX idx_user_activity_5 ON dmz_user_activity (c_orgid,c_docid,c_userid,c_sourcetype);

DROP TABLE IF EXISTS dmz_user_config;
CREATE TABLE dmz_user_config (
    c_orgid varchar(20) COLLATE ucs_basic NOT NULL,
    c_userid varchar(20) COLLATE ucs_basic NOT NULL,
    c_key varchar(200) COLLATE ucs_basic NOT NULL,
    c_config json DEFAULT NULL,
    UNIQUE (c_orgid,c_userid,c_key)
);

INSERT INTO dmz_config VALUES ('SMTP','{"userid": "","password": "","host": "","port": "","sender": ""}');
INSERT INTO dmz_config VALUES ('FILEPLUGINS', '[{"Comment": "Disable (or not) built-in html import (NOTE: no Plugin name)","Disabled": false,"API": "Convert","Actions": ["htm","html"]},{"Comment": "Disable (or not) built-in Documize API import used from SDK (NOTE: no Plugin name)","Disabled": false,"API": "Convert","Actions": ["documizeapi"]}]');
INSERT INTO dmz_config VALUES ('SECTION-TRELLO','{"appKey": ""}');
INSERT INTO dmz_config VALUES ('META','{"database": "0"}');
