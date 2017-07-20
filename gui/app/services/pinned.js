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
	inject: { service }
} = Ember;

export default Ember.Service.extend({
	session: service('session'),
	ajax: service(),
	appMeta: service(),
	store: service(),
	pins: [],
	initialized: false,

	getUserPins() {
		let userId = this.get('session.user.id');

		return this.get('ajax').request(`pin/${userId}`, {
			method: 'GET'
		}).then((response) => {
			if (is.not.array(response)) {
				response = [];
			}
			let pins = Ember.ArrayProxy.create({
				content: Ember.A([])
			});

			pins = response.map((pin) => {
				let data = this.get('store').normalize('pin', pin);
				return this.get('store').push(data);
			});

			this.set('pins', pins);
			this.set('initialized', true);

			return pins;
		});
	},

	// Pin an item.
	pinItem(data) {
		let userId = this.get('session.user.id');

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
				if (is.not.array(response)) {
					response = [];
				}
				let pins = Ember.ArrayProxy.create({
					content: Ember.A([])
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
		let userId = this.get('session.user.id');

		if (this.get('initialized') === false) {
			this.getUserPins().then(() => {
				let pins = this.get('pins');
				let pinId = '';

				pins.forEach((pin) => {
					if (pin.get('userId') === userId && pin.get('documentId') === documentId) {
						pinId = pin.get('id');
					}
				});

				return pinId;
			});
		} else {
			let pins = this.get('pins');
			let pinId = '';

			pins.forEach((pin) => {
				if (pin.get('userId') === userId && pin.get('documentId') === documentId) {
					pinId = pin.get('id');
				}
			});

			return pinId;
		}
	},

	isSpacePinned(spaceId) {
		let userId = this.get('session.user.id');
		let pins = this.get('pins');
		let pinId = '';

		pins.forEach((pin) => {
			if (pin.get('userId') === userId && pin.get('documentId') === '' && pin.get('folderId') === spaceId) {
				pinId = pin.get('id');
			}
		});

		return pinId;
	}
});
