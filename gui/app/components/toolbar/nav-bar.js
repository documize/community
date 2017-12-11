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

import Component from '@ember/component';
import { notEmpty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import constants from '../../utils/constants';

export default Component.extend({
	folderService: service('folder'),
	appMeta: service(),
	session: service(),
	store: service(),
	pinned: service(),
	enableLogout: true,
	pins: [],
	hasPins: notEmpty('pins'),
	hasSpacePins: notEmpty('spacePins'),
	hasDocumentPins: notEmpty('documentPins'),

	init() {
		this._super(...arguments);

		if (this.get('appMeta.authProvider') === constants.AuthProvider.Keycloak) {
			let config = this.get('appMeta.authConfig');
			config = JSON.parse(config);
			this.set('enableLogout', !config.disableLogout);
		}
	},

	didInsertElement() {
		this._super(...arguments);

		if (this.get("session.authenticated")) {
			this.eventBus.subscribe('pinChange', this, 'setupPins');
			this.setupPins();
		}
	},

	setupPins() {
		if (this.get('isDestroyed') || this.get('isDestroying')) {
			return;
		}

		this.get('pinned').getUserPins().then((pins) => {
			if (this.get('isDestroyed') || this.get('isDestroying')) {
				return;
			}
			this.set('pins', pins);
			this.set('spacePins', pins.filterBy('isSpace', true));
			this.set('documentPins', pins.filterBy('isDocument', true));
		});
	},

	willDestroyElement() {
		this._super(...arguments);

		this.eventBus.unsubscribe('pinChange');
	},

	actions: {
		jumpToPin(pin) {
			let folderId = pin.get('folderId');
			let documentId = pin.get('documentId');

			if (_.isEmpty(documentId)) {
				// jump to space
				let folder = this.get('store').peekRecord('folder', folderId);
				this.get('router').transitionTo('folder', folderId, folder.get('slug'));
			} else {
				// jump to doc
				let folder = this.get('store').peekRecord('folder', folderId);
				this.get('router').transitionTo('document', folderId, folder.get('slug'), documentId, 'document');
			}
		}
	}
});
