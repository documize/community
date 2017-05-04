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
import TooltipMixin from '../../mixins/tooltip';
import NotifierMixin from '../../mixins/notifier';
import AuthMixin from '../../mixins/auth';

const {
	inject: { service }
} = Ember;

export default Ember.Component.extend(TooltipMixin, NotifierMixin, AuthMixin, {
	folderService: service('folder'),
	templateService: service('template'),
	appMeta: service(),
	pinned: service(),
	publicFolders: [],
	protectedFolders: [],
	privateFolders: [],
	hasPublicFolders: false,
	hasProtectedFolders: false,
	hasPrivateFolders: false,
	newFolder: "",
	menuOpen: false,
	pinState : {
		isPinned: false,
		pinId: '',
		newName: '',
	},
	tab: '',

	init() {
		this._super(...arguments);

		if (is.empty(this.get('tab')) || is.undefined(this.get('tab'))) {
			this.set('tab', 'index');
		}
	},

	didReceiveAttrs() {
		if (!this.get('noFolder')) {
			let folder = this.get('folder');
			this.set('pinState.pinId', this.get('pinned').isSpacePinned(folder.get('id')));
			this.set('pinState.isPinned', this.get('pinState.pinId') !== '');
			this.set('pinState.newName', folder.get('name').substring(0,3).toUpperCase());		
		}
	},

	actions: {
		onFolderAdd(folderName) {
			this.attrs.onFolderAdd(folderName);
			return true;
		},

		onChangeTab(tab) {
			this.set('tab', tab);
		},

		onMenuOpen() {
			this.set('menuOpen', !this.get('menuOpen'));
		},

		onUnpin() {
			this.get('pinned').unpinItem(this.get('pinState.pinId')).then(() => {
				this.set('pinState.isPinned', false);
				this.set('pinState.pinId', '');
				this.eventBus.publish('pinChange');
			});
		},

		onPin() {
			let pin = {
				pin: this.get('pinState.newName'),
				documentId: '',
				folderId: this.get('folder.id')
			};

			if (is.empty(pin.pin)) {
				$('#pin-space-name').addClass('error').focus();
				return false;
			}

			this.get('pinned').pinItem(pin).then((pin) => {
				this.set('pinState.isPinned', true);
				this.set('pinState.pinId', pin.get('id'));
				this.eventBus.publish('pinChange');
			});

			return true;
		},
	}
});
