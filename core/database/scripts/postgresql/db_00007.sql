/* Community edition */

-- Indexes to improve performance
CREATE UNIQUE INDEX idx_doc_4 ON dmz_doc (c_orgid,c_refid);
CREATE UNIQUE INDEX idx_section_4 ON dmz_section (c_orgid,c_refid);
