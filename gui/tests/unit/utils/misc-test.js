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

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import misc from 'documize/utils/misc';

module('Unit | Utility | Version', function (hooks) {
	setupTest(hooks);

	test('version cleaned and same', function (assert) {
		let result = misc.isNewVersion(' v1.0.0 ', ' v 1.0.0 ', false);
		assert.equal(result, false, 'version cleaned and same');
	});

	test('version migration', function (assert) {
		let result = misc.isNewVersion('', 'v1.0.0', false);
		assert.equal(result, true, 'version migration');
	});

	test('version same', function (assert) {
		let result = misc.isNewVersion('v1.0.0', 'v1.0.0', false);
		assert.equal(result, false, 'version same');
	});

	test('version.major different', function (assert) {
		let result = misc.isNewVersion('v1.0.0', 'v2.0.0', false);
		assert.equal(result, true, 'version.major different');
	});

	test('version.minor different', function (assert) {
		let result = misc.isNewVersion('v2.1.0', 'v2.2.0', false);
		assert.equal(result, true, 'version.minor different');
	});

	test('version.revision different ignore', function (assert) {
		let result = misc.isNewVersion('v2.2.0', 'v2.2.1', false);
		assert.equal(result, false, 'version.revision different ignore');
	});

	test('version.revision different check', function (assert) {
		let result = misc.isNewVersion('v2.2.0', 'v2.2.1', true);
		assert.equal(result, true, 'version.revision different check');
	});
});
