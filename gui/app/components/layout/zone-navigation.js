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
import netUtil from '../../utils/net';
import constants from '../../utils/constants';
import TooltipMixin from '../../mixins/tooltip';

const {
	inject: { service }
} = Ember;

export default Ember.Component.extend(TooltipMixin, {
	folderService: service('folder'),
	appMeta: service(),
	session: service(),
	store: service(),
	folder: null,
	view: {
		folder: false,
		search: false,
		settings: false,
		profile: false
	},
	pinned: service(),
	pins: [],
	enableLogout: true,

	init() {
		this._super(...arguments);

		if (this.get("session.authenticated") && this.get("session.user.id") !== '0') {
			this.get("session.accounts").forEach((account) => {
				// TODO: do not mutate account.active here
				account.active = account.orgId === this.get("appMeta.orgId");
			});
		}

		this.set('pins', this.get('pinned').get('pins'));

		if (this.get('appMeta.authProvider') === constants.AuthProvider.Keycloak) {
			let config = this.get('appMeta.authConfig');
			config = JSON.parse(config);
			this.set('enableLogout', !config.disableLogout);
		}
	},

	didReceiveAttrs() {
		if (this.get('folder') === null) {
			this.set("folder", this.get('folderService.currentFolder'));
		}

		let route = this.get('router.currentRouteName');
		this.set('view.folder', (is.startWith(route, 'folder')) ? true : false);
		this.set('view.settings', (is.startWith(route, 'customize')) ? true : false);
		this.set('view.profile', (route === 'profile') ? true : false);
		this.set('view.search', (route === 'search') ? true : false);
	},

	didInsertElement() {
		this._super(...arguments);

		// Size the pinned items zone
		if (this.get("session.authenticated")) {
			this.eventBus.subscribe('resized', this, 'sizePinnedZone');
			this.eventBus.subscribe('pinChange', this, 'setupPins');
			this.sizePinnedZone();
			this.setupPins();

			let self = this;

			var sortable = Sortable.create(document.getElementById('pinned-zone'), {
				animation: 150,
				onEnd: function () {
					self.get('pinned').updateSequence(this.toArray()).then((pins) => {
						self.set('pins', pins);
					});
				}
			});

			this.set('sortable', sortable);
		}
	},

	didRender() {
		if (this.get('session.isAdmin')) {
			this.addTooltip(document.getElementById("workspace-settings"));
		}
		if (this.get("session.authenticated") && this.get('enableLogout')) {
			this.addTooltip(document.getElementById("workspace-logout"));
		} else {
			this.addTooltip(document.getElementById("workspace-login"));
		}
		if (this.get("session.authenticated")) {
			this.addTooltip(document.getElementById("user-profile-button"));
		}
		if (this.get('session.hasAccounts')) {
			this.addTooltip(document.getElementById("accounts-button"));
		}

		this.addTooltip(document.getElementById("home-button"));
		this.addTooltip(document.getElementById("search-button"));
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

			pins.forEach((pin) => {
				this.addTooltip(document.getElementById(`pin-${pin.id}`));
			});
		});
	},

	// set height for pinned zone so ti scrolls on spill
	sizePinnedZone() {
		let topofBottomZone = parseInt($('#bottom-zone').css("top").replace("px", ""));
		let heightOfTopZone = parseInt($('#top-zone').css("height").replace("px", ""));
		let size = topofBottomZone - heightOfTopZone - 40;
		$('#pinned-zone').css('height', size + "px");
	},

	willDestroyElement() {
		let sortable = this.get('sortable');

		if (!_.isUndefined(sortable)) {
			sortable.destroy();
		}

		this.eventBus.unsubscribe('resized');
		this.eventBus.unsubscribe('pinChange');

		this.destroyTooltips();
	},

	actions: {
		switchAccount(domain) {
			window.location.href = netUtil.getAppUrl(domain);
		},

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
