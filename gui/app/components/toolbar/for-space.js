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

import Component from '@ember/component';
import { computed } from '@ember/object';
import { schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';
import TooltipMixin from '../../mixins/tooltip';
import ModalMixin from '../../mixins/modal';
import AuthMixin from '../../mixins/auth';
import stringUtil from '../../utils/string';

export default Component.extend(ModalMixin, TooltipMixin, AuthMixin, {
	spaceService: service('folder'),
	localStorage: service(),
	templateService: service('template'),
	session: service(),
	appMeta: service(),
	pinned: service(),
	spaceName: '',
	copyTemplate: true,
	copyPermission: true,
	copyDocument: false,
	clonedSpace: { id: '' },
	pinState : {
		isPinned: false,
		pinId: '',
		newName: ''
	},
	spaceSettings: computed('permissions', function() {
		return this.get('permissions.spaceOwner') || this.get('permissions.spaceManage');
	}),
	deleteSpaceName: '',
	inviteEmail: '',
	inviteMessage: '',
	hasTemplates: computed('templates', function() {
		return this.get('templates.length') > 0;
	}),
	emptyDocName: '',
	emptyDocNameError: false,
	templateDocName: '',
	templateDocNameError: false,
	selectedTemplate: '',
	importedDocuments: [],
	importStatus: [],
	dropzone: null,

	didReceiveAttrs() {
		this._super(...arguments);

		let folder = this.get('space');
		let targets = _.reject(this.get('spaces'), {id: folder.get('id')});
		this.set('movedFolderOptions', targets);

		this.get('pinned').isSpacePinned(folder.get('id')).then((pinId) => {
			this.set('pinState.pinId', pinId);
			this.set('pinState.isPinned', pinId !== '');
			this.set('pinState.newName', folder.get('name'));
			this.renderTooltips();
		});

		if (this.get('inviteMessage').length === 0) {
			this.set('inviteMessage', this.getDefaultInvitationMessage());
		}
	},

	didInsertElement() {
		this._super(...arguments);
		this.modalInputFocus('#space-delete-modal', '#delete-space-name');
		this.modalInputFocus('#space-invite-modal', '#space-invite-email');
	},

	willDestroyElement() {
		this._super(...arguments);
		this.removeTooltips();

		if (is.not.null(this.get('dropzone'))) {
			this.get('dropzone').destroy();
			this.set('dropzone', null);
		}		
	},

	getDefaultInvitationMessage() {
		return "Hey there, I am sharing the " + this.get('space.name') + " space (in " + this.get("appMeta.title") + ") with you so we can both collaborate on documents.";
	},

	setupImport() {
		// already done init?
		if (is.not.null(this.get('dropzone'))) {
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
				$('#space-pin-button').tooltip('dispose');
				this.set('pinState.isPinned', false);
				this.set('pinState.pinId', '');
				this.eventBus.publish('pinChange');
				this.renderTooltips();
			});
		},

		onPin() {
			let pin = {
				pin: this.get('pinState.newName'),
				documentId: '',
				folderId: this.get('space.id')
			};

			this.get('pinned').pinItem(pin).then((pin) => {
				$('#space-pin-button').tooltip('dispose');
				this.set('pinState.isPinned', true);
				this.set('pinState.pinId', pin.get('id'));
				this.eventBus.publish('pinChange');
				this.renderTooltips();
			});

			return true;
		},

		onSpaceInvite(e) {
			e.preventDefault();

			var email = this.get('inviteEmail').trim().replace(/ /g, '');
			var message = this.get('inviteMessage').trim();

			if (message.length === 0) {
				message = this.getDefaultInvitationMessage();
			}

			if (email.length === 0) {
				$('#space-invite-email').addClass('is-invalid').focus();
				return;
			}

			var result = {
				Message: message,
				Recipients: []
			};

			// Check for multiple email addresses
			if (email.indexOf(",") > -1) {
				result.Recipients = email.split(',');
			}
			if (email.indexOf(";") > -1 && result.Recipients.length === 0) {
				result.Recipients = email.split(';');
			}

			// Handle just one email address
			if (result.Recipients.length === 0 && email.length > 0) {
				result.Recipients.push(email);
			}

			this.set('inviteEmail', '');

			this.get('spaceService').share(this.get('space.id'), result).then(() => {
				$('#space-invite-email').removeClass('is-invalid');
			});

			this.modalClose('#space-invite-modal');
		},

		onSpaceDelete(e) {
			e.preventDefault();

			let spaceName = this.get('space').get('name');
			let spaceNameTyped = this.get('deleteSpaceName');

			if (spaceNameTyped !== spaceName || spaceNameTyped === '' || spaceName === '') {
				$("#delete-space-name").addClass("is-invalid").focus();
				return;
			}

			this.set('deleteSpaceName', '');
			$("#delete-space-name").removeClass("is-invalid");

			this.attrs.onDeleteSpace(this.get('space.id'));


			this.modalClose('#space-delete-modal');
		},

		onShowEmptyDocModal() {
			this.modalOpen("#empty-doc-modal", {"show": true}, '#empty-doc-name');
		},

		onAddEmptyDoc(e) {
			e.preventDefault();
			let docName = this.get('emptyDocName');

			if (is.empty(docName)) {
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
			if (t.length > 0) {
				t[0].set('selected', true);
				this.modalOpen("#template-doc-modal", {"show": true}, '#template-doc-name');
			}
		},

		onSelectTemplate(i) {
			let t = this.get('templates');
			t.forEach((t) => {
				t.set('selected', false);
			})
			i.set('selected', true);
			this.set('selectedTemplate', i.id);
		},

		onAddTemplateDoc(e) {
			e.preventDefault();
			let docName = this.get('templateDocName');

			if (is.empty(docName)) {
				this.set('templateDocNameError', true);
				$('#template-doc-name').focus();
				return;
			} else {
				this.set('templateDocNameError', false);
				this.set('templateDocName', '');
			}

			let id = this.get('selectedTemplate');
			if (is.empty(id)) {
				return;
			}

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

			status.pushObject(`Converting ${filename}...`);
			documents.push(filename);

			this.set('importStatus', status);
			this.set('importedDocuments', documents);
		},

		onDocumentImported(filename /*, document*/ ) {
			let status = this.get('importStatus');
			let documents = this.get('importedDocuments');

			status.pushObject(`Successfully converted ${filename}`);
			documents.pop(filename);

			this.set('importStatus', status);
			this.set('importedDocuments', documents);

			if (documents.length === 0) {
				this.modalClose("#import-doc-modal");				
				this.attrs.onRefresh();
			}
		},

		onOpenTemplate(e) {
			e.preventDefault();

			let id = this.get('selectedTemplate');
			if (is.empty(id)) {
				return;
			}
			let template = this.get('templates').findBy('id', id)

			this.modalClose("#space-template-modal");
			
			let slug = stringUtil.makeSlug(template.get('title'));
			this.get('router').transitionTo('document', this.get('space.id'), this.get('space.slug'), id, slug);
		}
	}
});
