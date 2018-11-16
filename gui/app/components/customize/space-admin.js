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
import { computed } from '@ember/object';
import Notifier from '../../mixins/notifier';
import Modals from '../../mixins/modal';
import Component from '@ember/component';

export default Component.extend(Notifier, Modals, {
	spaceSvc: service('folder'),
	browserSvc: service('browser'),
	documentSvc: service('document'),
	spaces: null,

	label: computed('model', function() {
		switch (this.get('model').length) {
		case 1:
			return "space";
		default:
			return "spaces";
		}
	}),

	init() {
		this._super(...arguments);

		this.loadData();
	},

	didReceiveAttrs() {
		this._super(...arguments);

		this.deleteSpace = {
			id: '',
			name: ''
		};
	},

	loadData() {
		this.get('spaceSvc').manage().then((s) => {
			this.set('spaces', s);
		});
	},

	actions: {
		onShow(id) {
			this.set('deleteSpace.id', id);
		},

		onDelete() {
			let deleteSpace = this.get('deleteSpace');
			let spaceId = deleteSpace.id;
			let spaceNameTyped = deleteSpace.name;
			let space = this.get('spaces').findBy('id', spaceId);
			let spaceName = space.get('name');

			if (spaceNameTyped !== spaceName || spaceNameTyped === '' || spaceName === '') {
				$('#delete-space-name').addClass('is-invalid').focus();
				return;
			}

			$('#space-delete-modal').modal('hide');
			$('#space-delete-modal').modal('dispose');

			this.get('spaceSvc').delete(spaceId).then(() => { /* jshint ignore:line */
				this.set('deleteSpace.id', '');
				this.set('deleteSpace.name', '');
				this.loadData();
			});
		},

		onExport() {
			this.showWait();

			let spec = {
				spaceId: '',
				data: _.pluck(this.get('folders'), 'id'),
				filterType: 'space',
			};

			this.get('documentSvc').export(spec).then((htmlExport) => {
				this.get('browserSvc').downloadFile(htmlExport, 'documize.html');
				this.showDone();
			});
		},

		onOwner(spaceId) {
			this.showWait();

			this.get('spaceSvc').grantOwnerPermission(spaceId).then(() => { /* jshint ignore:line */
				this.showDone();
			});
		}
	}
});
