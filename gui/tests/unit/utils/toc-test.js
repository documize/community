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

/*

Convert test to support i.get() as per toc.js

*/

// import { module, test } from 'qunit';
// import { setupTest } from 'ember-qunit';
// import toc from 'documize/utils/toc';

// module('Unit | Utility | TOC', function (hooks) {
// 	setupTest(hooks);

// 	test('toc can only move down', function (assert) {
// 		let pages = [];

// 		pages.pushObject({page: models.PageModel.create({ id: "1", level: 1, sequence: 1024 })}); //testing
// 		pages.pushObject({page: models.PageModel.create({ id: "2", level: 1, sequence: 1024 * 2 })});

// 		let state = toc.getState(pages, pages[0].page);
// 		assert.equal(state.tocTools.upTarget, '', 'Has no up target');
// 		assert.equal(state.tocTools.downTarget, '2', 'Has down target');
// 		assert.equal(state.tocTools.allowIndent, false, 'Cannot indent');
// 		assert.equal(state.tocTools.allowOutdent, false, 'Cannot outdent');
// 	});

// 	test('toc can move up or indent', function (assert) {
// 		let pages = [];

// 		pages.pushObject({page: models.PageModel.create({ id: "1", level: 1, sequence: 1024 })});
// 		pages.pushObject({page: models.PageModel.create({ id: "2", level: 1, sequence: 1024 * 2 })}); //testing

// 		let state = toc.getState(pages, pages[1].page);
// 		assert.equal(state.tocTools.upTarget, '1', 'Has up target');
// 		assert.equal(state.tocTools.downTarget, '', 'Has no down target');
// 		assert.equal(state.tocTools.allowIndent, true, 'Can indent');
// 		assert.equal(state.tocTools.allowOutdent, false, 'Cannot outdent');
// 	});

// 	test('toc can only outdent', function (assert) {
// 		let pages = [];

// 		pages.pushObject({page: models.PageModel.create({ id: "1", level: 1, sequence: 1024 })});
// 		pages.pushObject({page: models.PageModel.create({ id: "2", level: 1, sequence: 1024 * 2 })});
// 		pages.pushObject({page: models.PageModel.create({ id: "3", level: 2, sequence: 1024 * 3 })}); // testing
// 		pages.pushObject({page: models.PageModel.create({ id: "4", level: 1, sequence: 1024 * 4 })});

// 		let state = toc.getState(pages, pages[2].page);
// 		assert.equal(state.tocTools.upTarget, '', 'Has no up target');
// 		assert.equal(state.tocTools.downTarget, '', 'Has no down target');
// 		assert.equal(state.tocTools.allowIndent, false, 'Cannot indent');
// 		assert.equal(state.tocTools.allowOutdent, true, 'Can outdent');
// 	});

// 	test('toc child can move up or indent', function (assert) {
// 		let pages = [];

// 		pages.pushObject({page: models.PageModel.create({ id: "1", level: 1, sequence: 1024 })});
// 		pages.pushObject({page: models.PageModel.create({ id: "2", level: 1, sequence: 1024 * 2 })});
// 		pages.pushObject({page: models.PageModel.create({ id: "3", level: 2, sequence: 1024 * 3 })}); // testing
// 		pages.pushObject({page: models.PageModel.create({ id: "4", level: 1, sequence: 1024 * 4 })});

// 		let page = pages[3].page;
// 		let state = toc.getState(pages, page);
// 		assert.equal(state.tocTools.upTarget, '2', 'Has up target');
// 		assert.equal(state.tocTools.downTarget, '', 'Has no down target');
// 		assert.equal(state.tocTools.allowIndent, true, 'Can indent');
// 		assert.equal(state.tocTools.allowOutdent, false, 'Cannot outdent');

// 		let pendingChanges = toc.indent(state, pages, page);
// 		assert.equal(pendingChanges.length, 1, 'Has 1 pending change');
// 		assert.equal(pendingChanges[0].pageId, 4);
// 		assert.equal(pendingChanges[0].level, 2);
// 	});

// });

// test('toc top node can indent two places', function (assert) {
// 	let pages = [];

// 	pages.pushObject({page: models.PageModel.create({ id: "1", level: 1, sequence: 1024 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "2", level: 1, sequence: 1024 * 2 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "3", level: 2, sequence: 1024 * 3 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "4", level: 3, sequence: 1024 * 4 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "5", level: 1, sequence: 1024 * 5 })}); // testing

