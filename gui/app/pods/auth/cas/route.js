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

import { Promise as EmberPromise } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
	ajax: service(),
	session: service(),
	appMeta: service(),
	localStorage: service(),
	queryParams: {
		mode: {
			refreshModel: true
		},
		ticket   : {
			refreshModel: true
		}
	},
	message: '',
	mode: 'login',
	afterModel(model) {
		return new EmberPromise((resolve) => {
			let constants = this.get('constants');

			if (this.get('appMeta.authProvider') !== constants.AuthProvider.CAS) {
				resolve();
			}
			let ticket = model.ticket;
			if (ticket === '') {
				resolve();
			}
			let data = {ticket: ticket};
			this.get("session").authenticate('authenticator:cas', data).then(() => {
				this.transitionTo('folders');
			}, (reject) => {
				if (!_.isUndefined(reject.Error)) {
					model.message = reject.Error;
				} else {
					model.message = reject.Error;
				}
				model.mode = 'reject';
				resolve();
			});

		})
	},

	model(params) {
		return {
			mode: this.get('mode'),
			message: this.get('message'),
			ticket: params.ticket
		}
	}
});
