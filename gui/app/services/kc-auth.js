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
import netUtil from '../utils/net';
import Service, { inject as service } from '@ember/service';

export default Service.extend({
	sessionService: service('session'),
	ajax: service(),
	appMeta: service(),
	keycloak: null,

    init() {
        this._super(...arguments);
        this.config = {};
    },

	boot() {
        return new EmberPromise((resolve, reject) => {
            if (!_.isUndefined(this.get('keycloak')) && !_.isNull(this.get('keycloak')) ) {
                resolve(this.get('keycloak'));
                return;
            }

            let keycloak = new Keycloak(JSON.parse(this.get('appMeta.authConfig')));
            this.set('keycloak', keycloak);

            // keycloak.onTokenExpired = function () {
            //     keycloak.clearToken();
            // };

            // keycloak.onAuthRefreshError = function () {
            //     keycloak.clearToken();
            // };

            this.get('keycloak').init().success(() => {
                resolve(this.get('keycloak'));
            }).error((err) => {
                reject(err);
            });
        });
    },

	login() {
        return new EmberPromise((resolve, reject) => {
            this.boot().then((keycloak) => {
                let url = netUtil.getAppUrl(netUtil.getSubdomain()) + '/auth/keycloak?mode=login';

                keycloak.login({redirectUri: url}).success(() => {
                    return resolve();
                }).error(() => {
                    return reject(new Error('login failed'));
                });
            });
        });
    },

    logout() {
        return new EmberPromise((resolve, reject) => {
            this.boot().then((keycloak) => {
                keycloak.logout(JSON.parse(this.get('appMeta.authConfig'))).success(() => {
                    this.get('keycloak').clearToken();
                    resolve();
                }).error((error) => {
                    this.get('keycloak').clearToken();
                    reject(error);
                });
            });
        });
    },

	fetchProfile() {
        return new EmberPromise((resolve, reject) => {
            this.boot().then((keycloak) => {
                keycloak.loadUserProfile().success((profile) => {
                    resolve(profile);
                }).error((err) => {
                    reject(err);
                });
            });
        });
    },

	mapProfile(profile) {
		return {
            domain: '',
			token: this.get('keycloak').token,
            remoteId: _.isNull(profile.id) || _.isUndefined(profile.id) ? profile.email: profile.id,
			email: _.isNull(profile.email) || _.isUndefined(profile.email) ? '': profile.email,
			username: _.isNull(profile.username) || _.isUndefined(profile.username) ? '': profile.username,
			firstname: _.isNull(profile.firstName) || _.isUndefined(profile.firstName) ? profile.username: profile.firstName,
			lastname: _.isNull(profile.lastName) || _.isUndefined(profile.lastName) ? profile.username: profile.lastName,
			enabled: _.isNull(profile.enabled) || _.isUndefined(profile.enabled) ? true: profile.enabled
		};
	}
});
