/* Community edition */

-- Allow for pinned documents per space.
ALTER TABLE dmz_doc ADD c_seq INT NOT NULL DEFAULT '99999';
