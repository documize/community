/* Community edition */

-- Performance indexes
CREATE INDEX idx_action_6 ON dmz_action (c_orgid,c_reftypeid,c_reftype);

CREATE INDEX idx_action_7 ON dmz_action (c_orgid,c_refid);

CREATE INDEX idx_section_5 ON dmz_section (c_orgid,c_refid);
