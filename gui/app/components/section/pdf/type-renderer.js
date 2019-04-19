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
    appMeta: service(),
	session: service(),

    // PDF URL is calculated
    pdfUrl: '',

    // https://github.com/mozilla/pdf.js/wiki/Viewer-options
    viewHeight: 700,
    startPage: 1,
    pageMode: 'none', // none, bookmarks, thumbs

    didReceiveAttrs() {
        this._super(...arguments);

        if (this.get('isDestroyed') || this.get('isDestroying')) {
            return;
        }

		let pdfOption = {};

		try {
			pdfOption = JSON.parse(this.get('page.body'));
		} catch (e) {} // eslint-disable-line no-empty

		if (_.isEmpty(pdfOption)) {
			pdfOption = {
				height: 600,
				sidebar: 'none', // none, bookmarks, thumbs
                startPage: 1,
			};
		}

        this.set('pdfOption', pdfOption);

        let endpoint = this.get('appMeta.endpoint');
        let orgId = this.get('appMeta.orgId');
        let fileId = this.get('pdfOption.fileId');

        if (_.isEmpty(fileId)) {
            return;
        }

		// For authenticated users we send server auth token.
		let qry = '';
		if (this.get('session.hasSecureToken')) {
			qry = '?secure=' + this.get('session.secureToken');
		} else if (this.get('session.authenticated')) {
			qry = '?token=' + this.get('session.authToken');
		}

        this.set('pdfUrl', encodeURIComponent(`${endpoint}/public/attachment/${orgId}/${fileId}${qry}`));
    },

    didInsertElement() {
        this._super(...arguments);

        if (this.get('isDestroyed') || this.get('isDestroying')) {
            return;
        }
	},

    willDestroyElement() {
        this._super(...arguments);
    }
});
