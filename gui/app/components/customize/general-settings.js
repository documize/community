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
	titleEmpty: computed.empty('model.general.title'),
	messageEmpty: computed.empty('model.general.message'),
	conversionEndpointEmpty: computed.empty('model.general.conversionEndpoint'),
	hasTitleInputError: computed.and('titleEmpty', 'titleError'),
	hasMessageInputError: computed.and('messageEmpty', 'messageError'),
	hasConversionEndpointInputError: computed.and('conversionEndpointEmpty', 'conversionEndpointError'),

	actions: {
		save() {
			if (isEmpty(this.get('model.general.title'))) {
				set(this, 'titleError', true);
				return $("#siteTitle").focus();
			}

			if (isEmpty(this.get('model.general.message'))) {
				set(this, 'messageError', true);
				return $("#siteMessage").focus();
			}

			if (isEmpty(this.get('model.general.conversionEndpoint'))) {
				set(this, 'conversionEndpointError', true);
				return $("#conversionEndpoint").focus();
			}

			let e = this.get('model.general.conversionEndpoint');
			if (is.endWith(e, '/')) {
				this.set('model.general.conversionEndpoint', e.substring(0, e.length-1));
			}

			this.model.general.set('allowAnonymousAccess', Ember.$("#allowAnonymousAccess").prop('checked'));

			this.get('save')().then(() => {
				set(this, 'titleError', false);
				set(this, 'messageError', false);
				set(this, 'conversionEndpointError', false);
			});
		}
	}
});
