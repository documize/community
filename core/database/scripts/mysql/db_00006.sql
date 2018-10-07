/* enterprise edition */
DROP TABLE IF EXISTS `participant`;

CREATE TABLE IF NOT EXISTS `participant` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`refid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`orgid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`documentid` CHAR(16) NOT NULL COLLATE utf8_bin,
	`userid` CHAR(16) DEFAULT '' COLLATE utf8_bin,
	`roletype` CHAR(1) NOT NULL DEFAULT 'I' COLLATE utf8_bin,
	`lastviewed` TIMESTAMP NULL,
	`created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_id PRIMARY KEY (id),
	INDEX `idx_participant_documentid` (`documentid` ASC))
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
ENGINE =  InnoDB;
