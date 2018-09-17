/* community edition */

-- table renaming
RENAME TABLE
    `organization` TO dmz_org,
    `label` TO dmz_space,
    `category` TO dmz_category,
    `categorymember` TO dmz_category_member,
    `role` TO dmz_group,
    `rolemember` TO dmz_group_member,
    `permission` TO dmz_permission,
    `document` TO dmz_doc,
    `share` TO dmz_doc_share,
    `vote` TO dmz_doc_vote,
    `feedback` TO dmz_doc_comment,
    `attachment` TO dmz_doc_attachment,
    `link` TO dmz_doc_link,
    `page` TO dmz_section,
    `pagemeta` TO dmz_section_meta,
    `block` TO dmz_section_template,
    `revision` TO dmz_section_revision,
    `user` TO dmz_user,
    `account` TO dmz_user_account,
    `useractivity` TO dmz_user_activity,
    `userconfig` TO dmz_user_config,
    `config` TO dmz_config,
    `pin` TO dmz_pin,
    `search` TO dmz_search,
    `userevent` TO dmz_audit_log,
    `useraction` TO dmz_action;

-- field renaming
ALTER TABLE `dmz_org`
    CHANGE `refid` `c_refid` CHAR(16) NOT NULL,
    CHANGE `company` `c_company` VARCHAR(500) NOT NULL,
    CHANGE `title` `c_title` VARCHAR(500) NOT NULL,
    CHANGE `message` `c_message` VARCHAR(500) NOT NULL,
    CHANGE `domain` `c_domain` VARCHAR(200) NOT NULL DEFAULT '',
    CHANGE `service` `c_service` VARCHAR(200) NOT NULL DEFAULT 'https://api.documize.com',
    CHANGE `email` `c_email` VARCHAR(500) NOT NULL DEFAULT '',
    CHANGE `allowanonymousaccess` `c_anonaccess` BOOL NOT NULL DEFAULT 0,
    CHANGE `authprovider` `c_authprovider` CHAR(20) NOT NULL DEFAULT 'documize',
    CHANGE `authconfig` `c_authconfig` JSON,
    CHANGE `maxtags` `c_maxtags` INT NOT NULL DEFAULT 3,
    CHANGE `verified` `c_verified` BOOL NOT NULL DEFAULT 0,
    CHANGE `serial` `c_serial` VARCHAR(50) NOT NULL DEFAULT '',
    CHANGE `active` `c_active` BOOL NOT NULL DEFAULT 1,
    CHANGE `created` `c_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `revised` `c_revised` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE `dmz_space`
    CHANGE `refid` `c_refid` CHAR(16) NOT NULL,
    CHANGE `orgid` `c_orgid` CHAR(16) NOT NULL,
    CHANGE `userid` `c_userid` CHAR(16) NOT NULL DEFAULT '',
    CHANGE `type` `c_type` INT NOT NULL DEFAULT 1,
    CHANGE `lifecycle` `c_lifecycle` INT NOT NULL DEFAULT 1,
    CHANGE `label` `c_name` VARCHAR(300) NOT NULL,
    CHANGE `likes` `c_likes` VARCHAR(1000) NOT NULL DEFAULT '',
    CHANGE `created` `c_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `revised` `c_revised` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE `dmz_category`
    CHANGE `refid` `c_refid` CHAR(16) NOT NULL,
    CHANGE `orgid` `c_orgid` CHAR(16) NOT NULL,
    CHANGE `labelid` `c_spaceid` CHAR(16) NOT NULL,
    CHANGE `category` `c_name` VARCHAR(50) NOT NULL,
    CHANGE `created` `c_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `revised` `c_revised` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE `dmz_category_member`
    CHANGE `refid` `c_refid` CHAR(16) NOT NULL,
    CHANGE `orgid` `c_orgid` CHAR(16) NOT NULL,
    CHANGE `labelid` `c_spaceid` CHAR(16) NOT NULL,
    CHANGE `categoryid` `c_categoryid` CHAR(16) NOT NULL,
    CHANGE `documentid` `c_docid` CHAR(16) NOT NULL,
    CHANGE `created` `c_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `revised` `c_revised` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE `dmz_group`
    CHANGE `refid` `c_refid` CHAR(16) NOT NULL,
    CHANGE `orgid` `c_orgid` CHAR(16) NOT NULL,
    CHANGE `role` `c_name` VARCHAR(50) NOT NULL DEFAULT '',
    CHANGE `purpose` `c_desc` VARCHAR(100) DEFAULT '',
    CHANGE `created` `c_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `revised` `c_revised` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE `dmz_group_member`
    CHANGE `orgid` `c_orgid` CHAR(16) NOT NULL,
    CHANGE `roleid` `c_groupid` CHAR(16) NOT NULL,
    CHANGE `userid` `c_userid` CHAR(16) NOT NULL;

ALTER TABLE `dmz_permission`
    CHANGE `orgid` `c_orgid` CHAR(16) NOT NULL,
    CHANGE `who` `c_who` VARCHAR(30) NOT NULL,
    CHANGE `whoid` `c_whoid` CHAR(16) NOT NULL DEFAULT '',
    CHANGE `action` `c_action` VARCHAR(30) NOT NULL,
    CHANGE `scope` `c_scope` VARCHAR(30) NOT NULL,
    CHANGE `location` `c_location` VARCHAR(100) NOT NULL,
    CHANGE `refid` `c_refid` CHAR(16) NOT NULL,
    CHANGE `created` `c_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE `dmz_doc`
    CHANGE `refid` `c_refid` CHAR(16) NOT NULL,
    CHANGE `orgid` `c_orgid` CHAR(16) NOT NULL,
    CHANGE `labelid` `c_spaceid` CHAR(16) NOT NULL,
    CHANGE `userid` `c_userid` CHAR(16) NOT NULL DEFAULT '',
    CHANGE `job` `c_job` CHAR(36) NOT NULL DEFAULT '',
    CHANGE `location` `c_location` VARCHAR(2000) NOT NULL DEFAULT '',
    CHANGE `title` `c_name` VARCHAR(2000) NOT NULL DEFAULT '',
    CHANGE `excerpt` `c_desc` VARCHAR(2000) NOT NULL DEFAULT '',
    CHANGE `slug` `c_slug` VARCHAR(2000) NOT NULL DEFAULT '',
    CHANGE `tags` `c_tags` VARCHAR(1000) NOT NULL DEFAULT '',
    CHANGE `template` `c_template` BOOL NOT NULL DEFAULT 0,
    CHANGE `protection` `c_protection` INT NOT NULL DEFAULT 0,
    CHANGE `approval` `c_approval` INT NOT NULL DEFAULT 0,
    CHANGE `lifecycle` `c_lifecycle` INT NOT NULL DEFAULT 1,
    CHANGE `versioned` `c_versioned` INT NOT NULL DEFAULT 0,
    CHANGE `versionid` `c_versionid` VARCHAR(100) NOT NULL DEFAULT '',
    CHANGE `versionorder` `c_versionorder` INT NOT NULL DEFAULT 0,
    CHANGE `groupid` `c_groupid` CHAR(16) NOT NULL DEFAULT '',
    CHANGE `created` `c_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `revised` `c_revised` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE `dmz_doc_share`
    CHANGE `orgid` `c_orgid` CHAR(16) NOT NULL,
    CHANGE `documentid` `c_docid` CHAR(16) NOT NULL,
    CHANGE `userid` `c_userid` CHAR(16) DEFAULT '',
    CHANGE `email` `c_email` VARCHAR(250) NOT NULL DEFAULT '',
    CHANGE `message` `c_message` VARCHAR(500) NOT NULL DEFAULT '',
    CHANGE `viewed` `c_viewed` VARCHAR(500) NOT NULL DEFAULT '',
    CHANGE `secret` `c_secret` VARCHAR(250) NOT NULL DEFAULT '',
    CHANGE `expires` `c_expires` CHAR(16) DEFAULT '',
    CHANGE `active` `c_active` BOOL NOT NULL DEFAULT 1,
    CHANGE `created` `c_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE `dmz_doc_vote`
    CHANGE `refid` `c_refid` CHAR(16) NOT NULL,
    CHANGE `orgid` `c_orgid` CHAR(16) NOT NULL,
    CHANGE `documentid` `c_docid` CHAR(16) NOT NULL,
    CHANGE `voter` `c_voter` CHAR(16) NOT NULL DEFAULT '',
    CHANGE `vote` `c_vote` INT NOT NULL DEFAULT 0,
    CHANGE `created` `c_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `revised` `c_revised` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE `dmz_doc_comment`
    CHANGE `refid` `c_refid` CHAR(16) NOT NULL,
    CHANGE `orgid` `c_orgid` CHAR(16) NOT NULL,
    CHANGE `documentid` `c_docid` CHAR(16) NOT NULL,
    CHANGE `userid` `c_userid` CHAR(16) DEFAULT '',
    CHANGE `email` `c_email` VARCHAR(250) NOT NULL DEFAULT '',
    CHANGE `feedback` `c_feedback` LONGTEXT,
    CHANGE `created` `c_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE `dmz_doc_attachment`
	CHANGE `refid` `c_refid` CHAR(16) NOT NULL,
	CHANGE `orgid` `c_orgid` CHAR(16) NOT NULL,
	CHANGE `documentid` `c_docid` CHAR(16) NOT NULL,
	CHANGE `job` `c_job` CHAR(36) NOT NULL,
	CHANGE `fileid` `c_fileid` CHAR(10) NOT NULL,
	CHANGE `filename` `c_filename` VARCHAR(255) NOT NULL,
	CHANGE `data` `c_data` LONGBLOB,
	CHANGE `extension` `c_extension` CHAR(6) NOT NULL,
	CHANGE `created` `c_created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CHANGE `revised` `c_revised` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;









-- deprecations
DROP TABLE IF EXISTS `participant`;
