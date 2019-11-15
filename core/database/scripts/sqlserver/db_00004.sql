/* Community edition */

-- Fulltext search support
IF  EXISTS (SELECT * FROM sysfulltextcatalogs ftc WHERE ftc.name = N'dmz_search_catalog')
DROP FULLTEXT CATALOG dmz_search_catalog;

CREATE FULLTEXT CATALOG dmz_search_catalog;

CREATE UNIQUE INDEX idx_doc_4 ON dmz_doc(c_refid);
CREATE UNIQUE INDEX idx_section_4 ON dmz_section(c_refid);

CREATE FULLTEXT INDEX ON dmz_doc (c_name, c_desc) KEY INDEX idx_doc_4 ON dmz_search_catalog
WITH CHANGE_TRACKING AUTO;

CREATE FULLTEXT INDEX ON dmz_section (c_name, c_body) KEY INDEX idx_section_4 ON dmz_search_catalog
WITH CHANGE_TRACKING AUTO;
