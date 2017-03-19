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
import netUtil from '../utils/net';

const {
	inject: { service }
} = Ember;

export default Ember.Service.extend({
	sessionService: service('session'),
    audit: service(),
	ajax: service(),
	appMeta: service(),
	keycloak: null,

	boot(options) {
        this.set('keycloak', new Keycloak(options));

        return new Ember.RSVP.Promise((resolve, reject) => {
            this.keycloak.init().success(() => {
				this.get('audit').record("initialized-keycloak");
                resolve(this.get('keycloak'));
            }).error((err) => {
                reject(err);
            });
        });
    },

	login() {
		let url = netUtil.getAppUrl(netUtil.getSubdomain()) + '/auth/keycloak?mode=login';

        return new Ember.RSVP.Promise((resolve, reject) => {
            if (this.get('keycloak').authenticated) {
                return resolve(this.get('keycloak'));
            }

            this.get('keycloak').login( {redirectUri: url} );
            return reject();
        });
    },

	fetchProfile(kc) {
        return new Ember.RSVP.Promise((resolve, reject) => {
            kc.loadUserProfile().success((profile) => {
                return resolve(profile);
            }).error((err) => {
                return reject(err);
            });
        });
    },

	mapProfile(kc, profile) {
		return {
            domain: '',
			token: kc.token,
            remoteId: is.null(profile.id) || is.undefined(profile.id) ? profile.email: profile.id,
			email: is.null(profile.email) || is.undefined(profile.email) ? '': profile.email,
			username: is.null(profile.username) || is.undefined(profile.username) ? '': profile.username,
			firstname: is.null(profile.firstName) || is.undefined(profile.firstName) ? profile.username: profile.firstName,
			lastname: is.null(profile.lastName) || is.undefined(profile.lastName) ? profile.username: profile.lastName,
			enabled: is.null(profile.enabled) || is.undefined(profile.enabled) ? true: profile.enabled
		};
	}
});
