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

import { test } from 'qunit';
import moduleForAcceptance from 'documize/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Anon access disabled');

test('visiting / when not authenticated and with { allowAnonymousAccess: false } takes user to login', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	visit('/');

	andThen(function () {
		assert.equal(currentURL(), '/auth/login');
		findWithAssert('#authEmail');
		findWithAssert('#authPassword');
		findWithAssert('button');
	});
});
