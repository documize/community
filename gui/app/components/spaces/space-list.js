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

import NotifierMixin from '../../mixins/notifier';
import AuthMixin from '../../mixins/auth';
import Component from '@ember/component';

export default Component.extend(NotifierMixin, AuthMixin, {
	hasPublicFolders: false,
	hasProtectedFolders: false,
	hasPrivateFolders: false,

	init() {
		this._super(...arguments);
		this.publicFolders = [];
		this.protectedFolders = [];
		this.privateFolders = [];
	},

	didReceiveAttrs() {
		this._super(...arguments);

		let constants = this.get('constants');
		let folders = this.get('spaces');
		let publicFolders = [];
		let protectedFolders = [];
		let privateFolders = [];

		_.each(folders, folder => {
			if (folder.get('spaceType') === constants.SpaceType.Public) {
				publicFolders.pushObject(folder);
			}
			if (folder.get('spaceType') === constants.SpaceType.Private) {
				privateFolders.pushObject(folder);
			}
			if (folder.get('spaceType') === constants.SpaceType.Protected) {
				protectedFolders.pushObject(folder);
			}
		});

		this.set('publicFolders', publicFolders);
		this.set('protectedFolders', protectedFolders);
		this.set('privateFolders', privateFolders);
		this.set('hasPublicFolders', this.get('publicFolders.length') > 0);
		this.set('hasPrivateFolders', this.get('privateFolders.length') > 0);
		this.set('hasProtectedFolders', this.get('protectedFolders.length') > 0);
	},

	actions: {
	}
});
