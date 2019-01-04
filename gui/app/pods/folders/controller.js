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
import { inject as service } from '@ember/service';
import { notEmpty } from '@ember/object/computed';
import AuthMixin from '../../mixins/auth';
import Modals from '../../mixins/modal';
import Controller from '@ember/controller';

export default Controller.extend(AuthMixin, Modals, {
	appMeta: service(),
	folderService: service('folder'),

	spaceName: '',
	copyTemplate: true,
	copyPermission: true,
	copyDocument: false,
	hasClone: notEmpty('clonedSpace.id'),
	clonedSpace: null,

	selectedView: 'all',
	selectedSpaces: null,
	publicSpaces: null,
	protectedSpaces: null,
	personalSpaces: null,

	actions: {
		onShowModal() {
			this.modalOpen('#add-space-modal', {'show': true}, '#new-space-name');
		},

		onCloneSpaceSelect(sp) {
			this.set('clonedSpace', sp)
		},

		onAddSpace(e) {
			e.preventDefault();

			let spaceName = this.get('spaceName');
			let clonedId = this.get('clonedSpace.id');

			if (is.empty(spaceName)) {
				$("#new-space-name").addClass("is-invalid").focus();
				return false;
			}

			let payload = {
				name: spaceName,
				cloneId: clonedId,
				copyTemplate: this.get('copyTemplate'),
				copyPermission: this.get('copyPermission'),
				copyDocument: this.get('copyDocument'),
			}

			this.set('spaceName', '');
			this.set('clonedSpace', null);
			$("#new-space-name").removeClass("is-invalid");

			this.modalClose('#add-space-modal');

			this.get('folderService').add(payload).then((sp) => {
				this.get('folderService').setCurrentFolder(sp);
				this.transitionToRoute('folder', sp.get('id'), sp.get('slug'));
			});
		},

		onSelect(view) {
			this.set('selectedView', view);

			switch(view) {
				case 'all':
					this.set('selectedSpaces', this.get('model.spaces'));
					break;
				case 'public':
					this.set('selectedSpaces', this.get('publicSpaces'));
					break;
				case 'protected':
					this.set('selectedSpaces', this.get('protectedSpaces'));
					break;
				case 'personal':
					this.set('selectedSpaces', this.get('personalSpaces'));
					break;
				default:
					this.set('selectedSpaces', this.get(view));
					break;
			}
		}
	}
});
