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

import $ from 'jquery';
import Service, { inject as service } from '@ember/service';
import { schedule } from '@ember/runloop';

export default Service.extend({
    sessionService: service('session'),

    init() {
        this._super(...arguments);
        this.setMetaDescription();
    },

    setTitle(title) {
        document.title = title + " | " + this.get('sessionService.appMeta.title');
    },

    setTitleAsPhrase(title) {
        document.title = this.get('sessionService.appMeta.title') + " " + title;
    },

    setTitleWithoutSuffix(title) {
        document.title = title;
    },

    setMetaDescription(description) {
        $('meta[name=description]').remove();

        if (is.null(description) || is.undefined(description)) {
            description = this.get('sessionService.appMeta.message');
        }

        $('head').append('<meta name="description" content="' + description + '">');
    },

    scrollTo(id) {
        schedule('afterRender', () => {
            let elem = $(id).offset();
            if (is.undefined(elem)) return;

            $('html, body').animate({
                scrollTop: elem.top
            }, 250);
        });
	},

	downloadFile(content, filename) {
		let b = new Blob([content], {
			type: 'text/html'
		});

		const data = window.URL.createObjectURL(b);
		var link = document.createElement('a');
		link.href = data;
		link.download = filename;
		link.click();

		// For Firefox it is necessary to delay revoking the ObjectURL
		setTimeout(function() { window.URL.revokeObjectURL(data), 100});
	}
});
