/* Enterprise edition */

-- Feedback feature: support threaded comments and section references
ALTER TABLE dmz_doc_comment ADD c_replyto NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '';
ALTER TABLE dmz_doc_comment ADD c_sectionid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '';
