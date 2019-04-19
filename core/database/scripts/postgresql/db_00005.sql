/* Community Edition */

-- Support per section attachments
ALTER TABLE dmz_doc_attachment ADD COLUMN c_sectionid VARCHAR(20) NOT NULL DEFAULT '' COLLATE ucs_basic;
