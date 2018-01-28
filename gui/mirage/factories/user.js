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
	"id": faker.list.cycle("VzMyp0w_3WrtFztq", "VzMuyEw_3WqiafcE"),
	"created": faker.list.cycle("2016-05-11T13:24:55Z", "2016-05-11T15:08:24Z"),
	"revised": faker.list.cycle("2016-05-11T13:33:47Z", "2016-05-11T15:08:24Z"),
	"firstname": faker.list.cycle("Len", "Lennex"),
	"lastname": faker.list.cycle("Random", "Zinyando"),
	"email": faker.list.cycle("zinyando@gmail.com", "brizdigital@gmail.com"),
	"initials": faker.list.cycle("LR", "LZ"),
	"active": true,
	"editor": true,
	"admin": faker.list.cycle(false, true),
	"accounts": [{ // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		"id": faker.list.cycle("VzMyp0w_3WrtFztr", "VzMuyEw_3WqiafcF"),
		"created": faker.list.cycle("2016-05-11T13:24:55Z", "2016-05-11T15:08:24Z"),
		"revised": faker.list.cycle("2016-05-11T13:24:55Z", "2016-05-11T15:08:24Z"),
		"admin": faker.list.cycle(false, true),
		"editor": faker.list.cycle(true, true),
		"userId": faker.list.cycle("VzMyp0w_3WrtFztq", "VzMuyEw_3WqiafcE"),
		"orgId": faker.list.cycle("VzMuyEw_3WqiafcD", "VzMuyEw_3WqiafcD"),
		"company": "EmberSherpa",
		"title": "EmberSherpa",
		"message": "This Documize instance contains all our team documentation",
		"domain": ""
	}] 
});
