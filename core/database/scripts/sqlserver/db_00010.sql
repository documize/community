/* Community edition */

-- Performance indexes
CREATE INDEX idx_action_8 ON dmz_action (c_orgid,c_docid);

CREATE INDEX idx_user_3 ON dmz_user (c_refid);
