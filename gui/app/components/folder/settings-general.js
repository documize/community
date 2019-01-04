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
	spaceLifecycleOptions: A([]),
	spaceLifecycle: null,
	iconList: A([]),
	spaceIcon: '',
	spaceDesc: '',
	spaceLabel: '',

	init() {
		this._super(...arguments);

		this.populateIconList();
	},

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
		this.set('spaceDesc', this.get('space.desc'));
		this.set('spaceLabel', this.get('space.labelId'));

		let icon = this.get('space.icon');
		if (is.empty(icon)) {
			icon = constants.IconMeta.Apps;
		}

		this.set('spaceIcon', icon);
	},

	populateIconList() {
		let list = this.get('iconList');
		let constants = this.get('constants');

		list = A([]);

		list.pushObject(constants.IconMeta.Star);
		list.pushObject(constants.IconMeta.Support);
		list.pushObject(constants.IconMeta.Message);
		list.pushObject(constants.IconMeta.Apps);
		list.pushObject(constants.IconMeta.Box);
		list.pushObject(constants.IconMeta.Gift);
		list.pushObject(constants.IconMeta.Design);
		list.pushObject(constants.IconMeta.Bulb);
		list.pushObject(constants.IconMeta.Metrics);
		list.pushObject(constants.IconMeta.PieChart);
		list.pushObject(constants.IconMeta.BarChart);
		list.pushObject(constants.IconMeta.Finance);
		list.pushObject(constants.IconMeta.Lab);
		list.pushObject(constants.IconMeta.Code);
		list.pushObject(constants.IconMeta.Help);
		list.pushObject(constants.IconMeta.Manuals);
		list.pushObject(constants.IconMeta.Flow);
		list.pushObject(constants.IconMeta.Out);
		list.pushObject(constants.IconMeta.In);
		list.pushObject(constants.IconMeta.Partner);
		list.pushObject(constants.IconMeta.Org);
		list.pushObject(constants.IconMeta.Home);
		list.pushObject(constants.IconMeta.Infinite);
		list.pushObject(constants.IconMeta.Todo);
		list.pushObject(constants.IconMeta.Procedure);
		list.pushObject(constants.IconMeta.Outgoing);
		list.pushObject(constants.IconMeta.Incoming);
		list.pushObject(constants.IconMeta.Travel);
		list.pushObject(constants.IconMeta.Winner);
		list.pushObject(constants.IconMeta.Roadmap);
		list.pushObject(constants.IconMeta.Money);
		list.pushObject(constants.IconMeta.Security);
		list.pushObject(constants.IconMeta.Tune);
		list.pushObject(constants.IconMeta.Guide);
		list.pushObject(constants.IconMeta.Smile);
		list.pushObject(constants.IconMeta.Rocket);
		list.pushObject(constants.IconMeta.Time);
		list.pushObject(constants.IconMeta.Cup);
		list.pushObject(constants.IconMeta.Marketing);
		list.pushObject(constants.IconMeta.Announce);
		list.pushObject(constants.IconMeta.Devops);
		list.pushObject(constants.IconMeta.World);
		list.pushObject(constants.IconMeta.Plan);
		list.pushObject(constants.IconMeta.Components);
		list.pushObject(constants.IconMeta.People);
		list.pushObject(constants.IconMeta.Checklist);

		this.set('iconList', list);
	},

	actions: {
		onSetSpaceType(t) {
			this.set('spaceType', t);
		},

		onSetSpaceLifecycle(l) {
			this.set('spaceLifecycle', l);
		},

		onSetIcon(icon) {
			this.set('spaceIcon', icon);
		},

		onSetLabel(id) {
			this.set('spaceLabel', id);
		},

		onSave() {
			if (!this.get('isSpaceAdmin')) return;

			let space = this.get('space');
			space.set('spaceType', this.get('spaceType.id'));

			let allowLikes = this.get('allowLikes');
			space.set('likes', allowLikes ? this.get('likes') : '');

			let spaceName = this.get('spaceName').trim();
			if (spaceName.length === 0) return;
			space.set('name', spaceName);

			space.set('icon', this.get('spaceIcon'));
			space.set('desc', this.get('spaceDesc'));
			space.set('labelId', this.get('spaceLabel'));

			this.get('spaceSvc').save(space).then(() => {
				this.notifySuccess('Saved');
			});
		}
	}
});
