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
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { empty } from '@ember/object/computed';
import AuthMixin from '../../mixins/auth';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(AuthMixin, Notifier, {
	router: service(),
	spaceSvc: service('folder'),
	localStorage: service('localStorage'),

	isSpaceAdmin: computed('permissions', function() {
		return this.get('permissions.spaceOwner') || this.get('permissions.spaceManage');
	}),

	spaceName: '',
	hasNameError: empty('spaceName'),
	spaceTypeOptions: A([]),
	spaceType: 0,
	likes: '',
	allowLikes: false,

	didReceiveAttrs() {
		this._super(...arguments);

		let constants = this.get('constants');
		let folder = this.get('space');

		let spaceTypeOptions = A([]);
		spaceTypeOptions.pushObject({id: constants.SpaceType.Private, label: 'Private - viewable only by me'});
		spaceTypeOptions.pushObject({id: constants.SpaceType.Protected, label: 'Protected - access is restricted to selected users'});
		spaceTypeOptions.pushObject({id: constants.SpaceType.Public, label: 'Public - can be seen by everyone'});
		this.set('spaceTypeOptions', spaceTypeOptions);
		this.set('spaceType', spaceTypeOptions.findBy('id', folder.get('spaceType')));

		this.set('allowLikes', folder.get('allowLikes'));

		if (this.get('allowLikes')) {
			this.set('likes', folder.get('likes'));
		} else {
			this.set('likes', 'Did this help you?');
		}

		this.set('spaceName', this.get('space.name'));
	},

	actions: {
		onSetSpaceType(t) {
			this.set('spaceType', t);
		},

		// onSetLikes(l) {
		// 	this.set('allowLikes', l);

		// 	schedule('afterRender', () => {
		// 		if (l) this.$('#space-likes-prompt').focus();
		// 	});
		// },

		onSave() {
			if (!this.get('isSpaceAdmin')) return;

			let space = this.get('space');
			space.set('spaceType', this.get('spaceType.id'));

			let allowLikes = this.get('allowLikes');
			space.set('likes', allowLikes ? this.get('likes') : '');

			let spaceName = this.get('spaceName').trim();
			if (spaceName.length === 0) return;
			space.set('name', spaceName);

			this.get('spaceSvc').save(space).then(() => {
				this.notifySuccess('Saved');
			});
		}
	}
});
