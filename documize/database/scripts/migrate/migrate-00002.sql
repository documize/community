DROP TABLE IF EXISTS `config`;

CREATE TABLE IF NOT EXISTS  `config` (
	`area` CHAR(16) NOT NULL,
	`details` JSON,
	UNIQUE INDEX `idx_config_area` (`area` ASC) ) ;

INSERT INTO `config` VALUES ('DOCUMIZE','{\"plugin\": \"PLUGIN\"}');
INSERT INTO `config` VALUES ('PLUGIN',
'[{\"Comment\": \"Disable (or not) built-in html import (NOTE: no Plugin name)\",\"Disabled\": false,\"API\": \"Convert\",\"Actions\": [\"htm\",\"html\"]},{\"Comment\": \"Disable (or not) built-in Documize API import used from SDK (NOTE: no Plugin name)\",\"Disabled\": false,\"API\": \"Convert\",\"Actions\": [\"documizeapi\"]}]');

INSERT INTO `config` VALUES ('DATABASE','{\"last_migration\": \"migrate-00002.sql\"}');
