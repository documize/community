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
import Component from '@ember/component';
import TooltipMixin from '../../mixins/tooltip';

export default Component.extend(TooltipMixin, {
	documentService: service('document'),
	sectionService: service('section'),
	editMode: false,
	editPage: null,
	editMeta: null,

	didReceiveAttrs() {
		this._super(...arguments);
		if (this.get('isDestroyed') || this.get('isDestroying')) return;
		if (this.get('toEdit') === this.get('page.id') && this.get('permissions.documentEdit')) this.send('onEdit');

		if (this.get('session.authenticated')) {
			this.workflow();
		}
	},

	workflow() {
		this.set('editPage', this.get('page'));
        this.set('editMeta', this.get('meta'));
	},

	actions: {
		onSavePage(page, meta) {
			let constants = this.get('constants');

			if (this.get('document.protection') === constants.ProtectionType.Review) {			
				if (this.get('page.status') === constants.ChangeState.Published) {
					page.set('relativeId', this.get('page.id'));
				}
				if (this.get('page.status') === constants.ChangeState.PendingNew) {
					page.set('relativeId', '');
				}
			}

			this.set('editMode', false);
			let cb = this.get('onSavePage');
			cb(page, meta);
		},

		onSavePageAsBlock(block) {
			let cb = this.get('onSavePageAsBlock');
			cb(block);
		},

		onCopyPage(documentId) {
			let cb = this.get('onCopyPage');
			cb(this.get('page.id'), documentId);
		},

		onMovePage(documentId) {
			let cb = this.get('onMovePage');
			cb(this.get('page.id'), documentId);
		},

		onDeletePage(deleteChildren) {
			let page = this.get('page');

			if (is.undefined(page)) {
				return;
			}

			let params = {
				id: page.get('id'),
				title: page.get('title'),
				children: deleteChildren
			};

			let cb = this.get('onDeletePage');
			cb(params);
		},

		// Calculate if user is editing page or a pending change as per approval process
		onEdit() {
			if (this.get('editMode')) return;
			this.get('toEdit', '');
			this.set('editMode', true);
		},

		onCancelEdit() {
			this.set('editMode', false);
		}
	}
});
