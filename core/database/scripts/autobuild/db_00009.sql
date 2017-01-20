/* community edition */
ALTER TABLE page ADD COLUMN `preset` BOOL NOT NULL DEFAULT 0 AFTER `pagetype`;
ALTER TABLE page ADD COLUMN `presetid` CHAR(16) NOT NULL DEFAULT '' COLLATE utf8_bin AFTER `preset`;

/* Note:
Preset data is not required in pagemeta as a simple join to page will surface these fields.
Version history table does not need these fields as they are populated once during page creation:
  -- you cannot mark an existing section as a preset
  -- a page is only marked as preset during it's creation (e.g. created from an existing preset)
 */
