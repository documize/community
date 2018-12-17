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
	classNames: ['hashtags'],

	init() {
		this._super(...arguments);
        let tagz = [];

        if (this.get('documentTags').length > 1) {
            let tags = this.get('documentTags').split('#');
            _.each(tags, function(tag) {
                if (tag.length > 0) {
                    tagz.pushObject(tag);
                }
            });
        }

        this.set('tagz', tagz);
    },

    actions: {
        filterByTag(tag) {
            this.get('filterByTag')(tag);
        }
    }
});