// 	let page = pages[4].page;
// 	let state = toc.getState(pages, page);
// 	assert.equal(state.tocTools.upTarget, '2', 'Has up target');
// 	assert.equal(state.tocTools.downTarget, '', 'Has no down target');
// 	assert.equal(state.tocTools.allowIndent, true, 'Can indent');
// 	assert.equal(state.tocTools.allowOutdent, false, 'Cannot outdent');

// 	let pendingChanges = toc.indent(state, pages, page);
// 	assert.equal(pendingChanges.length, 1, 'Has 1 pending change');
// 	assert.equal(pendingChanges[0].pageId, 5);
// 	assert.equal(pendingChanges[0].level, 3);
// });

// test('toc top node with kids can indent two places', function (assert) {
// 	let pages = [];

// 	pages.pushObject({page: models.PageModel.create({ id: "1", level: 1, sequence: 1024 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "2", level: 1, sequence: 1024 * 2 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "3", level: 2, sequence: 1024 * 3 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "4", level: 3, sequence: 1024 * 4 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "5", level: 1, sequence: 1024 * 5 })}); // testing
// 	pages.pushObject({page: models.PageModel.create({ id: "6", level: 2, sequence: 1024 * 6 })}); // testing
// 	pages.pushObject({page: models.PageModel.create({ id: "7", level: 3, sequence: 1024 * 7 })}); // testing

// 	let page = pages[4].page;
// 	let state = toc.getState(pages, page);
// 	assert.equal(state.tocTools.upTarget, '2', 'Has up target');
// 	assert.equal(state.tocTools.downTarget, '', 'Has no down target');
// 	assert.equal(state.tocTools.allowIndent, true, 'Can indent');
// 	assert.equal(state.tocTools.allowOutdent, false, 'Cannot outdent');

// 	let pendingChanges = toc.indent(state, pages, page);
// 	assert.equal(pendingChanges.length, 3, 'Has 1 pending change');
// 	assert.equal(pendingChanges[0].pageId, 5);
// 	assert.equal(pendingChanges[0].level, 3);
// 	assert.equal(pendingChanges[1].pageId, 6);
// 	assert.equal(pendingChanges[1].level, 4);
// 	assert.equal(pendingChanges[2].pageId, 7);
// 	assert.equal(pendingChanges[2].level, 5);
// });

// test('toc same level node with kids can indent one place', function (assert) {
// 	let pages = [];

// 	pages.pushObject({page: models.PageModel.create({ id: "1", level: 1, sequence: 1024 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "2", level: 1, sequence: 1024 * 2 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "3", level: 2, sequence: 1024 * 3 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "4", level: 2, sequence: 1024 * 4 })}); // testing
// 	pages.pushObject({page: models.PageModel.create({ id: "5", level: 3, sequence: 1024 * 5 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "6", level: 1, sequence: 1024 * 6 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "7", level: 2, sequence: 1024 * 7 })});

// 	let page = pages[3].page;
// 	let state = toc.getState(pages, page);
// 	assert.equal(state.tocTools.upTarget, '3', 'Has up target');
// 	assert.equal(state.tocTools.downTarget, '', 'Has no down target');
// 	assert.equal(state.tocTools.allowIndent, true, 'Can indent');
// 	assert.equal(state.tocTools.allowOutdent, true, 'Can outdent');

// 	let pendingChanges = toc.indent(state, pages, page);
// 	assert.equal(pendingChanges.length, 2, 'Has 2 pending changes');
// 	assert.equal(pendingChanges[0].pageId, 4);
// 	assert.equal(pendingChanges[0].level, 3);
// 	assert.equal(pendingChanges[1].pageId, 5);
// 	assert.equal(pendingChanges[1].level, 4);
// });

// test('toc child with deep tree moves correctly', function (assert) {
// 	let pages = [];

// 	pages.pushObject({page: models.PageModel.create({ id: "1", level: 1, sequence: 1024 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "2", level: 1, sequence: 1024 * 2 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "3", level: 2, sequence: 1024 * 4 })}); // testing
// 	pages.pushObject({page: models.PageModel.create({ id: "4", level: 3, sequence: 1024 * 5 })}); // testing
// 	pages.pushObject({page: models.PageModel.create({ id: "5", level: 3, sequence: 1024 * 6 })}); // testing
// 	pages.pushObject({page: models.PageModel.create({ id: "6", level: 3, sequence: 1024 * 7 })}); // testing
// 	pages.pushObject({page: models.PageModel.create({ id: "7", level: 1, sequence: 1024 * 8 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "8", level: 1, sequence: 1024 * 9 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "9", level: 1, sequence: 1024 * 10 })});

// 	let page = pages[2].page;
// 	let state = toc.getState(pages, page);

