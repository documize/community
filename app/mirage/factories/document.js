// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
	"id": faker.list.cycle("VzMwX0w_3WrtFztd", "VzMvJEw_3WqiafcI", "VzMzBUw_3WrtFztv"),
	"created": "2016-05-11T13:15:11Z",
	"revised": "2016-05-11T13:22:16Z",
	"orgId": "VzMuyEw_3WqiafcD",
	"folderId": "VzMuyEw_3WqiafcG",
	"userId": "VzMuyEw_3WqiafcE",
	"job": faker.list.cycle("", "0bf9b076-cb74-4e8e-75be-8ee2d24a8171", "3004c449-b053-49a6-4abc-72688136184d"),
	"location": faker.list.cycle("template-0", "/var/folders/README.md", "/var/folders/d6/3004c449-b053-49a6-4abc-72688136184d/README.md"),
	"name": faker.list.cycle("Empty Document", "README", "README"),
	"excerpt": faker.list.cycle("My test document", "To Document/ Instructions. GO. go- bindata- assetsfs. SSL.", "To Document/ Instructions. GO. go- bindata- assetsfs. SSL."),
	"tags": "",
	"template": false
});
