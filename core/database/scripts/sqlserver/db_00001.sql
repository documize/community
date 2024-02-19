-- SQL to set up the Documize database

DROP TABLE IF EXISTS dmz_action;
CREATE TABLE dmz_action (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_userid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_docid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_requestorid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_actiontype INT NOT NULL DEFAULT '0',
    c_note NVARCHAR(2000) NOT NULL DEFAULT '',
    c_requested DATETIME2 NULL DEFAULT NULL,
    c_due DATETIME2 NULL DEFAULT NULL,
    c_completed DATETIME2 NULL DEFAULT NULL,
    c_iscomplete BIT NOT NULL DEFAULT '0',
    c_reftype NVARCHAR(1) NOT NULL DEFAULT 'D',
    c_reftypeid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_action_1 ON dmz_action (c_refid);
CREATE INDEX idx_action_2 ON dmz_action (c_userid);
CREATE INDEX idx_action_3 ON dmz_action (c_docid);
CREATE INDEX idx_action_4 ON dmz_action (c_requestorid);

DROP TABLE IF EXISTS dmz_audit_log;
CREATE TABLE dmz_audit_log (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_userid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_eventtype NVARCHAR(100) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_ip NVARCHAR(39) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_log_1 ON dmz_audit_log (c_orgid);
CREATE INDEX idx_audit_log_2 ON dmz_audit_log (c_userid);
CREATE INDEX idx_audit_log_3 ON dmz_audit_log (c_eventtype);

DROP TABLE IF EXISTS dmz_category;
CREATE TABLE dmz_category (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_spaceid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_name NVARCHAR(50) COLLATE Latin1_General_CS_AS NOT NULL,
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_category_1 ON dmz_category (c_refid);
CREATE INDEX idx_category_2 ON dmz_category (c_orgid);
CREATE INDEX idx_category_3 ON dmz_category (c_orgid,c_spaceid);

DROP TABLE IF EXISTS dmz_category_member;
CREATE TABLE dmz_category_member (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_spaceid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_categoryid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_docid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_category_member_1 ON dmz_category_member (c_docid);
CREATE INDEX idx_category_member_2 ON dmz_category_member (c_orgid,c_docid);
CREATE INDEX idx_category_member_3 ON dmz_category_member (c_orgid,c_spaceid);

DROP TABLE IF EXISTS dmz_config;
CREATE TABLE dmz_config (
    c_key NVARCHAR(200) COLLATE Latin1_General_CS_AS NOT NULL,
    c_config NVARCHAR(MAX) DEFAULT NULL
);

DROP TABLE IF EXISTS dmz_doc;
CREATE TABLE dmz_doc (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_spaceid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_userid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_job NVARCHAR(36) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_location NVARCHAR(2000) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_name NVARCHAR(2000) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_desc NVARCHAR(2000) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_slug NVARCHAR(2000) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_tags NVARCHAR(1000) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_template BIT NOT NULL DEFAULT '0',
    c_protection INT NOT NULL DEFAULT '0',
    c_approval INT NOT NULL DEFAULT '0',
    c_lifecycle INT NOT NULL DEFAULT '1',
    c_versioned BIT NOT NULL DEFAULT '0',
    c_versionid NVARCHAR(100) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_versionorder INT NOT NULL DEFAULT '0',
    c_groupid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_doc_1 ON dmz_doc (id);
CREATE INDEX idx_doc_2 ON dmz_doc (c_orgid);
CREATE INDEX idx_doc_3 ON dmz_doc (c_spaceid);

DROP TABLE IF EXISTS dmz_doc_attachment;
CREATE TABLE dmz_doc_attachment (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_docid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_job NVARCHAR(36) COLLATE Latin1_General_CS_AS NOT NULL,
    c_fileid NVARCHAR(10) COLLATE Latin1_General_CS_AS NOT NULL,
    c_filename NVARCHAR(255) COLLATE Latin1_General_CS_AS NOT NULL,
    c_data VARBINARY(MAX),
    c_extension NVARCHAR(6) COLLATE Latin1_General_CS_AS NOT NULL,
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_doc_attachment_1 ON dmz_doc_attachment (id);
CREATE INDEX idx_doc_attachment_2 ON dmz_doc_attachment (c_orgid);
CREATE INDEX idx_doc_attachment_3 ON dmz_doc_attachment (c_docid);
CREATE INDEX idx_doc_attachment_4 ON dmz_doc_attachment (c_job,c_fileid);

DROP TABLE IF EXISTS dmz_doc_comment;
CREATE TABLE dmz_doc_comment (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_docid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_userid NVARCHAR(20) COLLATE Latin1_General_CS_AS DEFAULT '',
    c_email NVARCHAR(250) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_feedback NVARCHAR(MAX) COLLATE Latin1_General_CS_AS,
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_doc_comment_1 ON dmz_doc_comment (c_refid);

DROP TABLE IF EXISTS dmz_doc_link;
CREATE TABLE dmz_doc_link (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_spaceid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_userid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_sourcedocid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_sourcesectionid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_type NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_targetdocid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_targetid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_externalid NVARCHAR(1000) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_orphan BIT NOT NULL DEFAULT '0',
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS dmz_doc_share;
CREATE TABLE dmz_doc_share (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_docid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_userid NVARCHAR(20) COLLATE Latin1_General_CS_AS DEFAULT '',
    c_email NVARCHAR(250) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_message NVARCHAR(500) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_viewed NVARCHAR(500) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_secret NVARCHAR(250) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_expires NVARCHAR(20) COLLATE Latin1_General_CS_AS DEFAULT '',
    c_active BIT NOT NULL DEFAULT '1',
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS dmz_doc_vote;
CREATE TABLE dmz_doc_vote (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_docid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_voter NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_vote INT NOT NULL DEFAULT '0',
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_doc_vote_1 ON dmz_doc_vote (c_refid);
CREATE INDEX idx_doc_vote_2 ON dmz_doc_vote (c_docid);
CREATE INDEX idx_doc_vote_3 ON dmz_doc_vote (c_orgid);
CREATE INDEX idx_doc_vote_4 ON dmz_doc_vote (c_orgid,c_docid);

DROP TABLE IF EXISTS dmz_group;
CREATE TABLE dmz_group (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_name NVARCHAR(50) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_desc NVARCHAR(100) COLLATE Latin1_General_CS_AS DEFAULT '',
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_group_1 ON dmz_group (c_refid);
CREATE INDEX idx_group_2 ON dmz_group (c_orgid);

DROP TABLE IF EXISTS dmz_group_member;
CREATE TABLE dmz_group_member (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_groupid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_userid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL
);
CREATE INDEX idx_group_member_1 ON dmz_group_member (c_groupid,c_userid);
CREATE INDEX idx_group_member_2 ON dmz_group_member (c_orgid,c_groupid,c_userid);

DROP TABLE IF EXISTS dmz_org;
CREATE TABLE dmz_org (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_company NVARCHAR(500) COLLATE Latin1_General_CS_AS NOT NULL,
    c_title NVARCHAR(500) COLLATE Latin1_General_CS_AS NOT NULL,
    c_message NVARCHAR(500) COLLATE Latin1_General_CS_AS NOT NULL,
    c_domain NVARCHAR(200) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_service NVARCHAR(200) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_email NVARCHAR(500) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_anonaccess BIT NOT NULL DEFAULT '0',
    c_authprovider NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT 'documize',
    c_authconfig NVARCHAR(MAX) DEFAULT NULL,
    c_maxtags INT NOT NULL DEFAULT '3',
    c_sub NVARCHAR(MAX) NULL,
    c_theme NVARCHAR(20) NOT NULL DEFAULT '',
    c_logo VARBINARY(MAX),
    c_verified BIT NOT NULL DEFAULT '0',
    c_serial NVARCHAR(50) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_active BIT NOT NULL DEFAULT '1',
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
);
CREATE INDEX idx_org_1 ON dmz_org (id);
CREATE INDEX idx_org_2 ON dmz_org (c_domain);

DROP TABLE IF EXISTS dmz_permission;
CREATE TABLE dmz_permission (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_who NVARCHAR(30) COLLATE Latin1_General_CS_AS NOT NULL,
    c_whoid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_action NVARCHAR(30) COLLATE Latin1_General_CS_AS NOT NULL,
    c_scope NVARCHAR(30) COLLATE Latin1_General_CS_AS NOT NULL,
    c_location NVARCHAR(100) COLLATE Latin1_General_CS_AS NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_permission_1 ON dmz_permission (c_orgid);
CREATE INDEX idx_permission_2 ON dmz_permission (c_orgid,c_who,c_whoid,c_location);
CREATE INDEX idx_permission_3 ON dmz_permission (c_orgid,c_who,c_whoid,c_location,c_action);
CREATE INDEX idx_permission_4 ON dmz_permission (c_orgid,c_location,c_refid);
CREATE INDEX idx_permission_5 ON dmz_permission (c_orgid,c_who,c_location,c_action);

DROP TABLE IF EXISTS dmz_pin;
CREATE TABLE dmz_pin (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_userid NVARCHAR(20) COLLATE Latin1_General_CS_AS DEFAULT '',
    c_spaceid NVARCHAR(20) COLLATE Latin1_General_CS_AS DEFAULT '',
    c_docid NVARCHAR(20) COLLATE Latin1_General_CS_AS DEFAULT '',
    c_sequence BIGINT NOT NULL DEFAULT '99',
    c_name NVARCHAR(100) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_pin_1 ON dmz_pin (c_userid);

DROP TABLE IF EXISTS dmz_search;
CREATE TABLE dmz_search (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_docid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_itemid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_itemtype NVARCHAR(10) COLLATE Latin1_General_CS_AS NOT NULL,
    c_content NVARCHAR(MAX) COLLATE Latin1_General_CS_AS,
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_search_1 ON dmz_search (c_orgid);
CREATE INDEX idx_search_2 ON dmz_search (c_docid);

DROP TABLE IF EXISTS dmz_section;
CREATE TABLE dmz_section (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_docid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_userid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_contenttype NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT 'wysiwyg',
    c_type NVARCHAR(10) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT 'section',
    c_templateid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_level bigint NOT NULL,
    c_sequence double precision NOT NULL,
    c_name NVARCHAR(2000) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_body NVARCHAR(MAX) COLLATE Latin1_General_CS_AS,
    c_revisions bigint NOT NULL,
    c_status INT NOT NULL DEFAULT '0',
    c_relativeid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_section_1 ON dmz_section (id);
CREATE INDEX idx_section_2 ON dmz_section (c_orgid);
CREATE INDEX idx_section_3 ON dmz_section (c_docid);

DROP TABLE IF EXISTS dmz_section_meta;
CREATE TABLE dmz_section_meta (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_sectionid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_userid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_docid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_rawbody NVARCHAR(MAX),
    c_config NVARCHAR(MAX) DEFAULT NULL,
    c_external BIT DEFAULT '0',
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_section_meta_1 ON dmz_section_meta (id);
CREATE INDEX idx_section_meta_2 ON dmz_section_meta (c_sectionid);
CREATE INDEX idx_section_meta_3 ON dmz_section_meta (c_orgid);
CREATE INDEX idx_section_meta_4 ON dmz_section_meta (c_docid);

DROP TABLE IF EXISTS dmz_section_revision;
CREATE TABLE dmz_section_revision (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_docid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_ownerid NVARCHAR(20) COLLATE Latin1_General_CS_AS DEFAULT '',
    c_sectionid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_userid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_contenttype NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT 'wysiwyg',
    c_type NVARCHAR(10) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT 'section',
    c_name NVARCHAR(2000) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_body NVARCHAR(MAX) COLLATE Latin1_General_CS_AS,
    c_rawbody NVARCHAR(MAX),
    c_config NVARCHAR(MAX) DEFAULT NULL,
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_section_revision_1 ON dmz_section_revision (id);
CREATE INDEX idx_section_revision_2 ON dmz_section_revision (c_orgid);
CREATE INDEX idx_section_revision_3 ON dmz_section_revision (c_docid);
CREATE INDEX idx_section_revision_4 ON dmz_section_revision (c_sectionid);

DROP TABLE IF EXISTS dmz_section_template;
CREATE TABLE dmz_section_template (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_spaceid NVARCHAR(20) COLLATE Latin1_General_CS_AS DEFAULT '',
    c_userid NVARCHAR(20) COLLATE Latin1_General_CS_AS DEFAULT '',
    c_contenttype NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT 'wysiwyg',
    c_type NVARCHAR(10) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT 'section',
    c_name NVARCHAR(2000) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_body NVARCHAR(MAX) COLLATE Latin1_General_CS_AS,
    c_desc NVARCHAR(2000) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_used INT NOT NULL,
    c_rawbody NVARCHAR(MAX),
    c_config NVARCHAR(MAX) DEFAULT NULL,
    c_external BIT DEFAULT '0',
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_section_template_1 ON dmz_section_template (c_refid);
CREATE INDEX idx_section_template_2 ON dmz_section_template (c_spaceid);

DROP TABLE IF EXISTS dmz_space;
CREATE TABLE dmz_space (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_name NVARCHAR(300) COLLATE Latin1_General_CS_AS NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_userid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_type INT NOT NULL DEFAULT '1',
    c_lifecycle INT NOT NULL DEFAULT '1',
    c_desc NVARCHAR(200) NOT NULL DEFAULT '',
    c_labelid NVARCHAR(20) NOT NULL DEFAULT '' COLLATE Latin1_General_CS_AS,
    c_likes NVARCHAR(1000) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_icon NVARCHAR(50) NOT NULL DEFAULT '',
    c_count_category INT NOT NULL DEFAULT 0,
    c_count_content INT NOT NULL DEFAULT 0,
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_space_1 ON dmz_space (id);
CREATE INDEX idx_space_2 ON dmz_space (c_userid);
CREATE INDEX idx_space_3 ON dmz_space (c_orgid);

DROP TABLE IF EXISTS dmz_space_label;
CREATE TABLE dmz_space_label (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_name NVARCHAR(50) NOT NULL DEFAULT '',
    c_color NVARCHAR(10) NOT NULL DEFAULT '',
    c_created DATETIME2 DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_space_label_1 ON dmz_space_label (id);
CREATE INDEX idx_space_label_2 ON dmz_space_label (c_orgid);

DROP TABLE IF EXISTS dmz_user;
CREATE TABLE dmz_user (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_firstname NVARCHAR(500) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_lastname NVARCHAR(500) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_email NVARCHAR(500) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_initials NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_globaladmin BIT NOT NULL DEFAULT '0',
    c_password NVARCHAR(500) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_salt NVARCHAR(500) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_reset NVARCHAR(500) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_active BIT NOT NULL DEFAULT '1',
    c_lastversion NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_1 ON dmz_user (id);
CREATE INDEX idx_user_2 ON dmz_user (c_email);

DROP TABLE IF EXISTS dmz_user_account;
CREATE TABLE dmz_user_account (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_refid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_userid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_editor BIT NOT NULL DEFAULT '0',
    c_admin BIT NOT NULL DEFAULT '0',
    c_users BIT NOT NULL DEFAULT '1',
    c_analytics BIT NOT NULL DEFAULT '0',
    c_active BIT NOT NULL DEFAULT '1',
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_revised DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_account_1 ON dmz_user_account (id);
CREATE INDEX idx_user_account_2 ON dmz_user_account (c_userid);
CREATE INDEX idx_user_account_3 ON dmz_user_account (c_orgid);

DROP TABLE IF EXISTS dmz_user_activity;
CREATE TABLE dmz_user_activity (
    id BIGINT PRIMARY KEY IDENTITY (1, 1) NOT NULL,
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_userid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_spaceid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_docid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_sectionid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_sourcetype INT NOT NULL DEFAULT '0',
    c_activitytype INT NOT NULL DEFAULT '0',
    c_metadata NVARCHAR(1000) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '',
    c_created DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_activity_1 ON dmz_user_activity (c_orgid);
CREATE INDEX idx_user_activity_2 ON dmz_user_activity (c_userid);
CREATE INDEX idx_user_activity_3 ON dmz_user_activity (c_activitytype);
CREATE INDEX idx_user_activity_4 ON dmz_user_activity (c_orgid,c_docid,c_sourcetype);
CREATE INDEX idx_user_activity_5 ON dmz_user_activity (c_orgid,c_docid,c_userid,c_sourcetype);

DROP TABLE IF EXISTS dmz_user_config;
CREATE TABLE dmz_user_config (
    c_orgid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_userid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL,
    c_key NVARCHAR(200) COLLATE Latin1_General_CS_AS NOT NULL,
    c_config NVARCHAR(MAX) DEFAULT NULL
);

INSERT INTO dmz_config VALUES ('SMTP','{"userid": "","password": "","host": "","port": "","sender": ""}');
INSERT INTO dmz_config VALUES ('FILEPLUGINS', '[{"Comment": "Disable (or not) built-in html import (NOTE: no Plugin name)","Disabled": false,"API": "Convert","Actions": ["htm","html"]},{"Comment": "Disable (or not) built-in Documize API import used from SDK (NOTE: no Plugin name)","Disabled": false,"API": "Convert","Actions": ["documizeapi"]}]');
INSERT INTO dmz_config VALUES ('SECTION-TRELLO','{"appKey": ""}');
INSERT INTO dmz_config VALUES ('META','{"database": "0"}');
