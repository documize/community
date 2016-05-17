DROP TABLE IF EXISTS `config`;

CREATE TABLE IF NOT EXISTS  `config` (
	`key` CHAR(255) NOT NULL,
	`config` JSON,
	UNIQUE INDEX `idx_config_area` (`key` ASC) ) ;

INSERT INTO `config` VALUES ('SMTP','{\"userid\": \"\",\"password\": \"\",\"host\": \"\",\"port\": \"\",\"sender\": \"\"}');

INSERT INTO `config` VALUES ('FILEPLUGINS',
'[{\"Comment\": \"Disable (or not) built-in html import (NOTE: no Plugin name)\",\"Disabled\": false,\"API\": \"Convert\",\"Actions\": [\"htm\",\"html\"]},{\"Comment\": \"Disable (or not) built-in Documize API import used from SDK (NOTE: no Plugin name)\",\"Disabled\": false,\"API\": \"Convert\",\"Actions\": [\"documizeapi\"]}]');

INSERT INTO `config` VALUES ('META','{\"database\": \"migrate-00002.sql\"}');

INSERT INTO `config` VALUES ('LICENSE','{\"token\": \"\",\"endpoint\": \"https://api.documize.com\"}');

