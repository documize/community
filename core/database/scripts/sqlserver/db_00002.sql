/* Community Edition */

-- Support per section attachments
ALTER TABLE dmz_doc_attachment ADD c_sectionid NVARCHAR(20) COLLATE Latin1_General_CS_AS NOT NULL DEFAULT '';
