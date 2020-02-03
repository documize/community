/* Community Edition */

-- Allow for pinned documents per space.
ALTER TABLE dmz_doc ADD COLUMN c_seq INT NOT NULL DEFAULT '99999';

