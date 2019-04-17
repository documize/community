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

import Component from '@ember/component';

export default Component.extend({
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

        let page = this.get('page');
        let rawBody = page.get('body');

        this.set('pdfUrl', encodeURIComponent('https://demo.test:5001/api/public/attachment/4Tec34w8/bhird7crtr314et90n7g?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb21haW4iOiJkZW1vIiwiZXhwIjoxNTg2MzQ1ODA2LCJpc3MiOiJEb2N1bWl6ZSIsIm9yZyI6IjRUZWMzNHc4Iiwic3ViIjoid2ViYXBwIiwidXNlciI6ImlKZGY2cVVXIn0.YPrf_xlNJZVK1Ikt3S0HJagIqqnVjxwepUVQ44VYXR4'));
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
