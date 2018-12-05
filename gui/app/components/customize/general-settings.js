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
import { empty, and } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import { set } from '@ember/object';
import { inject as service } from '@ember/service';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(Notifier, {
	appMeta: service(),
	maxTags: 3,
	titleEmpty: empty('model.general.title'),
	messageEmpty: empty('model.general.message'),
	conversionEndpointEmpty: empty('model.general.conversionEndpoint'),
	hasTitleInputError: and('titleEmpty', 'titleError'),
	hasMessageInputError: and('messageEmpty', 'messageError'),
	hasConversionEndpointInputError: and('conversionEndpointEmpty', 'conversionEndpointError'),

	didReceiveAttrs() {
		this._super(...arguments);
		this.set('maxTags', this.get('model.general.maxTags'));
	},

	actions: {
		change() {
            const selectEl = this.$('#maxTags')[0];
            const selection = selectEl.selectedOptions[0].value;

			this.set('maxTags', parseInt(selection));
        },

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

			this.set('model.general.maxTags', this.get('maxTags'));
			this.model.general.set('allowAnonymousAccess', $("#allowAnonymousAccess").prop('checked'));

			this.get('save')().then(() => {
				this.notifySuccess('Saved');
				set(this, 'titleError', false);
				set(this, 'messageError', false);
				set(this, 'conversionEndpointError', false);
			});
		},

		onThemeChange(theme) {
			this.get('appMeta').setTheme(theme);
			this.set('model.general.theme', theme);
		}
	}
});