// 	assert.equal(state.tocTools.upTarget, '', 'Has no up target');
// 	assert.equal(state.tocTools.downTarget, '', 'Has no down target');
// 	assert.equal(state.tocTools.allowIndent, false, 'Cannot indent');
// 	assert.equal(state.tocTools.allowOutdent, true, 'Can outdent');

// 	let pendingChanges = toc.outdent(state, pages, page);

// 	assert.equal(pendingChanges.length, 4, 'Have 4 pending changes');
// 	assert.equal(pendingChanges[0].pageId, 3);
// 	assert.equal(pendingChanges[0].level, 1);
// 	assert.equal(pendingChanges[1].pageId, 4);
// 	assert.equal(pendingChanges[1].level, 2);
// 	assert.equal(pendingChanges[2].pageId, 5);
// 	assert.equal(pendingChanges[2].level, 2);
// 	assert.equal(pendingChanges[3].pageId, 6);
// 	assert.equal(pendingChanges[3].level, 2);
// });

// test('toc top level node skips down some', function (assert) {
// 	let pages = [];

// 	pages.pushObject({page: models.PageModel.create({ id: "1", level: 1, sequence: 110 })}); // testing
// 	pages.pushObject({page: models.PageModel.create({ id: "2", level: 1, sequence: 220 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "3", level: 2, sequence: 330 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "4", level: 3, sequence: 440 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "5", level: 3, sequence: 550 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "6", level: 3, sequence: 660 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "7", level: 1, sequence: 770 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "8", level: 1, sequence: 880 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "9", level: 1, sequence: 990 })});

// 	let page = pages[0].page;
// 	let state = toc.getState(pages, page);

// 	assert.equal(state.tocTools.upTarget, '', 'Has no up target');
// 	assert.equal(state.tocTools.downTarget, '2', 'Has down target');
// 	assert.equal(state.tocTools.allowIndent, false, 'Cannot indent');
// 	assert.equal(state.tocTools.allowOutdent, false, 'Cannot outdent');

// 	let pendingChanges = toc.moveDown(state, pages, page);

// 	assert.equal(pendingChanges.length, 1, 'Have 1 pending change');
// 	assert.equal(pendingChanges[0].pageId, 1);
// 	assert.equal(pendingChanges[0].sequence, (660 + 770) / 2);
// });

// test('toc top level node skips up some', function (assert) {
// 	let pages = [];

// 	pages.pushObject({page: models.PageModel.create({ id: "1", level: 1, sequence: 110 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "2", level: 1, sequence: 220 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "3", level: 2, sequence: 330 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "4", level: 3, sequence: 440 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "5", level: 3, sequence: 550 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "6", level: 3, sequence: 660 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "7", level: 1, sequence: 770 })}); // testing
// 	pages.pushObject({page: models.PageModel.create({ id: "8", level: 1, sequence: 880 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "9", level: 1, sequence: 990 })});

// 	let page = pages[6].page;
// 	let state = toc.getState(pages, page);
// 	assert.equal(state.tocTools.upTarget, '2', 'Has up target');
// 	assert.equal(state.tocTools.downTarget, '8', 'Has down target');
// 	assert.equal(state.tocTools.allowIndent, true, 'Can indent');
// 	assert.equal(state.tocTools.allowOutdent, false, 'Cannot outdent');

// 	let pendingChanges = toc.moveUp(state, pages, page);
// 	assert.equal(pendingChanges.length, 1, 'Has 1 pending change');
// 	assert.equal(pendingChanges[0].pageId, 7);
// 	assert.equal(pendingChanges[0].sequence, (110 + 220) / 2);
// });

// test('toc move down top node to bottom', function (assert) {
// 	let pages = [];

// 	pages.pushObject({page: models.PageModel.create({ id: "1", level: 1, sequence: 110 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "2", level: 1, sequence: 220 })});
// 	pages.pushObject({page: models.PageModel.create({ id: "3", level: 2, sequence: 330 })});

// 	let page = pages[0];
// 	let state = toc.getState(pages, page);
// 	assert.equal(state.tocTools.upTarget, '', 'Has no up target');
// 	assert.equal(state.tocTools.downTarget, '2', 'Has down target');
// 	assert.equal(state.tocTools.allowIndent, false, 'Cannot indent');
// 	assert.equal(state.tocTools.allowOutdent, false, 'Cannot outdent');

// 	let pendingChanges = toc.moveDown(state, pages, page);
// 	assert.equal(pendingChanges.length, 1, 'Has 1 pending change');
// 	assert.equal(pendingChanges[0].pageId, 1);
// 	assert.equal(pendingChanges[0].sequence, 330 * 2);
// });
