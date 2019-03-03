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

import { A } from '@ember/array';
import ArrayProxy from '@ember/array/proxy';
import RSVP, { Promise as EmberPromise } from 'rsvp';
import Service, { inject as service } from '@ember/service';

export default Service.extend({
	session: service('session'),
	ajax: service(),
	appMeta: service(),
	store: service(),
	initialized: false,

	init() {
		this._super(...arguments);
		this.pins = [];
	},

	getUserPins() {
		let userId = this.get('session.user.id');

		if (!this.get('session.authenticated')) {
			return new RSVP.resolve(A([]));
		}
		if (this.get('initialized')) {
			return new RSVP.resolve(this.get('pins'));
		}

		return this.get('ajax').request(`pin/${userId}`, {
			method: 'GET'
		}).then((response) => {
			if (!_.isArray(response)) response = [];
			let pins = ArrayProxy.create({ content: A([]) });

			pins = response.map((pin) => {
				let data = this.get('store').normalize('pin', pin);
				return this.get('store').push(data);
			});

			this.set('initialized', true);
			this.set('pins', pins);

			return pins;
		});
	},

	// Pin an item.
	pinItem(data) {
		let userId = this.get('session.user.id');

		this.set('initialized', false);

		if(this.get('session.authenticated')) {
			return this.get('ajax').request(`pin/${userId}`, {
				method: 'POST',
				data: JSON.stringify(data)
			}).then((response) => {
				let data = this.get('store').normalize('pin', response);
				return this.get('store').push(data);
			});
		}
	},

	// Unpin an item.
	unpinItem(pinId) {
		let userId = this.get('session.user.id');

		this.set('initialized', false);

		if(this.get('session.authenticated')) {
			return this.get('ajax').request(`pin/${userId}/${pinId}`, {
				method: 'DELETE'
			});
		}
	},

	// updateSequence persists order after use drag-drop sorting.
	updateSequence(data) {
		let userId = this.get('session.user.id');

		if(this.get('session.authenticated')) {
			return this.get('ajax').request(`pin/${userId}/sequence`, {
				method: 'POST',
				data: JSON.stringify(data)
			}).then((response) => {
				if (!_.isArray(response)) response = [];

				let pins = ArrayProxy.create({
					content: A([])
				});

				pins = response.map((pin) => {
					let data = this.get('store').normalize('pin', pin);
					return this.get('store').push(data);
				});

				this.set('pins', pins);

				return pins;
			});
		}
	},

	isDocumentPinned(documentId) {
		return new EmberPromise((resolve, reject) => { // eslint-disable-line no-unused-vars
			let userId = this.get('session.user.id');

			return this.getUserPins().then((pins) => {
				pins.forEach((pin) => {
					if (pin.get('userId') === userId && pin.get('documentId') === documentId) {
						resolve(pin.get('id'));
					}
				});

				resolve('');
			});
		});
	},

	isSpacePinned(spaceId) {
		return new EmberPromise((resolve, reject) => { // eslint-disable-line no-unused-vars
			let userId = this.get('session.user.id');

			return this.getUserPins().then((pins) => {
				pins.forEach((pin) => {
					if (pin.get('userId') === userId && pin.get('documentId') === '' && pin.get('spaceId') === spaceId) {
						resolve(pin.get('id'));
					}
				});

				resolve('');
			});
		});
	}
});
