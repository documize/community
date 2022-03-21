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

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import AuthMixin from '../../mixins/auth';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(AuthMixin, Notifier, {
	router: service(),
	spaceSvc: service('folder'),
	sectionSvc: service('section'),
	i18n: service(),

	showDeleteDialog: false,
	deleteBlockId: '',

	isSpaceAdmin: computed('permissions', function() {
		return this.get('permissions.spaceOwner') || this.get('permissions.spaceManage');
	}),

	didReceiveAttrs() {
		this._super(...arguments);

		if (!this.get('isSpaceAdmin')) return;

		this.get('sectionSvc').getSpaceBlocks(this.get('space.id')).then((blocks) => {
			this.set('blocks', blocks);
		});
	},

	actions: {
		onShowDeleteDialog(id) {
			this.set('showDeleteDialog', true);
			this.set('deleteBlockId', id);
		},

		onEdit(id) {
			this.get('router').transitionTo('folder.block', this.get('space.id'), this.get('space.slug'), id);
		},

		onDeleteBlock() {
			this.set('showDeleteDialog', false);

			let id = this.get('deleteBlockId');

			this.get('sectionSvc').deleteBlock(id).then(() => {
				this.set('deleteBlockId', '');
				this.notifySuccess(this.i18n.localize('deleted'));

				this.get('sectionSvc').getSpaceBlocks(this.get('space.id')).then((blocks) => {
					this.set('blocks', blocks);
				});
			});

			return true;
		}
	}
});
