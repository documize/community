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

import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
    isDirty: false,
    pageBody: '',
	editorId: computed('page', function () {
		let page = this.get('page');
		return `pdf-editor-${page.id}`;
	}),

	init() {
        this._super(...arguments);
        this.set('pageBody', this.get('meta.rawBody'));
    },

    didInsertElement() {
        this._super(...arguments);
    },

    willDestroyElement() {
        this._super(...arguments);
    },

    actions: {
        isDirty() {
            return this.get('isDirty');
        },

        onCancel() {
            let cb = this.get('onCancel');
            cb();
        },

        onAction(title) {
            let page = this.get('page');
            let meta = this.get('meta');
            meta.set('rawBody', '');
            page.set('title', title);
            page.set('body', meta.get('rawBody'));

            let cb = this.get('onAction');
            cb(page, meta);
        }
    }
});
