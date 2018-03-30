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
import stringUtil from 'documize/utils/string';

module('Unit | Utility | Slug', function (hooks) {
	setupTest(hooks);

	test('english slug', function (assert) {
		let result = stringUtil.makeSlug('Hello Slug');
		assert.equal(result, 'hello-slug', 'slug: ' + result);
	});

	test('cyrillic slug', function (assert) {
		let result = stringUtil.makeSlug('Общее');
		assert.equal(result, 'obshee', 'slug: ' + result);
	});

	test('chinese slug', function (assert) {
		let result = stringUtil.makeSlug('哈威');
		assert.equal(result, '哈威', 'slug: ' + result);
	});
});
