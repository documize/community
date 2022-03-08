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
import { computed } from '@ember/object';
import { schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';
import ModalMixin from '../../mixins/modal';
import AuthMixin from '../../mixins/auth';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(ModalMixin, AuthMixin, Notifier, {
	spaceService: service('folder'),
	localStorage: service(),
	templateService: service('template'),
	browserSvc: service('browser'),
	documentSvc: service('document'),
	session: service(),
	appMeta: service(),
	pinned: service(),
	i18n: service(),
	spaceName: '',
	copyTemplate: true,
	copyPermission: true,
	copyDocument: false,
	spaceSettings: computed('permissions', function() {
		return this.get('permissions.spaceOwner') || this.get('permissions.spaceManage');
	}),
	deleteSpaceName: '',
	hasTemplates: computed('templates', function() {
		return this.get('templates.length') > 0;
	}),
	hasCategories: computed('categories', function() {
		return this.get('categories.length') > 0;
	}),
	hasDocuments: computed('documents', function() {
		return this.get('documents.length') > 0;
	}),
	emptyDocName: '',
	emptyDocNameError: false,
	templateDocName: '',
	templateDocNameError: false,
	selectedTemplate: '',
	dropzone: null,

	init() {
		this._super(...arguments);
		this.importedDocuments = [];
		this.importStatus = [];
		this.clonedSpace = { id: '' };
		this.pinState = {
			isPinned: false,
			pinId: '',
			newName: ''
		};
	},

	didReceiveAttrs() {
		this._super(...arguments);

		let folder = this.get('space');
		let targets = _.reject(this.get('spaces'), {id: folder.get('id')});
		this.set('movedFolderOptions', targets);

		this.get('pinned').isSpacePinned(folder.get('id')).then((pinId) => {
			this.set('pinState.pinId', pinId);
			this.set('pinState.isPinned', pinId !== '');
			this.set('pinState.newName', folder.get('name'));
		});

		let cats = this.get('categories');
		cats.forEach((cat) => {
			cat.set('exportSelected', false);
		});
	},

	didInsertElement() {
		this._super(...arguments);
		this.modalInputFocus('#space-delete-modal', '#delete-space-name');
		this.modalInputFocus('#space-invite-modal', '#space-invite-email');
	},

	willDestroyElement() {
		this._super(...arguments);

		if (!_.isNull(this.get('dropzone'))) {
			this.get('dropzone').destroy();
			this.set('dropzone', null);
		}
	},

	setupImport() {
		// already done init?
		if (!_.isNull(this.get('dropzone'))) {
			this.get('dropzone').destroy();
			this.set('dropzone', null);
		}

		let self = this;
		let folderId = this.get('space.id');
		let url = this.get('appMeta.endpoint');
		let importUrl = `${url}/import/folder/${folderId}`;

		let dzone = new Dropzone("#import-document-button", {
			headers: { 'Authorization': 'Bearer ' + self.get('session.session.content.authenticated.token') },
			url: importUrl,
			method: "post",
			paramName: 'attachment',
			acceptedFiles: ".doc,.docx,.md,.markdown,.htm,.html",
			clickable: true,
			maxFilesize: 10,
			parallelUploads: 3,
			uploadMultiple: false,
			addRemoveLinks: false,
			autoProcessQueue: true,

			init: function () {
				this.on("success", function (document) {
					self.send('onDocumentImported', document.name, document);
				});

				this.on("error", function (x) {
					console.log("Conversion failed for", x.name, x); // eslint-disable-line no-console
				});

				// this.on("queuecomplete", function () {});

				this.on("addedfile", function (file) {
					self.send('onDocumentImporting', file.name);
				});
			}
		});

		dzone.on("complete", function (file) {
			dzone.removeFile(file);
		});

		this.set('dropzone', dzone);
	},

	actions: {
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
				spaceId: this.get('space.id')
			};

			this.get('pinned').pinItem(pin).then((pin) => {
				this.set('pinState.isPinned', true);
				this.set('pinState.pinId', pin.get('id'));
				this.eventBus.publish('pinChange');
			});

			return true;
		},

		onShowEmptyDocModal() {
			this.modalOpen("#empty-doc-modal", {"show": true}, '#empty-doc-name');
		},

		onAddEmptyDoc(e) {
			e.preventDefault();
			let docName = this.get('emptyDocName');

			if (_.isEmpty(docName)) {
				this.set('emptyDocNameError', true);
				$('#empty-doc-name').focus();
				return;
			} else {
				this.set('emptyDocNameError', false);
				this.set('emptyDocName', '');
			}

			this.modalClose("#empty-doc-modal");

			this.get('templateService').importSavedTemplate(this.get('space.id'), '0', docName).then((document) => {
				this.get('router').transitionTo('document', this.get('space.id'), this.get('space.slug'), document.get('id'), document.get('slug'));
			});
		},

		onShowTemplateDocModal() {
			let t = this.get('templates');
			t.forEach((t) => {
				t.set('selected', false);
			});
			this.modalOpen("#template-doc-modal", {"show": true}, '#template-doc-name');
		},

		onSelectTemplate(i) {
			let t = this.get('templates');
			t.forEach((t) => {
				t.set('selected', false);
			});
			i.set('selected', true);
			this.set('selectedTemplate', i.id);
		},

		onAddTemplateDoc(e) {
			e.preventDefault();
			let docName = this.get('templateDocName');

			if (_.isEmpty(docName)) {
				this.set('templateDocNameError', true);
				$('#template-doc-name').focus();
				return;
			}

			let id = this.get('selectedTemplate');
			if (_.isEmpty(id)) {
				$('#widget-list-picker').addClass('is-invalid');
				return;
			}

			this.set('templateDocNameError', false);
			this.set('templateDocName', '');

			this.modalClose("#template-doc-modal");

			this.get('templateService').importSavedTemplate(this.get('space.id'), id, docName).then((document) => {
				this.get('router').transitionTo('document', this.get('space.id'), this.get('space.slug'), document.get('id'), document.get('slug'));
			});
		},

		onShowImportDocModal() {
			this.modalOpen("#import-doc-modal", {"show": true});

			this.setupImport();
			this.modalOnShown('#import-doc-modal', function() {
				schedule('afterRender', ()=> {
				});
			});
		},

		onDocumentImporting(filename) {
			let status = this.get('importStatus');
			let documents = this.get('importedDocuments');

			status.pushObject(this.i18n.localize('import_convert', filename));
			documents.push(filename);

			this.set('importStatus', status);
			this.set('importedDocuments', documents);
		},

		onDocumentImported(filename /*, document*/ ) {
			let status = this.get('importStatus');
			let documents = this.get('importedDocuments');

			status.pushObject(this.i18n.localize('import_success', filename));
			documents.pop(filename);

			this.set('importStatus', status);
			this.set('importedDocuments', documents);

			if (documents.length === 0) {
				this.modalClose("#import-doc-modal");
				let cb = this.get('onRefresh');
				cb();
			}
		},

		onShowExport() {
			this.modalOpen("#space-export-modal", {"show": true});
		},

		onExport() {
			let spec = {
				spaceId: this.get('space.id'),
				data: [],
				filterType: '',
			};

			let cats = this.get('categories');
			cats.forEach((cat) => {
				if (cat.get('exportSelected')) spec.data.push(cat.get('id'));
			});

			if (spec.data.length > 0) {
				spec.filterType = 'category';
			} else {
				spec.filterType = 'space';
				spec.data.push(this.get('space.id'));
			}

			this.get('documentSvc').export(spec).then((htmlExport) => {
				this.get('browserSvc').downloadFile(htmlExport, this.get('space.slug') + '.html');
				this.notifySuccess(this.i18n.localize('exported'));
			});

			this.modalClose("#space-export-modal");
		}
	}
});
