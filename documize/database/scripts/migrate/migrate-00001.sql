ALTER TABLE pagemeta ADD `externalsource` BOOL DEFAULT 0 AFTER config;

UPDATE pagemeta SET externalsource=1 WHERE pageid in (SELECT refid FROM page WHERE contenttype='gemini');

