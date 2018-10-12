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

import $ from 'jquery';
import { notEmpty } from '@ember/object/computed';
import { inject as service } from '@ember/service'
import ModalMixin from '../../mixins/modal';
import Component from '@ember/component';

export default Component.extend(ModalMixin, {
	classNames: ['layout-header', 'non-printable'],
	tagName: 'header',
	folderService: service('folder'),
	appMeta: service(),
	session: service(),
	store: service(),
	pinned: service(),
	enableLogout: true,
	hasPins: notEmpty('pins'),
	hasSpacePins: notEmpty('spacePins'),
	hasDocumentPins: notEmpty('documentPins'),
	hasWhatsNew: false,
	newsContent: '',

	init() {
		this._super(...arguments);
		let constants = this.get('constants');

		this.pins = [];

		if (this.get('appMeta.authProvider') !== constants.AuthProvider.Documize) {
			let config = this.get('appMeta.authConfig');
			config = JSON.parse(config);
			this.set('enableLogout', !config.disableLogout);
		}

		this.get('session').hasWhatsNew().then((v) => {
			this.set('hasWhatsNew', v);
		});

		let version = this.get('appMeta.version');
		let edition = this.get('appMeta.edition').toLowerCase();

		let self = this;
		let cacheBuster = + new Date();
		$.ajax({
			url: `https://storage.googleapis.com/documize/news/${edition}/${version}.html?cb=${cacheBuster}`,
			type: 'GET',
			dataType: 'html',
			success: function (response) {
				if (self.get('isDestroyed') || self.get('isDestroying')) return;
				self.set('newsContent', response);
			}
		});
	},

	didInsertElement() {
		this._super(...arguments);

		if (this.get("session.authenticated")) {
			this.eventBus.subscribe('pinChange', this, 'setupPins');
			this.setupPins();
		}
	},

	setupPins() {
		if (this.get('isDestroyed') || this.get('isDestroying')) return;

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
			let folderId = pin.get('spaceId');
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
		},

		onShowWhatsNewModal() {
			this.modalOpen("#whats-new-modal", { "show": true });

			if (this.get('newsContent.length') > 0) {
				this.get('session').seenNewVersion();
				this.set('hasWhatsNew', false);
			}
		}
	}
});
