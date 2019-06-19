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

import stringUtil from '../../utils/string';
import $ from 'jquery';
import { empty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
	appMeta: service(),
	buttonLabel: 'Complete setup',
	hasTitleError: empty('model.title'),
	hasFirstnameError: empty('model.firstname'),
	hasLastnameError: empty('model.lastname'),
	hasEmailError: empty('model.email'),
	hasPasswordError: empty('model.password'),
	hasKeyError: empty('model.activationKey'),

	actions: {
		save () {
			if (this.get('hasTitleError')) return $("#setup-title").focus();
			if (this.get('hasFirstnameError')) return $("#setup-firstname").focus();
			if (this.get('hasLastnameError'))  return $("#setup-lastname").focus();
			if (this.get('hasEmailError') || !stringUtil.isEmail(this.get('model.email'))) return $("#setup-email").focus();
			if (this.get('hasPasswordError')) return $("#new-password").focus();

			if (this.get('model.edition') === this.get('constants').Product.EnterpriseEdition && this.get('hasKeyError')) {
				return $("#activation-key").focus();
			}

			this.set('buttonLabel', 'Setting up, please wait...');

			this.get('save')();
		}
	}
});
