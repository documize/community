/* Community edition */

-- Performance indexes
CREATE INDEX idx_action_5 ON dmz_action (c_orgid,c_userid,c_docid,c_actiontype,c_iscomplete,c_reftype,c_reftypeid);
