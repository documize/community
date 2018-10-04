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
import Service, { inject as service } from '@ember/service';

export default Service.extend({
	sessionService: service('session'),
	ajax: service(),
	appMeta: service(),
	browserSvc: service('browser'),
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

	syncKeycloak() {
		if(this.get('sessionService.isAdmin')) {
			return this.get('ajax').request(`global/sync/keycloak`, {
				method: 'GET'
			}).then((response) => {
				return response;
			}).catch((error) => {
				return error;
			});
		}
	},

	syncLDAP() {
		if(this.get('sessionService.isAdmin')) {
			return this.get('ajax').request(`global/ldap/sync`, {
				method: 'GET'
			}).then((response) => {
				return response;
			}).catch((error) => {
				return error;
			});
		}
	},

	previewLDAP(config) {
		if(this.get('sessionService.isAdmin')) {
			return this.get('ajax').request(`global/ldap/preview`, {
				method: 'POST',
				data: JSON.stringify(config)
			}).then((response) => {
				return response;
			}).catch((error) => {
				return error;
			});
		}
	},

	// Returns product license.
	searchStatus() {
		if (this.get('sessionService.isGlobalAdmin')) {
			return this.get('ajax').request(`global/search/status`, {
				method: 'GET',
			}).then((response) => {
				return response;
			});
		}
	},

	// Saves product license.
	reindex() {
		if (this.get('sessionService.isGlobalAdmin')) {
			return this.get('ajax').request(`global/search/reindex`, {
				method: 'POST',
			});
		}
	},

	// Run tenant level backup.
	backup(spec) {

		return new EmberPromise((resolve) => {
			let url = this.get('appMeta.endpoint');
			let token = this.get('sessionService.session.content.authenticated.token');
			let uploadUrl = `${url}/global/backup?token=${token}`;

			var xhr = new XMLHttpRequest();
			xhr.open('POST', uploadUrl);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.responseType = 'blob';

			xhr.onload = function() {
				if (this.status == 200) {
					// get binary data as a response
					var blob = this.response;

					let a = document.createElement("a");
					a.style = "display: none";
					document.body.appendChild(a);

					let url = window.URL.createObjectURL(blob);
					a.href = url;
					a.download = xhr.getResponseHeader('x-documize-filename').replace('"', '');
					a.click();

					window.URL.revokeObjectURL(url);
					document.body.removeChild(a);

					resolve();
				}
			}

			xhr.send(JSON.stringify(spec));
		});

		// return this.get('ajax').raw(`global/backup`, {
		// 	method: 'post',
		// 	data: JSON.stringify(spec),
		// 	contentType: 'json',
		// 	dataType: 'text'
		// });
	}
});
