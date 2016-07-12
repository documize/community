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
	"folderId": faker.list.cycle("VzMuyEw_3WqiafcG", "VzMygEw_3WrtFzto"),
	"userId": faker.list.cycle("VzMuyEw_3WqiafcE", "VzMuyEw_3WqiafcE"),
	"canView": true,
	"canEdit": true
});
