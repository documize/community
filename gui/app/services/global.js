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

import Service, { inject as service } from '@ember/service';

export default Service.extend({
	sessionService: service('session'),
	ajax: service(),
	appMeta: service(),
	store: service(),

	// Returns SMTP configuration.
	getSMTPConfig() {
		if(this.get('sessionService.isGlobalAdmin')) {
			return this.get('ajax').request(`global/smtp`, {
				method: 'GET'
			}).then((response) => {
				return response;
			});
		}
	},

	// Saves SMTP configuration.
	saveSMTPConfig(config) {
		if(this.get('sessionService.isGlobalAdmin')) {
			return this.get('ajax').request(`global/smtp`, {
				method: 'PUT',
				data: JSON.stringify(config)
			});
		}
	},

	// Returns product license.
	getLicense() {
		if(this.get('sessionService.isGlobalAdmin')) {
			return this.get('ajax').request(`global/license`, {
				method: 'GET',
				dataType: "text"
			}).then((response) => {
				return response;
			});
		}
	},

	// Saves product license.
	saveLicense(license) {
		if(this.get('sessionService.isGlobalAdmin')) {
			return this.get('ajax').request(`global/license`, {
				method: 'PUT',
				dataType: 'text',
				data: license
			});
		}
	},

	// Returns auth config for Documize instance.
	getAuthConfig() {
		if(this.get('sessionService.isGlobalAdmin')) {
			return this.get('ajax').request(`global/auth`, {
				method: 'GET'
			}).then((response) => {
				return response;
			});
		}
	},	

	// Saves auth config for Documize instance.
	saveAuthConfig(config) {
		if(this.get('sessionService.isGlobalAdmin')) {
			return this.get('ajax').request(`global/auth`, {
				method: 'PUT',
				data: JSON.stringify(config)
			});
		}
	},

	syncExternalUsers() {
		if(this.get('sessionService.isAdmin')) {
			return this.get('ajax').request(`users/sync`, {
				method: 'GET'
			}).then((response) => {
				return response;
			}).catch((error) => {
				return error;
			});
		}
	},
});
