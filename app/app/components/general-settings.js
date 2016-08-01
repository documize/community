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

import Ember from 'ember';

const {
	isEmpty,
	computed,
	set
} = Ember;

export default Ember.Component.extend({
	titleEmpty: computed.empty('model.title'),
	messageEmpty: computed.empty('model.message'),
	hasTitleInputError: computed.and('titleEmpty', 'titleError'),
	hasMessageInputError: computed.and('messageEmpty', 'messageError'),

	actions: {
		save() {
			if (isEmpty(this.get('model.title'))) {
				set(this, 'titleError', true);
				return $("#siteTitle").focus();
			}

			if (isEmpty(this.get('model.message'))) {
				set(this, 'messageError', true);
				return $("#siteMessage").focus();
			}

			this.model.set('allowAnonymousAccess', Ember.$("#allowAnonymousAccess").prop('checked'));
			this.get('save')().then(() => {
				set(this, 'titleError', false);
				set(this, 'messageError', false);
			});
		}
	}
});
