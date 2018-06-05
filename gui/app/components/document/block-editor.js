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

import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
	store: service(),

    didReceiveAttrs() {
		let p = this.get('store').createRecord('page');
		let m = this.get('store').createRecord('pageMeta');

		p.set('id', this.get('block.id'));
		p.set('orgId', this.get('block.orgId'));
		p.set('documentId', 'dummy');
		p.set('contentType', this.get('block.contentType'));
		p.set('pageType', this.get('block.pageType'));
		p.set('title', this.get('block.title'));
		p.set('body', this.get('block.body'));
		p.set('rawBody', this.get('block.rawBody'));
		p.set('excerpt', this.get('block.excerpt'));

		m.set('pageId', this.get('block.id'));
		m.set('orgId', this.get('block.orgId'));
		m.set('documentId', 'dummy');
		m.set('rawBody', this.get('block.rawBody'));
		m.set('config', this.get('block.config'));
		m.set('externalSource', this.get('block.externalSource'));

		this.set('page', p);
		this.set('meta', m);

        this.set('editorType', 'section/' + this.get('block.contentType') + '/type-editor');
    },

    actions: {
        onCancel() {
			let cb = this.get('onCancel');
			cb();
        },

        onAction(page, meta) {
			let cb = this.get('onAction');
			cb(page, meta);
        }
    }
});
