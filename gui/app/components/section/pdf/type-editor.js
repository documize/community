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
    pdfOption: null,
    pdfName: '',

	init() {
        this._super(...arguments);
        this.pdfOption = {};
    },

    didReceiveAttrs() {
        this._super();

		let pdfOption = {};

		try {
			pdfOption = JSON.parse(this.get('meta.config'));
		} catch (e) {} // eslint-disable-line no-empty

		if (_.isEmpty(pdfOption)) {
			pdfOption = {
				height: 600,
				sidebar: 'none', // none, bookmarks, thumbs
                startPage: 1,
                fileId: ''
			};
		}

        this.set('pdfOption', pdfOption);
        this.setPDF();
    },

    didUpdateAttrs() {
        this._super(...arguments);
        this.setPDF();
    },

    setPDF() {
        let files = this.get('attachments');
        this.set('pdfName', '');
        this.set('pdfOption.fileId', '');

        if (!_.isArray(files)) return;

        for (let i=0; i < files.length; i++) {
            if (_.endsWith(files[i].get('extension'), 'pdf') &&
                files[i].get('pageId') === this.get('page.id')) {
                this.set('pdfName', files[i].get('filename'));
                this.set('pdfOption.fileId', files[i].get('id'));
                break;
            }
        }
    },

    actions: {
        onSetSidebar(e) {
            this.set('pdfOption.sidebar', e);
        },

        isDirty() {
            return this.get('isDirty');
        },

        onCancel() {
            let cb = this.get('onCancel');
            cb();
        },

        onAction(title) {
            let config = this.get('pdfOption');
            let page = this.get('page');
            let meta = this.get('meta');

            page.set('title', title);
            page.set('body', JSON.stringify(config));
            meta.set('config', JSON.stringify(config));
            meta.set('rawBody', JSON.stringify(config));

            let cb = this.get('onAction');
            cb(page, meta);
        }
    }
});
