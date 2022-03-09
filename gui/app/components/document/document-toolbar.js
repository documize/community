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
import AuthMixin from '../../mixins/auth';
import ModalMixin from '../../mixins/modal';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(ModalMixin, AuthMixin, Notifier, {
	store: service(),
	spaceSvc: service('folder'),
	session: service(),
	appMeta: service(),
	pinned: service(),
	browserSvc: service('browser'),
	documentSvc: service('document'),
	i18n: service(),
	showRevisions: computed('permissions', 'document.protection', function() {
		if (!this.get('session.authenticated')) return false;
		if (!this.get('session.viewUsers')) return false;
		if (this.get('document.protection') === this.get('constants').ProtectionType.None) return true;
		if (this.get('document.protection') === this.get('constants').ProtectionType.Review && this.get('permissions.documentApprove')) return true;

		return false;
	}),
	showActivity: computed('permissions', function() {
		if (this.get('appMeta.edition') !== this.get('constants').Product.EnterpriseEdition) return false;
		if (!this.get('session.authenticated')) return false;
		if (!this.get('session.viewUsers')) return false;
		if (this.get('permissions.spaceView')) return true;

		return false;
	}),
	hasToolbar: computed('permissions', 'showRevisions', 'showActivity', function() {
		if (this.get('showRevisions') || this.get('showActivity')) return true;
		if (this.get('permissions.documentAdd') || this.get('permissions.documentDelete')) return true;
		if (this.get('appMeta.edition') === this.get('constants').Product.EnterpriseEdition &&
			this.get('permissions.documentEdit')) return true;

	}),
	duplicateName: '',

	init() {
		this._super(...arguments);

		this.pinState = {
			isPinned: false,
			pinId: '',
			newName: ''
		};

		this.saveTemplate = {
			name: '',
			description: ''
		};
	},

	didReceiveAttrs() {
		this._super(...arguments);

		let doc = this.get('document');

		this.get('pinned').isDocumentPinned(doc.get('id')).then((pinId) => {
			this.set('pinState.pinId', pinId);
			this.set('pinState.isPinned', pinId !== '');
			this.set('pinState.newName', doc.get('name'));
		});

		this.set('saveTemplate.name', this.get('document.name'));
		this.set('saveTemplate.description', this.get('document.excerpt'));
	},

	willDestroyElement() {
		this._super(...arguments);
	},

	actions: {
		onShowTemplateModal() {
			this.modalOpen("#document-template-modal", {show:true}, "#new-template-name");
		},

		onShowDuplicateModal() {
			this.modalOpen("#document-duplicate-modal", {show:true}, "#duplicate-name");
		},

		onShowDeleteModal() {
			this.modalOpen("#document-delete-modal", {show:true});
		},

		onDocumentDelete() {
			this.modalClose('#document-delete-modal');

			let cb = this.get('onDocumentDelete');
			cb();
		},

		onShowPrintModal() {
			let pages = this.get('pages');

			// By default we select everything for print.
			pages.forEach((item) => {
				item.set('printSelected', true);
			});

			this.set('pages', pages);

			this.modalOpen("#document-print-modal", {show:true});
		},

		onPrintSelection() {
			this.modalClose('#document-print-modal');

			let pages = this.get('pages');
			pages.forEach((item) => {
				let pageId = item.get('page.id');
				let selected = item.get('printSelected');
				$(`#page-${pageId}`).addClass('non-printable');
				$(`#page-spacer-${pageId}`).addClass('non-printable');

				if (selected) {
					$(`#page-${pageId}`).removeClass('non-printable');
					$(`#page-spacer-${pageId}`).removeClass('non-printable');
				}
			});

			window.print();
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
				documentId: this.get('document.id'),
				spaceId: this.get('space.id')
			};

			this.get('pinned').pinItem(pin).then((pin) => {
				this.set('pinState.isPinned', true);
				this.set('pinState.pinId', pin.get('id'));
				this.eventBus.publish('pinChange');
			});

			return true;
		},

		onSaveTemplate() {
			let name = this.get('saveTemplate.name');
			let excerpt = this.get('saveTemplate.description');

			if (_.isEmpty(name)) {
				$("#new-template-name").addClass("is-invalid").focus();
				return;
			}

			if (_.isEmpty(excerpt)) {
				$("#new-template-desc").addClass("is-invalid").focus();
				return;
			}

			$("#new-template-name").removeClass("is-invalid");
			$("#new-template-desc").removeClass("is-invalid");

			this.set('saveTemplate.name', '');
			this.set('saveTemplate.description', '');

			let cb = this.get('onSaveTemplate');
			cb(name, excerpt);

			this.modalClose('#document-template-modal');

			return true;
		},

		onDuplicate() {
			let name = this.get('duplicateName');

			if (_.isEmpty(name)) {
				$("#duplicate-name").addClass("is-invalid").focus();
				return;
			}

			$("#duplicate-name").removeClass("is-invalid");

			this.set('duplicateName', '');

			this.get('onDuplicate')(name);

			this.modalClose('#document-duplicate-modal');

			return true;
		},

		onExport() {
			let spec = {
				spaceId: this.get('document.spaceId'),
				data: [],
				filterType: 'document',
			};

			spec.data.push(this.get('document.id'));

			this.get('documentSvc').export(spec).then((htmlExport) => {
				this.get('browserSvc').downloadFile(htmlExport, this.get('document.slug') + '.html');
				this.notifySuccess(this.i18n.localize('exported'));
			});
		}
	}
});
