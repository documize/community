DROP TABLE IF EXISTS `config`;

CREATE TABLE IF NOT EXISTS  `config` (
	`area` CHAR(16) NOT NULL,
	`details` JSON,
	UNIQUE INDEX `idx_config_area` (`area` ASC) ) ;
    