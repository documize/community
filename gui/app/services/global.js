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
	router: service(),

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


	// Returns product subscription.
	getSubscription() {
		if(this.get('sessionService.isAdmin')) {
			return this.get('ajax').request(`subscription`, {
				method: 'GET',
				dataType: 'JSON'
			}).then((response) => {
				return response;
			});
		}
	},

	// Returns product license.
	getLicense() {
		if(this.get('sessionService.isAdmin')) {
			return this.get('ajax').request(`license`, {
				method: 'GET',
				dataType: "text"
			}).then((response) => {
				return response;
			});
		}
	},

	// Saves product subscription data.
	setLicense(license) {
		if(this.get('sessionService.isAdmin')) {
			return this.get('ajax').request(`license`, {
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

	// Run backup.
	backup(spec) {
		return new EmberPromise((resolve, reject) => {
			if (!this.get('sessionService.isGlobalAdmin') && !this.get('sessionService.isAdmin')) {
				reject();
			}

			let url = this.get('appMeta.endpoint');
			let token = this.get('sessionService.session.content.authenticated.token');
			let uploadUrl = `${url}/global/backup?token=${token}`;

			let xhr = new XMLHttpRequest();
			xhr.open('POST', uploadUrl);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.responseType = 'blob';

			xhr.onload = function() {
				if (this.status === 200) {
					// get binary data as a response
					let blob = this.response;

					let a = document.createElement("a");
					a.style = "display: none";
					document.body.appendChild(a);

					let filename = xhr.getResponseHeader('x-documize-filename').replace('"', '');

					let url = window.URL.createObjectURL(blob);
					a.href = url;
					a.download = filename;
					a.click();

					window.URL.revokeObjectURL(url);
					document.body.removeChild(a);

					resolve(filename);
				} else {
					reject();
				}
			};

			xhr.onerror= function() {
				reject();
			};

			xhr.send(JSON.stringify(spec));
		});
	},

	restore(spec, file) {
		let data = new FormData();
		data.set('restore-file', file);

		return new EmberPromise((resolve, reject) => {
			if (!this.get('sessionService.isGlobalAdmin') && !this.get('sessionService.isAdmin')) {
				reject();
			}

			let url = this.get('appMeta.endpoint');
			let token = this.get('sessionService.session.content.authenticated.token');
			let uploadUrl = `${url}/global/restore?token=${token}&org=${spec.overwriteOrg}&users=${spec.recreateUsers}`;

			let xhr = new XMLHttpRequest();
			xhr.open('POST', uploadUrl);

			xhr.onload = function() {
				if (this.status === 200) {
					resolve();
				} else {
					reject();
				}
			};

			xhr.onerror= function() {
				reject();
			};

			xhr.send(data);
		});
	},

	deactivate(comment) {
		if(this.get('sessionService.isAdmin')) {
			return this.get('ajax').request(`deactivate`, {
				method: 'POST',
				contentType: 'text',
				data: comment,
			});
		}
	},

	onboard() {
		return this.get('ajax').request(`setup/onboard`, {
			method: 'POST',
		});
	}
});
