/* Enterprise edition */

-- Feedback feature: support threaded comments and section references
ALTER TABLE dmz_doc_comment ADD COLUMN `c_replyto` VARCHAR(20) NOT NULL DEFAULT '' COLLATE utf8_bin AFTER `c_docid`;
ALTER TABLE dmz_doc_comment ADD COLUMN `c_sectionid` VARCHAR(20) NOT NULL DEFAULT '' COLLATE utf8_bin AFTER `c_docid`;
