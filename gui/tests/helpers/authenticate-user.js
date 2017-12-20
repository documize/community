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

import { registerAsyncHelper } from '@ember/test';

import { merge } from '@ember/polyfills';
import { authenticateSession } from 'documize/tests/helpers/ember-simple-auth';

export default registerAsyncHelper('authenticateUser', function (app, attrs = {}) {
	authenticateSession(app, merge({
		token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb21haW4iOiIiLCJleHAiOjE0NjQwMjM2NjcsImlzcyI6IkRvY3VtaXplIiwib3JnIjoiVnpNdXlFd18zV3FpYWZjRCIsInN1YiI6IndlYmFwcCIsInVzZXIiOiJWek11eUV3XzNXcWlhZmNFIn0.NXZ6bo8mtvdZF_b9HavbidVUJqhmBA1zr0fSAPvbah0",
		user: {
			"id": "VzMuyEw_3WqiafcE",
			"created": "2016-05-11T15:08:24Z",
			"revised": "2016-05-11T15:08:24Z",
			"firstname": "Lennex",
			"lastname": "Zinyando",
			"email": "brizdigital@gmail.com",
			"initials": "LZ",
			"active": true,
			"editor": true,
			"admin": true,
			"accounts": [{
				"id": "VzMuyEw_3WqiafcF",
				"created": "2016-05-11T15:08:24Z",
				"revised": "2016-05-11T15:08:24Z",
				"admin": true,
				"editor": true,
				"userId": "VzMuyEw_3WqiafcE",
				"orgId": "VzMuyEw_3WqiafcD",
				"company": "EmberSherpa",
				"title": "EmberSherpa",
				"message": "This Documize instance contains all our team documentation",
				"domain": ""
			}]
		}
	}, attrs));
});